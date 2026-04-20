const addImageBtn = document.getElementById("addImageBtn");
const newCollageBtn = document.getElementById("newCollageBtn");
const fileInput = document.getElementById("fileInput");

const leftPanel = document.getElementById("leftPanel");
const mainPanel = document.getElementById("mainPanel");
const bottomPanel = document.getElementById("bottomPanel");

let collages = {};
let currentCollage = null;
let collageCount = 0;

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
    y: 50
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

    // Click to show filename
    img.addEventListener("click", () => {
      bottomPanel.innerText = imgData.name;
    });

    makeDraggable(img, imgData);

    mainPanel.appendChild(img);
  });
}

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