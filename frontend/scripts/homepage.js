(() => {
  // Constants for localStorage key for gardens
  const GARDEN_KEY = "gardens";
  let currentEditGardenId = "";
  let currentEditGardenIndex = -1;

  // Function to render the list of gardens on the homepage
  function renderGardens() {
    const gardenList = document.getElementById("garden-list");
    const template = document.getElementById("garden-item-template");
    // Clear the current list of gardens
    gardenList.innerHTML = "";

    // Retrieve the gardens from localStorage, or use an empty array if none exist
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];

    gardens.forEach((garden, index) => {
      // Clone the template for each garden and populate it with data
      const gardenItem = template.content.cloneNode(true);
      const gardenItemElement = gardenItem.querySelector(".garden-item");
      gardenItemElement.dataset.id = String(garden.id || "");
      gardenItemElement.dataset.index = String(index);
      gardenItem.querySelector(".garden-image").src =
        garden.image || "default-garden.jpg";
      gardenItem.querySelector(".garden-name").textContent =
        garden.name || "Unnamed Garden";
      // Append the garden item to the garden list
      gardenList.appendChild(gardenItem);
    });
  }
  // Call renderGardens when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", renderGardens);

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
    currentEditGardenId = String(gardenId || "");
    currentEditGardenIndex = Number(gardenIndex);

    const span = document.getElementsByClassName("close")[0];

    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];
    const selectedGarden =
      gardens.find((garden) => String(garden.id) === String(gardenId)) ||
      gardens[Number(gardenIndex)];

    const imageInput = document.getElementById("image-url-input");
    const nameInput = document.getElementById("garden-name-input");

    imageInput.value = selectedGarden?.image || selectedGarden?.imageUrl || "";
    nameInput.value = selectedGarden?.name || selectedGarden?.gardenName || "";

    modal.style.display = "block";

    span.onclick = function () {
      modal.style.display = "none";
    };
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }

  function saveEditedGarden() {
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];
    const imageInput = document.getElementById("image-url-input");
    const nameInput = document.getElementById("garden-name-input");
    const modal = document.getElementById("myModal");

    const indexById = gardens.findIndex(
      (garden) => String(garden.id) === currentEditGardenId,
    );
    const targetIndex = indexById !== -1 ? indexById : currentEditGardenIndex;

    if (targetIndex < 0 || targetIndex >= gardens.length) {
      return;
    }

    const existingGarden = gardens[targetIndex] || {};
    gardens[targetIndex] = {
      ...existingGarden,
      image: imageInput.value.trim(),
      name: nameInput.value.trim(),
    };

    localStorage.setItem(GARDEN_KEY, JSON.stringify(gardens));
    modal.style.display = "none";
    renderGardens();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("save-image-btn");
    if (saveButton) {
      saveButton.addEventListener("click", saveEditedGarden);
    }
  });

  function editGarden(gardenId, gardenIndex) {
    openEditModal(gardenId, gardenIndex);
  }
  // Event delegation for delete buttons
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-btn")) {
      const gardenItem = event.target.closest(".garden-item");
      const gardenId = gardenItem.dataset.id;
      const gardenIndex = gardenItem.dataset.index;
      editGarden(gardenId, gardenIndex);
    }
  });
})();
