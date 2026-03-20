const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorText = document.getElementById('colorText');
const colorBox = document.getElementById('colorBox');

//const jpeg = require("jpeg-js")
//const convnetjs = require("./convnet")

        



fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const img = new Image();

    img.onload = function () {
      console.log("Image loaded:", img.width, img.height);

      // Show preview
      preview.src = img.src;

      // Set canvas size properly
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

        
      // Draw image
      ctx.drawImage(img, 0, 0);

      try {
        alert("got here 1");
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        //const png = jpeg.decode(data, { useTArray: true })
        let r = 0, g = 0, b = 0;
        let count = 0;
         
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const net = new convnetjs.Net();

fetch("../scripts/tomatomodel.json")
  .then(res => res.json())
  .then(model => {
    net.fromJSON(model);
    console.log("Model loaded!");

    const IMAGE_SIZE = 64;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = IMAGE_SIZE;
    tempCanvas.height = IMAGE_SIZE;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(img, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
    const imageData = tempCtx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
    const data = imageData.data;

    const vol = new convnetjs.Vol(IMAGE_SIZE, IMAGE_SIZE, 3, 0);

    for (let y = 0; y < IMAGE_SIZE; y++) {
      for (let x = 0; x < IMAGE_SIZE; x++) {
        const idx = (y * IMAGE_SIZE + x) * 4;

        vol.set(x, y, 0, data[idx] / 255);
        vol.set(x, y, 1, data[idx + 1] / 255);
        vol.set(x, y, 2, data[idx + 2] / 255);
      }
    }
    const result = net.forward(vol);
    colorText.innerText = `how healthy is this plant?: ${result.w[0] * 100} %`;
    console.log("Prediction:", result.w);
    alert("Prediction done!");
  });

        const rgb = `rgb(${r}, ${g}, ${b})`;
        //colorText.innerText = `Average Color: ${rgb}`;
        //colorText.innerText = `how healthy is this plant?: ${result.w[0]}`;
        alert("got result");
        colorBox.style.backgroundColor = rgb;

        console.log("Average color:", rgb);

      } catch (err) {
        console.error("Canvas error:", err);
      }
    };

    img.onerror = function () {
      console.error("Image failed to load");
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
});