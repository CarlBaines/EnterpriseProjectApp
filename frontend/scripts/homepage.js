(() => {
  let gardensCache = [];
  let currentEditGardenId = null;

  function normalizeGarden(g) {
    return {
      garden_id: g.garden_id ?? g.id,
      garden_name: g.garden_name ?? g.name ?? "Unnamed Garden",
      image_path: g.image_path ?? g.image ?? "default-garden.jpg",
      created_at: g.created_at ?? g.date_created ?? null,
    };
  }

  async function fetchGardens() {
    const response = await fetch(
      `http://127.0.0.1:3002/gardens/user/${encodeURIComponent(userId)}`, {
        credentials: "include"
      }
    );
    const data = await response.json();

    if (!response.ok)
      throw new Error(
        data?.error || data?.message || "Failed to fetch gardens",
      );

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

    // only filter if user actually typed something
    const q = (document.getElementById("search-input")?.value || "").trim();
    if (q) filterGardens();
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
      `http://127.0.0.1:3002/gardens/delete/${gardenId}`,
      {
        method: "DELETE",
        credentials: "include"
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
    if (!modal || !imageInput || !nameInput) return;

    const selected = gardensCache.find(
      (g) => String(g.garden_id) === String(gardenId),
    );
    if (!selected) return;

    currentEditGardenId = selected.garden_id;
    imageInput.value = "";
    nameInput.value = selected.garden_name || "";
    modal.style.display = "block";
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
      `http://127.0.0.1:3002/gardens/update/${currentEditGardenId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Failed to update garden");
    }

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
    if (sortModal) sortModal.style.display = "block";
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

    const sortModal = document.getElementById("sort-modal");
    if (sortModal) sortModal.style.display = "none";
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

    if (event.target.id === "sort-name-asc-btn") sortGardens("nameAsc");
    else if (event.target.id === "sort-name-desc-btn") sortGardens("nameDesc");
    else if (event.target.id === "sort-date-newest-btn") sortGardens("dateAsc");
    else if (event.target.id === "sort-date-oldest-btn")
      sortGardens("dateDesc");
  });

  function filterGardens() {
    const input = document.getElementById("search-input");
    const query = (input?.value || "").toLowerCase().trim();

    const items = document.querySelectorAll("#garden-list .garden-item");
    let visible = 0;

    items.forEach((item) => {
      const nameEl = item.querySelector(".garden-name");
      const name = (nameEl?.textContent || "").toLowerCase();
      const show = query === "" || name.includes(query);

      item.style.display = show ? "" : "none";
      if (show) visible++;
    });

    console.log("filterGardens:", { query, total: items.length, visible });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    setupModalClose("myModal");
    setupModalClose("sort-modal");

    const saveButton = document.getElementById("save-image-btn");
    if (saveButton) saveButton.addEventListener("click", saveEditedGarden);

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = "";
      searchInput.addEventListener("input", filterGardens);
    }

    gardensCache = await fetchGardens();
    await renderGardens();
  });
})();
