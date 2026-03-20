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

      const newGarden = {
        user_id: Number(user_id),
        garden_name: nameInput.value.trim(),
        image_path: dataUrl,
        created_at: timestamp,
        date_created: timestamp, // temp compatibility
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
          // show exact DB/backend error first
          alert(
            "Error saving garden: " +
              (data.error || data.message || "Unknown error"),
          );
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