document.addEventListener('DOMContentLoaded', function() {
    let editMode = false;
    let editingProfileId = null; //  Track which profile is being edited
    const defaultImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
    const sidepanel = document.getElementById("mySidepanel");
    const openBtn = document.querySelector(".openbtn");
    const closeBtn = document.querySelector(".closebtn");
    window.openNav = function() {
        document.getElementById("mySidepanel").style.width = "250px";
    };

    window.closeNav = function() {
        document.getElementById("mySidepanel").style.width = "0";
    };

    openBtn.addEventListener("click", openNav);
    closeBtn.addEventListener("click", closeNav);

    // Load profiles from database when the page loads
    loadProfiles();

    document.getElementById("profileTitle").addEventListener("input", function () {
        const maxLength = 40;
        if (this.value.length > maxLength) {
            this.value = this.value.slice(0, maxLength); // Trim excess characters
        }
    });

    // Event listener to trigger file input when image preview is clicked
    document.getElementById('imagePreview').addEventListener('click', function() {
        document.getElementById('imageUpload').click();
    });

    // Displays the selected image on the form
    document.getElementById("imageUpload").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("imagePreview").src = e.target.result; // Convert image to Base64
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById("imagePreview").src = defaultImageSrc;
        }
    });
    

    function getImageBase64() {
        const imagePreviewElement = document.getElementById('imagePreview');
        return imagePreviewElement.src.includes("Portrait_Placeholder.png") ? null : imagePreviewElement.src;
    }
    

    // Show the profile form when "Create Profile" button is clicked
    document.getElementById('showProfileFormBtn').addEventListener('click', function() {
        resetForm();
        document.getElementById('profileFormContainer').style.display = 'flex';
        document.querySelector('.modal-content h2').textContent = 'Create Character Profile';
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
    });

    // Close the profile form when the "Close" button is clicked
    document.getElementById('closeProfileFormBtn').addEventListener('click', function() {
        document.getElementById('profileFormContainer').style.display = 'none';
        resetForm();
    });

    document.getElementById('createProfileBtn').replaceWith(document.getElementById('createProfileBtn').cloneNode(true));

    document.getElementById('createProfileBtn').addEventListener('click', function() {
        addProfile();
    });

    document.getElementById("getProfilesBtn").addEventListener("click", async function() {

        try {
            const response = await fetch("http://localhost:3000/get-profiles", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            console.log("Fetch Response Status:", response.status); // Debug status code

            if (!response.ok) throw new Error(`Failed to fetch profiles. Status: ${response.status}`);

            const profiles = await response.json();
            console.log("Profiles retrieved:", profiles);

            displayProfiles(profiles);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    });

    //  Modified this function so edits update the database properly
    async function addProfile() {
        const first_name = document.getElementById('profileTitle').value.trim();
        const descriptionInputs = document.getElementsByClassName('profileDescription');
        const middle_name = descriptionInputs[0]?.value.trim() || null;
        const last_name = descriptionInputs[1]?.value.trim() || null;
        const age = descriptionInputs[2]?.value.trim() || null;
        const gender_pronouns = descriptionInputs[3]?.value.trim() || null;
        const character_description = document.getElementById('profileContent').value.trim();

        let imageBase64 = getImageBase64();

        console.log("Sending profile data:", {
            first_name,
            middle_name,
            last_name,
            age,
            gender_pronouns,
            character_description,
            imageBase64
        });
    

        // Convert Image to Base64
        // const imagePreviewElement = document.getElementById('imagePreview');
        // let imageBase64 = imagePreviewElement.src.includes("Portrait_Placeholder.png") ? null : imagePreviewElement.src;

        if (!first_name) {
            alert("Please fill in the required fields *.");
            return;
        }

        const profileData = { first_name, middle_name, last_name, age, gender_pronouns, character_description, image: getImageBase64() };

        try {
            let response;
            if (editMode && editingProfileId) {
                // Updating existing profile using PUT request
                response = await fetch(`http://localhost:3000/update-profile/${editingProfileId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profileData),
                });
            } else {
                // Adding new profile using POST request
                response = await fetch("http://localhost:3000/add-profile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(profileData),
                });
            }

            if (!response.ok) throw new Error("Failed to save profile.");
            alert("Profile saved successfully!");
            loadProfiles(); // Refresh profile list from database
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to save profile.");
        }

        document.getElementById('profileFormContainer').style.display = 'none';
        resetForm();
    }

    //  Updated addProfileCard() to include Edit and Delete buttons
    function addProfileCard(profile) {
        const profileContainer = document.getElementById('profileContainer');
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');

        let imageSrc = profile.image && profile.image.startsWith("data:image") 
        ? profile.image 
        : 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
        onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';"


        profileCard.innerHTML = `
        <img src="${imageSrc}" alt="${profile.first_name}" 
            onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';">
        <div class="profile-name">${profile.first_name} ${profile.last_name || ""}</div>
        <div class="profile-description">${profile.character_description ? profile.character_description.slice(0, 100) : "No description available"}...</div>
        <div class="profile-gender"><strong>Pronouns:</strong> ${profile.gender_pronouns || "Not specified"}</div>
        <div class="profile-actions">
            <button class="edit-btn" data-character_id="${profile.character_id}">Edit</button>
            <button class="delete-btn" data-character_id="${profile.character_id}">Delete</button>
        </div>
    `;
        profileContainer.appendChild(profileCard);

        // Attach event listeners for Edit and Delete buttons
        profileCard.querySelector(".edit-btn").addEventListener("click", function () {
            editProfile(profile);
        });

        profileCard.querySelector(".delete-btn").addEventListener("click", function () {
            deleteProfile(profile.character_id);
        });
    }

    // Added edit functionality
    function editProfile(profile) {
        editMode = true;
        editingProfileId = profile.character_id; //  Store ID of profile being edited

        document.getElementById('profileTitle').value = profile.first_name;
        document.getElementsByClassName('profileDescription')[0].value = profile.middle_name || "";
        document.getElementsByClassName('profileDescription')[1].value = profile.last_name || "";
        document.getElementsByClassName('profileDescription')[2].value = profile.age || "";
        document.getElementsByClassName('profileDescription')[3].value = profile.gender_pronouns || "";
        document.getElementById('profileContent').value = profile.character_description || "";

        document.getElementById("imagePreview").src = profile.image ? profile.image : defaultImageSrc;

        document.getElementById('profileFormContainer').style.display = 'flex';
        document.querySelector('.modal-content h2').textContent = 'Edit Character Profile';
        document.getElementById('createProfileBtn').innerText = 'Save Changes';
    }

    //  Updated deleteProfile function
    async function deleteProfile(character_id) {
        if (!character_id || isNaN(character_id)) {
            alert("Invalid character ID");
            return;
        }

        const confirmDelete = confirm("Are you sure you want to delete this profile?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:3000/delete-profile/${character_id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete profile.");
            }

            alert("Profile deleted successfully!");
            loadProfiles();
        } catch (error) {
            console.error("Error deleting profile:", error);
            alert("Failed to delete profile.");
        }
    }

    async function loadProfiles() {
        try {
            const response = await fetch("http://localhost:3000/get-profiles");
            if (!response.ok) throw new Error("Failed to fetch profiles.");
            
            const profiles = await response.json();
            console.log("Profiles retrieved:", profiles);
    
            const profileContainer = document.getElementById('profileContainer');
            profileContainer.innerHTML = ''; // Clear previous profiles
    
            profiles.forEach((profile) => {
                addProfileCard(profile);
            });
    
        } catch (error) {
            console.error("Error fetching profiles:", error);
        }
    }

    function getImageBase64() {
        const imagePreviewElement = document.getElementById('imagePreview');
        return imagePreviewElement.src.includes("Portrait_Placeholder.png") ? null : imagePreviewElement.src;
    }
    
    function resetForm() {
        document.getElementById('profileTitle').value = '';
        document.getElementsByClassName('profileDescription')[0].value = '';
        document.getElementsByClassName('profileDescription')[1].value = '';
        document.getElementsByClassName('profileDescription')[2].value = '';
        document.getElementsByClassName('profileDescription')[3].value = '';
        document.getElementById('profileContent').value = '';
        document.getElementById('imagePreview').src = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'; // Default placeholder
        document.getElementById('imageUpload').value = ''; // Reset file input
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
        document.querySelector('.modal-content h2').textContent = 'Create Character Profile';
        document.getElementById('profileFormContainer').style.display = 'none';
        editMode = false;
        editingProfileId = null;
    }
    
    

    function toggleSubmenu(submenuId)  {
        const submenu = document.getElementById(submenuId);
        // Toggle visibility of the submenu
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
    }

});
