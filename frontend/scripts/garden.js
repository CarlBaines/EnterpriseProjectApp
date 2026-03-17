((() => {
  const params = new URLSearchParams(window.location.search);
  const gardenId = params.get("id");
  const gardenName = params.get("name");

  function updatePageTitle(name) {
    const titleElement = document.querySelector(".fixed-bar-top h1");
    if (titleElement) {
      titleElement.textContent = name;
    }
  }

  if (gardenName) {
    updatePageTitle(gardenName);
  }
}));
