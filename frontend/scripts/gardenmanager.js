const addImageBtn = document.getElementById("addImageBtn");
const newCollageBtn = document.getElementById("newCollageBtn");
const fileInput = document.getElementById("fileInput");

const leftPanel = document.getElementById("leftPanel");
const mainPanel = document.getElementById("mainPanel");
const bottomPanel = document.getElementById("bottomPanel");

let collages = {};
let currentCollage = null;
let collageCount = 0;
let selectedPlant = null;

// Create new collage
newCollageBtn.addEventListener("click", () => {
  collageCount++;
  const name = `collage${collageCount}`;
  collages[name] = [];

  const div = document.createElement("div");
  div.className = "collage-item";
  div.innerText = name;

  div.addEventListener("click", () => selectCollage(name, div));

  leftPanel.appendChild(div);

  selectCollage(name, div);
});

// Select collage
function selectCollage(name, element) {
  currentCollage = name;

  document.querySelectorAll(".collage-item").forEach(el => {
    el.classList.remove("active");
  });

  element.classList.add("active");

  renderCollage();
}

// Open file picker
addImageBtn.addEventListener("click", () => {
  if (!currentCollage) {
    alert("Create a new collage first");
    return;
  }
  fileInput.click();
});

// Add image
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);

  const imgData = {
  src: url,
  name: file.name,
  x: 50,
  y: 50,
  age: 0,          // in days
  disease: "none", // default
  createdAt: Date.now() // helps auto age tracking
};

  collages[currentCollage].push(imgData);
  renderCollage();
});

// Render images
function renderCollage() {
  mainPanel.innerHTML = "";

  if (!currentCollage) return;

  collages[currentCollage].forEach((imgData, index) => {
    const img = document.createElement("img");
    img.src = imgData.src;
    img.className = "draggable-img";

    img.style.left = imgData.x + "px";
    img.style.top = imgData.y + "px";

    img.addEventListener("click", () => {
    selectedPlant = imgData;
    renderBottomPanel();
    });

    makeDraggable(img, imgData);

    mainPanel.appendChild(img);
  });
}

// NEW AI SHIT I DONT KNOW ABOUT 


function renderBottomPanel() {
  if (!selectedPlant) {
    bottomPanel.innerText = "No image selected";
    return;
  }

  bottomPanel.innerHTML = `
    <span><strong>${selectedPlant.name}</strong></span>
    &nbsp; | Age (days):
    <input type="number" id="ageInput" value="${selectedPlant.age}" min="0" style="width:60px;">
    &nbsp; | Disease:
    <select id="diseaseSelect">
      <option value="none" ${selectedPlant.disease === "none" ? "selected" : ""}>None</option>
      <option value="fungus" ${selectedPlant.disease === "fungus" ? "selected" : ""}>Fungus</option>
    </select>
  `;

  // Hook up events
  document.getElementById("ageInput").addEventListener("input", (e) => {
    selectedPlant.age = parseInt(e.target.value) || 0;
  });

  document.getElementById("diseaseSelect").addEventListener("change", (e) => {
    selectedPlant.disease = e.target.value;
  });
}




function updatePlantAges() {
  const now = Date.now();

  Object.values(collages).forEach(collage => {
    collage.forEach(plant => {
      const days = Math.floor((now - plant.createdAt) / (1000 * 60 * 60 * 24));
      plant.age = days;
    });
  });
}






// NEW AI SHIT I DONT KNOW ABOUT 




// Drag logic
function makeDraggable(element, data) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    element.style.left = x + "px";
    element.style.top = y + "px";

    data.x = x;
    data.y = y;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    element.style.cursor = "grab";
  });
}



setInterval(() => {
  updatePlantAges();
  if (selectedPlant) renderBottomPanel();
}, 60000); // update every minute