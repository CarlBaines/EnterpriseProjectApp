async function getCurrentUser() {
  const response = await fetch("/users/me", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok || !data.loggedIn || !data.userId) {
    throw new Error(data?.message || "You must be logged in to save a garden.");
  }

  return data;
}

async function saveGarden(event) {
  if (event) {
    event.preventDefault();
  }

  const nameInput = document.getElementById("garden-name");
  const imageInput = document.getElementById("garden-image");

  if (!nameInput.value) {
    alert("Please enter a name for your garden.");
    return;
  }

  if (!imageInput.value) {
    alert("Please select an image for your garden.");
    return;
  }

  const dataUrl = await fileToDataUrl(imageInput.files[0]);
  const timestamp = new Date().toISOString();
  const currentUser = await getCurrentUser();

  const newGarden = {
    user_id: Number(currentUser.userId),
    garden_name: nameInput.value.trim(),
    image_path: dataUrl,
    created_at: timestamp,
  };

  try {
    const response = await fetch("/gardens/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(newGarden),
    });

      const data = await response.json();

    if (!response.ok) {
      // Show exact backend/db error to simplify debugging.
      alert("Error saving garden: " + (data.error || data.message || "Unknown error"));
      console.error("Add garden failed:", data);
      return;
    }
  } catch (error) {
    alert("Backend error: " + error.message);
    return;
  }

  window.location.href = "homepage.html";
}

const imageInput = document.getElementById("garden-image");
if (imageInput) {
  imageInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageInput.style.backgroundImage = `url(${e.target.result})`;
        imageInput.style.backgroundSize = "cover";
        imageInput.style.backgroundPosition = "center";
      };
      alert("Image selected: " + imageInput.value);
      reader.readAsDataURL(file);
    }
  });
}

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

window.saveGarden = saveGarden;