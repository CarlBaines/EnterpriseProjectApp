// DOM elements
var loginContainer = document.querySelector(".container");
var usernameInput = document.getElementById("username");
var passwordInput = document.getElementById("password");
var loginBtn = document.getElementById("login-btn");
var dynamicModal = document.getElementById("dynamic-modal");
var dynamicModalTitle = document.getElementById("dynamic-modal-title");
var dynamicModalMessage = document.getElementById("dynamic-modal-message");
var dynamicModalBtn = document.getElementById("dm-nav-btn");

let modalState = null;

function validateLogin() {
  var username = usernameInput.value.trim();
  var password = passwordInput.value.trim();

  // Check if username and password are not empty
  if (username === "" || password === "") {
    // alert('Username and password cannot be empty');
    modalState = "empty";
    determineModalContent(modalState);
    usernameInput.value = "";

    return false;
  }

  if (username.length <= 3 && username.length >= 32) {
    // alert('Username must be at least 3 characters long');
    modalState = "u1";
    determineModalContent(modalState);
    usernameInput.value = "";

    return false;
  }

  if (password.length <= 12 && password.length >= 64) {
    // alert('Password must be at least 12 characters long');
    modalState = "u2";
    determineModalContent(modalState);
    usernameInput.value = "";

    return false;
  }

  // Use fetch API to send login request to the backend
  fetch("http://localhost:3000/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((account) => {
      // Handle the response from the backend (account details match)
      if (account.exists) {
        // alert("Login successful!");
        sessionStorage.setItem("user_id", account.user_id);
        modalState = "success";
        determineModalContent(modalState);
      } else {
        // alert("Invalid username or password!");
        modalState = "invalid";
        determineModalContent(modalState);
        console.log("Login failed:", account.message);
        usernameInput.value = "";
      }
    })
    .catch((err) => {
      alert("An error occurred during login. Please try again later.");
      console.error("Login error:", err);
    });
}

function determineModalContent(description) {
  dynamicModalBtn.onclick = null;
  loginContainer.style.display = "none";
  dynamicModal.style.display = "flex";
  switch (description) {
    case "empty":
      dynamicModalTitle.textContent = "Login Failed";
      dynamicModalMessage.textContent =
        "Username and password cannot be empty!";
      dynamicModalBtn.textContent = "Try Again";
      dynamicModalBtn.onclick = () => {
        dynamicModal.style.display = "none";
        loginContainer.style.display = "flex";
      };
      break;
    case "u1":
      dynamicModalTitle.textContent = "Login Failed";
      dynamicModalMessage.textContent =
        "Username must be between 3 and 32 characters long!";
      dynamicModalBtn.textContent = "Try Again";
      dynamicModalBtn.onclick = () => {
        dynamicModal.style.display = "none";
        loginContainer.style.display = "flex";
      };
      break;
    case "u2":
      dynamicModalTitle.textContent = "Login Failed";
      dynamicModalMessage.textContent =
        "Password must be between 12 and 64 characters long!";
      dynamicModalBtn.textContent = "Try Again";
      dynamicModalBtn.onclick = () => {
        dynamicModal.style.display = "none";
        loginContainer.style.display = "flex";
      };
      break;
    case "success":
      dynamicModalTitle.textContent = "Login Successful";
      dynamicModalMessage.textContent =
        "Welcome back, " + usernameInput.value.trim() + "!";
      dynamicModalBtn.textContent = "Go to Home";
      dynamicModalBtn.onclick = () => {
        window.location.href = "homepage.html";
      };
      break;
    case "invalid":
      dynamicModalTitle.textContent = "Login Failed";
      dynamicModalMessage.textContent = "Invalid username or password!";
      dynamicModalBtn.textContent = "Try Again";
      dynamicModalBtn.onclick = () => {
        dynamicModal.style.display = "none";
        loginContainer.style.display = "flex";
      };
      break;
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    validateLogin();
  });
}
