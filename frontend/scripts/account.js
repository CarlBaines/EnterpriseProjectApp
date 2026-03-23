(() => {
    async function getCurrentUser() {
        const response = await fetch("/users/me", {
            method: "GET",
            credentials: "include"
        });
        const data = await response.json();

        if (!response.ok || !data.loggedIn || !data.username) {
            throw new Error(data?.message || "Failed to fetch logged in user.");
        }

        return data;
    }

    function setupPage(username) {
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.textContent = username;
        }

        const profilePicture = document.getElementById("profile-picture");
        if (profilePicture) {
            profilePicture.onerror = () => {
                profilePicture.src = "../assets/images/user.png";
            };
        }
    }

    function editAccountInformation() {
        console.log("Edit account information clicked");
        const selected = {
            age: document.getElementById("edit-age")?.value,
            gender: document.getElementById("edit-gender")?.value,
        };
        const modal = document.getElementById("edit-modal");
        const imageInput = document.getElementById("edit-profile-picture");
        const ageInput = document.getElementById("edit-age");
        const genderInput = document.getElementById("edit-gender");
        if (!modal || !imageInput || !ageInput || !genderInput){
            console.error("Missing edit modal or input fields");
            return;
        } 

        imageInput.value = "";
        ageInput.value = selected.age || "";
        genderInput.value = selected.gender || "";
        modal.style.display = "block";

        if (modal) {
            const closeBtn = modal.querySelector(".close");
            if (closeBtn) {
                closeBtn.addEventListener("click", () => {
                    modal.style.display = "none";
                });
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const editButton = document.getElementById("edit-btn");
        if (editButton) {
            editButton.addEventListener("click", editAccountInformation);
        }
    });

    // Close modal when clicking outside of it
    const modal = document.getElementById("edit-modal");
    if (modal) {
      window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
      });
    }

    window.onload = async () => {
        try {
            const userData = await getCurrentUser();
            setupPage(userData.username);
        } catch (err) {
            console.error("Error fetching user data:", err);
            window.location.href = "login.html";
        }
        };
})();