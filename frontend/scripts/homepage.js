(() => {
  // Constants for localStorage key for gardens
  const GARDEN_KEY = "gardens";
  let currentEditGardenId = "";
  let currentEditGardenIndex = -1;

  // Function to render the list of gardens on the homepage
  async function renderGardens() {
    const gardenList = document.getElementById("garden-list");
    const template = document.getElementById("garden-item-template");
    gardenList.innerHTML = "";

    const gardens = await fetch("http://localhost:3000/gardens/gardens/user/1") 
    const gardensData = await gardens.json();

    gardensData.forEach((garden) => {
      const gardenItem = template.content.cloneNode(true);
      const gardenItemElement = gardenItem.querySelector(".garden-item");
      gardenItemElement.dataset.garden_id = String(garden.garden_id || "");
      gardenItemElement.dataset.index = String(garden.index || "");
      gardenItem.querySelector(".garden-image").src =
        garden.image_path || "default-garden.jpg";
      gardenItem.querySelector(".garden-name").textContent =
        garden.garden_name || "Unnamed Garden";
      gardenList.appendChild(gardenItem);
    });

    filterGardens();
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

  function deleteGarden(gardenId, gardenIndex) {
    // Retrieve the gardens from localStorage
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];

    const indexById = gardens.findIndex(
      (garden) => String(garden.id) === String(gardenId),
    );
    const targetIndex = indexById !== -1 ? indexById : Number(gardenIndex);

    if (targetIndex < 0 || targetIndex >= gardens.length) {
      return;
    }

    gardens.splice(targetIndex, 1);

    // Save the updated list of gardens back to localStorage
    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardens));
    // Re-render the gardens to reflect the deletion
    renderGardens();
  }
  // Event delegation for delete buttons
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("delete-btn")) {
      const gardenItem = event.target.closest(".garden-item");
      const gardenId = gardenItem.dataset.id;
      const gardenIndex = gardenItem.dataset.index;
      deleteGarden(gardenId, gardenIndex);
    }
  });

  function openEditModal(gardenId, gardenIndex) {
    const modal = document.getElementById("myModal");
    if (!modal) {
      return;
    }

    currentEditGardenId = String(gardenId || "");
    currentEditGardenIndex = Number(gardenIndex);

    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];
    const selectedGarden =
      gardens.find((garden) => String(garden.id) === String(gardenId)) ||
      gardens[Number(gardenIndex)];

    const imageInput = document.getElementById("garden-image");
    const nameInput = document.getElementById("garden-name-input");
    if (!imageInput || !nameInput) {
      return;
    }

    imageInput.value = "";
    nameInput.value = selectedGarden?.name || selectedGarden?.gardenName || "";

    modal.style.display = "block";
  }

  async function saveEditedGarden() {
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];
    const imageInput = document.getElementById("garden-image");
    const nameInput = document.getElementById("garden-name-input");
    const modal = document.getElementById("myModal");
    if (!imageInput || !nameInput || !modal) {
      return;
    }

    const indexById = gardens.findIndex(
      (garden) => String(garden.id) === currentEditGardenId,
    );
    const targetIndex = indexById !== -1 ? indexById : currentEditGardenIndex;

    if (targetIndex < 0 || targetIndex >= gardens.length) {
      return;
    }

    const existingGarden = gardens[targetIndex] || {};
    const dataUrl = imageInput.files[0]
      ? await fileToDataUrl(imageInput.files[0])
      : existingGarden.image || existingGarden.imageUrl || "";

    gardens[targetIndex] = {
      ...existingGarden,
      image: dataUrl,
      name: nameInput.value.trim(),
    };

    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardens));
    modal.style.display = "none";
    renderGardens();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGardens();
    setupModalClose("myModal");
    setupModalClose("sort-modal");

    const saveButton = document.getElementById("save-image-btn");
    if (saveButton) {
      saveButton.addEventListener("click", saveEditedGarden);
    }
  });

  function editGarden(gardenId, gardenIndex) {
    openEditModal(gardenId, gardenIndex);
  }

  function openSortModal() {
    const sortModal = document.getElementById("sort-modal");
    if (!sortModal) {
      return;
    }

    sortModal.style.display = "block";
  }

  // Event delegation for edit buttons
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-btn")) {
      const gardenItem = event.target.closest(".garden-item");
      const gardenId = gardenItem.dataset.id;
      const gardenIndex = gardenItem.dataset.index;
      editGarden(gardenId, gardenIndex);
    }
  });

  document.addEventListener("click", (event) => {
    const sortButton = event.target.closest(".sort-btn");
    if (sortButton) {
      openSortModal();
    }
  });

  async function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!(file instanceof File)) {
            reject(new Error("Input must be a File object"));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Data URL result
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
  }

  function sortGardens(method) {
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];
    if (method === "nameAsc") {
      gardens.sort((a, b) => (a.garden_name || "").localeCompare(b.garden_name || ""));
    } else if (method === "nameDesc") {
      gardens.sort((a, b) => (b.garden_name || "").localeCompare(a.garden_name || ""));
    } else if (method === "dateAsc") {
      gardens.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (method === "dateDesc") {
      gardens.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardens));
    const sortModal = document.getElementById("sort-modal");
    if (sortModal) {
      sortModal.style.display = "none";
    }
    renderGardens();
  }

  document.addEventListener("click", (event) => {
    if (event.target.id === "sort-name-asc-btn") {
      sortGardens("nameAsc");
    } else if (event.target.id === "sort-name-desc-btn") {
      sortGardens("nameDesc");
    } else if (event.target.id === "sort-date-newest-btn") {
      sortGardens("dateAsc");
    } else if (event.target.id === "sort-date-oldest-btn") {
      sortGardens("dateDesc");
    }
  });

  function filterGardens() {
    const searchInput = document.getElementById("search-input");
    const query = (searchInput?.value || "").toLowerCase().trim();

    document.querySelectorAll("#garden-list .garden-item").forEach((item) => {
      const name =
        item.querySelector(".garden-name")?.textContent?.toLowerCase() || "";
      item.style.display = name.includes(query) ? "" : "none";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderGardens();
    setupModalClose("myModal");
    setupModalClose("sort-modal");

    const saveButton = document.getElementById("save-image-btn");
    if (saveButton) {
      saveButton.addEventListener("click", saveEditedGarden);
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", filterGardens);
    }
  });
})();
