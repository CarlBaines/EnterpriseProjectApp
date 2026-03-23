(() => {
    const DEFAULT_PROFILE_IMAGE = "../assets/images/user.png";
    const AGE_GROUP_LABELS = {
        under_18: "Under 18",
        "18_24": "18-24",
        "25_34": "25-34",
        "35_44": "35-44",
        "45_54": "45-54",
        "55_64": "55-64",
        "65_plus": "65+",
        prefer_not_to_say: "Prefer not to say"
    };
    const GENDER_LABELS = {
        male: "Male",
        female: "Female",
        non_binary: "Non-binary",
        prefer_not_to_say: "Prefer not to say"
    };

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

    function setProfilePreviewImage(inputElement, imageSrc) {
        if (!inputElement) {
            return;
        }

        const previewSrc = imageSrc || DEFAULT_PROFILE_IMAGE;
        inputElement.style.backgroundImage = `url(${previewSrc})`;
        inputElement.style.backgroundSize = "cover";
        inputElement.style.backgroundPosition = "center";
    }

    function toReadableLabel(value, lookupMap) {
        if (!value) {
            return "Not specified";
        }

        if (lookupMap[value]) {
            return lookupMap[value];
        }

        return value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (match) => match.toUpperCase());
    }

    function setupPage(userData) {
        const userNameElement = document.getElementById("user-name");
        const ageGroupElement = document.getElementById("user-age");
        const genderElement = document.getElementById("user-gender");

        if (ageGroupElement) {
            ageGroupElement.textContent = toReadableLabel(userData.ageGroup, AGE_GROUP_LABELS);
        }
        if (genderElement) {
            genderElement.textContent = toReadableLabel(userData.gender, GENDER_LABELS);
        }
        if (userNameElement) {
            userNameElement.textContent = userData.username;
        }

        const profilePicture = document.getElementById("profile-picture");
        if (profilePicture) {
            const serverProfileImage = userData.profileImage || userData.profile_picture || userData.profilePicture;
            profilePicture.src = serverProfileImage || DEFAULT_PROFILE_IMAGE;
            profilePicture.onerror = () => {
                profilePicture.src = DEFAULT_PROFILE_IMAGE;
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
        const currentProfileImage = document.getElementById("profile-picture")?.src || DEFAULT_PROFILE_IMAGE;
        setProfilePreviewImage(imageInput, currentProfileImage);
        modal.style.display = "flex";

        const saveButton = document.getElementById("save-account-btn");
        if (saveButton) {
            saveButton.onclick = async () => {
                const newProfileImage = imageInput.files?.[0];
                const newAgeGroup = ageInput.value;
                const newGender = genderInput.value;
                try {
                    const response = await fetch("/users/updateaccountinformation", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            newProfileImage: newProfileImage ? await fileToDataUrl(newProfileImage) : undefined,
                            newAgeGroup: newAgeGroup || undefined,
                            newGender: newGender || undefined
                        }),
                    });
                    const data = await response.json();

                    if (!response.ok) {
                        alert("Error updating account information: " + (data.error || data.message || "Unknown error"));
                        console.error("Account update failed:", data);
                        return;
                    }
                    alert("Account information updated successfully!");
                    try{
                        const userData = await getCurrentUser();
                        setupPage(userData);    
                    } catch (err) {
                        console.error("Error fetching updated user data:", err);
                    }
                    modal.style.display = "none";
                } catch (err) {
                    console.error("Error occurred while sending account update request:", err);
                    alert("Failed to update account information. Please try again later.");
                }
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const editButton = document.getElementById("edit-btn");
        const modal = document.getElementById("edit-modal");
        const closeBtn = modal?.querySelector(".close");
        const imageInput = document.getElementById("edit-profile-picture");

        if (imageInput) {
            imageInput.addEventListener("change", () => {
                const selectedFile = imageInput.files?.[0];
                if (!selectedFile) {
                    return;
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    setProfilePreviewImage(imageInput, event.target?.result);
                };
                reader.readAsDataURL(selectedFile);
            });
        }

        if (editButton) {
            editButton.addEventListener("click", editAccountInformation);
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener("click", () => {
                modal.style.display = "none";
            });
        }

        if (modal) {
            window.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.style.display = "none";
                }
            });
        }
    });

    function fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target?.result);
            }
            reader.onerror = (error) => {
                reject(error);
            }
            reader.readAsDataURL(file);
        });
    }

    window.onload = async () => {
        try {
            const userData = await getCurrentUser();
            setupPage(userData);
        } catch (err) {
            console.error("Error fetching user data:", err);
            window.location.href = "login.html";
        }
        };
})();