// DOM elements
const appLogo = document.getElementById("app-logo");
const loginContainer = document.querySelector(".container");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");7

const mentalHealthModal = document.getElementById("mental-health-modal");
const mhModalTitle = document.getElementById("mh-modal-title");
const mhScaleImg = document.getElementById("mh-scale-img");
const mhRatingSubmitBtn = document.getElementById("mh-submit-btn");

const dynamicModal = document.getElementById("dynamic-modal");
const dynamicModalTitle = document.getElementById("dynamic-modal-title");
const dynamicModalMessage = document.getElementById("dynamic-modal-message");
const dynamicModalBtn = document.getElementById("dm-nav-btn");

const mhForm = document.getElementById("mh-form");
const mhSlider = document.getElementById("mh-slider");
const mhSliderRatingEl = document.getElementById("mh-selected-rating");

const journalEntryForm = document.getElementById("journal-entry-form");
const journalEntryInput = document.getElementById("journal-entry");
const journalEntrySubmitBtn = document.getElementById("journal-submit-btn");


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

  if (username.length <= 2 || username.length >= 32) {
    // alert('Username must be at least 3 characters long');
    modalState = "u1";
    determineModalContent(modalState);
    usernameInput.value = "";

    return false;
  }

  if (password.length <= 12 || password.length >= 64) {
    // alert('Password must be at least 12 characters long');
    modalState = "u2";
    determineModalContent(modalState);
    passwordInput.value = "";

    return false;
  }

  // Use fetch API to send login request to the backend
  fetch("/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // Include cookies for session management
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
        determineModalContent("mh");
        // window.location.href = "homepage.html";
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
    case "mh":
      dynamicModal.style.display = "none";
      mentalHealthModal.style.display = "flex";

      mhForm.style.display = "flex";
      mhScaleImg.style.display = "block";
      journalEntryForm.style.display = "none";
      mhModalTitle.textContent = "How are you feeling today?";

      updateSliderRating();
      break;
    case "valid_mh":
      dynamicModalTitle.textContent = "Mental Health Rating Recorded!";
      dynamicModalMessage.textContent = "Thank you for your response!";
      dynamicModalBtn.textContent = "Home";
      dynamicModalBtn.onclick = () => {
        loginContainer.style.display = "none";
        dynamicModal.style.display = "none";
        mentalHealthModal.style.display = "none";
        window.location.href = "homepage.html";
      }
      break;
    case "invalid_mh":
      dynamicModalTitle.textContent = "Error!";
      dynamicModalMessage.textContent = "Mental Health Response Invalid.";
      dynamicModalBtn.textContent = "Try Again";
      dynamicModalBtn.onclick = () => {
        dynamicModal.style.display = "none";
        mentalHealthModal.style.display = "flex";
      }
      break;
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

async function storeMentalHealthRating() {
  const rating = Number(mhSlider.value);

  if (isNaN(rating) || rating < 1 || rating > 5) {
    determineModalContent("invalid_mh");
    return;
  }

  const response = await fetch("/users/mhrating", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mhrating: rating }),
  });

  const data = await response.json();

  if (response.ok && data.success) {
    if (rating > 3) {
      mentalHealthModal.style.display = "none";
      determineModalContent("valid_mh");
      return;
    }
    displayJournalEntryModal();
  } else {
    determineModalContent("invalid_mh");
  }
}

async function storeJournalEntry(){
  const journalEntry = journalEntryInput.value.trim();

  if(journalEntry === ""){
    journalEntryInput.value = "";
    mentalHealthModal.style.display = "none";
    dynamicModal.style.display = "none";
    loginContainer.style.display = "none";
    window.location.href = "homepage.html";
    return;
  }

  // Sets a reasonable character limit for journal entries (e.g. 65535 characters for TEXT in SQLite)
  if (journalEntry.length > 65535) {
    alert("Journal entry is too long. Please limit to 65535 characters.");
    return;
  }
  
  const response = await fetch("/users/mhjournalentry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mhJournalEntry: journalEntry }),
  });

  const data = await response.json();

  if(response.ok && data.success){
    mentalHealthModal.style.display = "none";
    determineModalContent("valid_mh");
    return;
  } else {
    determineModalContent("invalid_mh");
  }
}

function displayJournalEntryModal() {
  mentalHealthModal.style.display = "flex";
  mhForm.style.display = "none";
  mhScaleImg.style.display = "none";
  appLogo.style.display = "block";
  mhModalTitle.textContent = "Would you like to make a journal entry?";
  journalEntryForm.style.display = "flex";
}

function updateSliderRating() {
  if (!mhSlider || !mhSliderRatingEl) return;

  const rating = Number(mhSlider.value);
  mhSliderRatingEl.textContent = `Selected rating: ${rating}`;
}

if (mhSlider) {
  mhSlider.addEventListener("input", updateSliderRating);
  updateSliderRating();
}

if (loginBtn) {
  loginBtn.addEventListener("click", (event) => {
    event.preventDefault();
    validateLogin();
  });
}

if (mhRatingSubmitBtn) {
  mhRatingSubmitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    storeMentalHealthRating();
  });
}

if(journalEntrySubmitBtn){
  journalEntrySubmitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    storeJournalEntry();
  });
}