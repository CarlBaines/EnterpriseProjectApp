const addImageBtn = document.getElementById("addImageBtn");
const fileInput = document.getElementById("fileInput");

const leftPanel = document.getElementById("leftPanel");
const mainPanel = document.getElementById("mainPanel");
const bottomPanel = document.getElementById("bottomPanel");

let gardens = {};          // store all gardens
let currentGarden = null;  // currently selected garden
let gardenCount = 0;
let selectedPlant = null;

<<<<<<< HEAD
=======
document.addEventListener("click", (event) => {
  if (event.target.id === "backBtn") {
    window.location.href = `homepage.html`;
  }
});

newgardenBtn.addEventListener("click", () => {
  alert("Gardens must be created elsewhere.");
});

>>>>>>> 7ec7b766e67a658350fc06bce50e22353bbbd8b9
// Select garden
function selectgarden(gardenId, element) {
  if (!gardens[gardenId]) {
    console.error("Garden not found in local store:", gardenId);
    return;
  }

  currentGarden = gardens[gardenId];

  document.querySelectorAll(".garden-item").forEach(el => {
    el.classList.remove("active");
  });

  element.classList.add("active");

  rendergarden();
}

// Open file picker
addImageBtn.addEventListener("click", () => {
  if (!currentGarden) {
    alert("Create a new garden first");
    return;
  }
  fileInput.click();
});

// Add image
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

const reader = new FileReader();

reader.onload = function (event) {
  const base64 = event.target.result;

  const imgData = {
    src: base64, // <-- now base64 instead of blob
    name: file.name,
    x: 50,
    y: 50,
    age: 0,
    disease: "none",
    createdAt: Date.now()
  };

  currentGarden.plants.push(imgData);
  rendergarden();
  sendGardenUpdate();
};

reader.readAsDataURL(file);
});

// Render images
function rendergarden() {
  mainPanel.innerHTML = "";

  if (!currentGarden || !currentGarden.plants) return;

  currentGarden.plants.forEach((imgData, index) => {
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
    sendGardenUpdate();
  });

  document.getElementById("diseaseSelect").addEventListener("change", (e) => {
    selectedPlant.disease = e.target.value;
    sendGardenUpdate();
  });
}




function updatePlantAges() {
  const now = Date.now();

  if (!currentGarden) return;

currentGarden.plants.forEach(plant => {
      const days = Math.floor((now - plant.createdAt) / (1000 * 60 * 60 * 24));
      plant.age = days;
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
  if (isDragging) {
    sendGardenUpdate();
  }
  isDragging = false;
  element.style.cursor = "grab";
});
}


function buildGardenPayload(garden) {
  return {
    id: garden.id,
    name: garden.name,
    plants: garden.plants.map((plant, index) => ({
      id: index + 1,
      src: plant.src,
      name: plant.name,
      x: plant.x,
      y: plant.y,
      age: plant.age,
      disease: plant.disease,
      createdAt: plant.createdAt
    }))
  };
}




async function loadGardenFromDB(gardenId, gardenNameFromList) {
  try {
    const res = await fetch(`/gardens/gardeninfo/${gardenId}`);
    const data = await res.json();

    const garden = {
  id: data.id || gardenId,
  name: data.name || gardenNameFromList || `garden${gardenId}`,
      plants: (data.plants || []).map(p => ({
        src: p.src,
        name: p.name,
        x: p.x,
        y: p.y,
        age: p.age,
        disease: p.disease,
        createdAt: p.createdAt
      }))
    };

    // store it
    gardens[garden.id] = garden;

    // add to UI
    addGardenToPanel(garden);

    // auto-select first garden
    if (!currentGarden) {
      currentGarden = garden;
      rendergarden();
    }

  } catch (err) {
    console.error("Failed to load garden:", err);
  }
}


function sendGardenUpdate() {
  if (!currentGarden) return;

  const payload = {
    id: currentGarden.id,
    name: currentGarden.name,
    plants: currentGarden.plants.map((plant, index) => ({
      id: index + 1,
      src: plant.src,
      name: plant.name,
      x: plant.x,
      y: plant.y,
      age: plant.age,
      disease: plant.disease,
      createdAt: plant.createdAt
    }))
  };

  fetch("/gardens/manager/update/gardeninfo", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
    garden_id: currentGarden.id,
    garden_info: JSON.stringify(payload),

    // add this to satisfy backend validation
    garden_name: currentGarden.name
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Garden updated:", data);
  })
  .catch(err => {
    console.error("Error updating garden:", err);
  });
}


function addGardenToPanel(garden) {
  const div = document.createElement("div");
  div.className = "garden-item";
  div.innerText = garden.name;

  div.addEventListener("click", () => selectgarden(garden.id, div));

  leftPanel.appendChild(div);
}





setInterval(() => {
  updatePlantAges();
  if (selectedPlant) renderBottomPanel();
}, 60000); // update every minute



window.addEventListener("load", async () => {
  try {
    // Example endpoint (you will implement this)
    const res = await fetch("/gardens/usergardens");
    const gardenList = await res.json();

for (const g of gardenList) {
  await loadGardenFromDB(g.id, g.name);
}

  } catch (err) {
    console.error("Failed to load gardens list:", err);
  }
});