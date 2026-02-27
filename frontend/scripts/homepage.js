(() => {
  // Constants for localStorage key for gardens
  const GARDEN_KEY = "gardens";

  // Function to render the list of gardens on the homepage
  function renderGardens() {
    const gardenList = document.getElementById("garden-list");
    const template = document.getElementById("garden-item-template");
    // Clear the current list of gardens
    gardenList.innerHTML = "";

    // Retrieve the gardens from localStorage, or use an empty array if none exist
    const gardens = JSON.parse(localStorage.getItem(GARDEN_KEY)) || [];

    gardens.forEach((garden) => {
      // Clone the template for each garden and populate it with data
      const gardenItem = template.content.cloneNode(true);
      gardenItem.querySelector(".garden-image").src = garden.image || "default-garden.jpg";
      gardenItem.querySelector(".garden-name").textContent = garden.name || "Unnamed Garden";
      // Append the garden item to the garden list
      gardenList.appendChild(gardenItem);
    });
  }
  // Call renderGardens when the DOM is fully loaded
  document.addEventListener("DOMContentLoaded", renderGardens);
})(); 