(() => {
  let gardensCache = [];
  let currentEditGardenId = null;
  let searchDebounceTimer = null;
  const DEFAULT_GARDEN_PREVIEW = "../assets/images/image-blank.png";
  const SEARCH_DEBOUNCE_MS = 120;

  function setGardenPreviewImage(inputElement, imagePath) {
    if (!inputElement) {
      return;
    }

    const previewSrc =
      imagePath && imagePath !== "default-garden.jpg"
        ? imagePath
        : DEFAULT_GARDEN_PREVIEW;

    inputElement.style.backgroundImage = `url(${previewSrc})`;

    if (previewSrc === DEFAULT_GARDEN_PREVIEW) {
      inputElement.style.backgroundSize = "120px";
      inputElement.style.backgroundPosition = "calc(50% + 8px) 50%";
      return;
    }

    inputElement.style.backgroundSize = "cover";
    inputElement.style.backgroundPosition = "center";
  }

  function normalizeGarden(g) {
    return {
      garden_id: g.garden_id ?? g.id,
      garden_name: g.garden_name ?? g.name ?? "Unnamed Garden",
      image_path: g.image_path ?? g.image ?? "default-garden.jpg",
      created_at: g.created_at ?? g.date_created ?? null,
    };
  }

  async function fetchGardens() {
    const response = await fetch(`/gardens/user/user_id`, {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch gardens");
    }

    const raw = Array.isArray(data?.gardens)
      ? data.gardens
      : Array.isArray(data)
        ? data
        : [];
    return raw.map(normalizeGarden);
  }

  // Function to render the list of gardens on the homepage
  async function renderGardens() {
    const gardenList = document.getElementById("garden-list");
    const template = document.getElementById("garden-item-template");
    if (!gardenList || !template) {
      console.error("Missing #garden-list or #garden-item-template");
      return;
    }

    gardenList.innerHTML = "";

    gardensCache.forEach((garden) => {
      const node = template.content.cloneNode(true);
      const item = node.querySelector(".garden-item");
      const image = node.querySelector(".garden-image");
      const name = node.querySelector(".garden-name");

      if (!item || !image || !name) {
        console.error(
          "Template missing .garden-item/.garden-image/.garden-name",
        );
        return;
      }

      item.dataset.garden_id = String(garden.garden_id ?? garden.id ?? "");
      image.src = garden.image_path || garden.image || "default-garden.jpg";
      name.textContent = garden.garden_name || garden.name || "Unnamed Garden";

      // force visible before filter
      item.style.display = "";

      gardenList.appendChild(node);
    });

    console.log(
      "Rendered items:",
      gardenList.querySelectorAll(".garden-item").length,
    );

    const q = (document.getElementById("search-input")?.value || "").trim();
    filterGardens(q);
  }

  function normalizeSearchValue(value) {
    return (value || "").toLowerCase().trim().replace(/\s+/g, " ");
  }

  function updateSearchUi(query, visible, total) {
    const searchActionButton = document.getElementById("search-action-btn");
    const feedback = document.getElementById("search-feedback");
    const noResults = document.getElementById("no-results");

    if (searchActionButton) {
      const hasQuery = Boolean(query);
      searchActionButton.classList.toggle("is-clear", hasQuery);
      searchActionButton.disabled = !hasQuery;
      searchActionButton.textContent = hasQuery ? "X" : "";
      searchActionButton.setAttribute(
        "aria-label",
        hasQuery ? "Clear search" : "Search",
      );
    }

    if (feedback) {
      if (!total) {
        feedback.textContent = "";
      } else if (!query) {
        feedback.textContent = `${total} gardens`;
      } else {
        feedback.textContent = `${visible} of ${total} gardens shown`;
      }
    }

    if (noResults) {
      noResults.classList.toggle("hidden", !(query && total > 0 && visible === 0));
    }
  }

  function scheduleSearchFilter() {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      window.requestAnimationFrame(() => {
        filterGardens();
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  function setupModalClose(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
      return;
    }

    const closeButton = modal.querySelector(".close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  async function deleteGarden(gardenId) {
    const response = await fetch(
      `/gardens/delete/${gardenId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to delete garden");
    }

    gardensCache = gardensCache.filter(
      (g) => String(g.garden_id) !== String(gardenId),
    );
    await renderGardens();
  }

  function openEditModal(gardenId) {
    const modal = document.getElementById("myModal");
    const imageInput = document.getElementById("garden-image");
    const nameInput = document.getElementById("garden-name-input");
    nameInput.setCustomValidity("");
    if (!modal || !imageInput || !nameInput) return;

    const selected = gardensCache.find(
      (g) => String(g.garden_id) === String(gardenId),
    );
    if (!selected) return;

    currentEditGardenId = selected.garden_id;
    imageInput.value = "";
    setGardenPreviewImage(imageInput, selected.image_path);
    nameInput.value = selected.garden_name || "";
    modal.style.display = "flex";
  }

  async function saveEditedGarden() {
    if (!currentEditGardenId) return;

    const imageInput = document.getElementById("garden-image");
    const nameInput = document.getElementById("garden-name-input");
    const modal = document.getElementById("myModal");
    if (!imageInput || !nameInput || !modal) return;

    const existing = gardensCache.find(
      (g) => String(g.garden_id) === String(currentEditGardenId),
    );
    if (!existing) return;

    const payload = {
      garden_name: nameInput.value.trim() || existing.garden_name,
      image_path: imageInput.files[0]
        ? await fileToDataUrl(imageInput.files[0])
        : existing.image_path,
    };

    const response = await fetch(
      `/gardens/update/${currentEditGardenId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || "Failed to update garden";

      if (response.status === 409) {
        nameInput.setCustomValidity(message);
        nameInput.reportValidity();
        nameInput.focus();
        return;
      }

      throw new Error(message);
    }

    // clear any previous error if success
    nameInput.setCustomValidity("");

    gardensCache = gardensCache.map((g) =>
      String(g.garden_id) === String(currentEditGardenId)
        ? { ...g, ...payload }
        : g,
    );

    modal.style.display = "none";
    await renderGardens();
  }

  function editGarden(gardenId, gardenIndex) {
    openEditModal(gardenId, gardenIndex);
  }

  function openSortModal() {
    const sortModal = document.getElementById("sort-modal");
    const sortButton = document.querySelector(".sort-btn");
    if (!sortModal || !sortButton) return;

    if (sortModal.classList.contains("open")) {
      sortModal.classList.remove("open");
      return;
    }

    const buttonRect = sortButton.getBoundingClientRect();
    const menuWidth = Math.min(300, Math.floor(window.innerWidth * 0.86));
    const left = Math.min(
      Math.max(10, buttonRect.left),
      Math.max(10, window.innerWidth - menuWidth - 10),
    );

    sortModal.style.left = `${left}px`;
    sortModal.style.top = `${buttonRect.bottom + 8}px`;
    sortModal.classList.add("open");
  }

  function closeSortModal() {
    const sortModal = document.getElementById("sort-modal");
    if (sortModal) sortModal.classList.remove("open");
  }

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) {
        reject(new Error("Input must be a File object"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function sortGardens(method) {
    if (method === "nameAsc") {
      gardensCache.sort((a, b) =>
        (a.garden_name || "").localeCompare(b.garden_name || ""),
      );
    } else if (method === "nameDesc") {
      gardensCache.sort((a, b) =>
        (b.garden_name || "").localeCompare(a.garden_name || ""),
      );
    } else if (method === "dateAsc") {
      gardensCache.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    } else if (method === "dateDesc") {
      gardensCache.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );
    }

    closeSortModal();
    renderGardens();
  }

  document.addEventListener("click", async (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const gardenItem = event.target.closest(".garden-item");
      const gardenId = gardenItem?.dataset.garden_id;
      if (!gardenId) return;
      await deleteGarden(gardenId);
      return;
    }

    if (event.target.classList.contains("edit-btn")) {
      const gardenItem = event.target.closest(".garden-item");
      const gardenId = gardenItem?.dataset.garden_id;
      if (!gardenId) return;
      openEditModal(gardenId);
      return;
    }

    if (event.target.closest(".sort-btn")) {
      openSortModal();
      return;
    }

    if (event.target.id === "sort-name-asc-btn") {
      sortGardens("nameAsc");
      return;
    } else if (event.target.id === "sort-name-desc-btn") {
      sortGardens("nameDesc");
      return;
    } else if (event.target.id === "sort-date-newest-btn") {
      sortGardens("dateAsc");
      return;
    } else if (event.target.id === "sort-date-oldest-btn") {
      sortGardens("dateDesc");
      return;
    }

    const sortModal = document.getElementById("sort-modal");
    if (
      sortModal?.classList.contains("open") &&
      !event.target.closest("#sort-modal") &&
      !event.target.closest(".sort-btn")
    ) {
      closeSortModal();
    }
  });

  function filterGardens(queryOverride) {
    const input = document.getElementById("search-input");
    const query = normalizeSearchValue(
      queryOverride !== undefined ? queryOverride : input?.value,
    );

    const items = document.querySelectorAll("#garden-list .garden-item");
    let visible = 0;

    items.forEach((item) => {
      const nameEl = item.querySelector(".garden-name");
      const name = (nameEl?.textContent || "").toLowerCase();
      const show = query === "" || name.includes(query);

      item.style.display = show ? "" : "none";
      if (show) visible++;
    });

    updateSearchUi(query, visible, items.length);

    console.log("filterGardens:", { query, total: items.length, visible });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    setupModalClose("myModal");

    const saveButton = document.getElementById("save-image-btn");
    if (saveButton) saveButton.addEventListener("click", saveEditedGarden);

    const imageInput = document.getElementById("garden-image");
    if (imageInput) {
      imageInput.addEventListener("change", () => {
        const selectedFile = imageInput.files?.[0];
        if (!selectedFile) {
          const currentGarden = gardensCache.find(
            (g) => String(g.garden_id) === String(currentEditGardenId),
          );
          setGardenPreviewImage(imageInput, currentGarden?.image_path);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          setGardenPreviewImage(imageInput, event.target?.result);
        };
        reader.readAsDataURL(selectedFile);
      });
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = "";
      searchInput.addEventListener("input", scheduleSearchFilter);
      searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          searchInput.value = "";
          filterGardens("");
        }
      });
    }

    const searchActionButton = document.getElementById("search-action-btn");
    if (searchActionButton && searchInput) {
      searchActionButton.addEventListener("click", () => {
        if (searchActionButton.disabled) {
          return;
        }

        searchInput.value = "";
        searchInput.focus();
        filterGardens("");
      });
    }

    gardensCache = await fetchGardens();
    await renderGardens();
  });

  window.addEventListener("resize", closeSortModal);
})();