document.addEventListener('DOMContentLoaded', function() {
    let editMode = false;
    let currentEditIndex = null;
    const defaultImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';

    // Load profiles from localStorage when the page loads
    loadProfiles();

    // Event listener to trigger file input when image preview is clicked
    document.getElementById('imagePreview').addEventListener('click', function() {
        document.getElementById('imageUpload').click();
    });

    // Displays the selected image on the form
    document.getElementById('imageUpload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('imagePreview').alt = '';
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('imagePreview').src = defaultImageSrc;
            document.getElementById('imagePreview').alt = 'Upload Image';
        }
    });

    // Show the profile form when "Create Profile" button is clicked
    document.getElementById('showProfileFormBtn').addEventListener('click', function() {
        document.getElementById('profileFormContainer').style.display = 'flex';
        document.querySelector('.modal-content h2').textContent = 'Create Character Profile';
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
    });

    // Close the profile form when the "Close" button is clicked
    document.getElementById('closeProfileFormBtn').addEventListener('click', function() {
        document.getElementById('profileFormContainer').style.display = 'none';
        resetForm();
    });

    // Attach event listener to "Create Profile" button
    document.getElementById('createProfileBtn').addEventListener('click', function() {
        addProfile();
    });

    // Add or edit a profile
    function addProfile() {
        const name = document.getElementById('profileTitle').value;
        const description = document.getElementById('profileContent').value;
        const imageSrc = document.getElementById('imagePreview').src;

        if (!name || !description) {
            alert("Please fill in all fields.");
            return;
        }

        if (imageSrc === defaultImageSrc || imageSrc === '') {
            alert("Please upload a profile picture.");
            return;
        }

        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];

        if (editMode) {
            profiles[currentEditIndex] = { name, description, imageSrc };
            resetForm();
        } else {
            profiles.push({ name, description, imageSrc });
        }

        localStorage.setItem('profiles', JSON.stringify(profiles));
        renderProfiles();
        document.getElementById('profileFormContainer').style.display = 'none';
    }

    // Render profiles from localStorage
    function renderProfiles() {
        const profileContainer = document.getElementById('profileContainer');
        profileContainer.innerHTML = '';
        const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.forEach((profile, index) => {
            addProfileCard(profile, index);
        });
    }

    function resetForm() {
        document.getElementById('profileTitle').value = '';
        document.getElementById('profileContent').value = '';
        document.getElementById('imagePreview').src = defaultImageSrc;
        document.getElementById('imagePreview').alt = 'Upload Image';
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
        document.querySelector('.modal-content h2').textContent = 'Create Character Profile';
        editMode = false;
        currentEditIndex = null;
    }

    function addProfileCard(profile, index) {
        const profileContainer = document.getElementById('profileContainer');
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');

        let imageHtml = (profile.imageSrc === '' || profile.imageSrc === defaultImageSrc)
            ? `<div class="placeholder">No Image</div>`
            : `<img src="${profile.imageSrc}" alt="${profile.name}">`;

        profileCard.innerHTML = `
            ${imageHtml}
            <div class="profile-name">${profile.name}</div>
            <div class="profile-description">${profile.description.slice(0, 100)}...</div>
            <div class="profile-actions">
                <button class="edit-btn" onclick="editProfile(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteProfile(${index})">Delete</button>
            </div>
        `;
        profileContainer.appendChild(profileCard);
    }

    // Load profiles on page load
    function loadProfiles() {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.forEach((profile, index) => {
            addProfileCard(profile, index);
        });
    }

    // Edit profile functionality
    window.editProfile = function(index) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        const profile = profiles[index];
        document.getElementById('profileTitle').value = profile.name;
        document.getElementById('profileContent').value = profile.description;
        document.getElementById('imagePreview').src = profile.imageSrc;
        document.querySelector('.modal-content h2').textContent = 'Update Character Profile';
        document.getElementById('createProfileBtn').innerText = 'Update Profile';
        document.getElementById('profileFormContainer').style.display = 'flex';
        editMode = true;
        currentEditIndex = index;
    };

    // Delete profile functionality
    window.deleteProfile = function(index) {
        let profiles = JSON.parse(localStorage.getItem('profiles')) || [];
        profiles.splice(index, 1);
        localStorage.setItem('profiles', JSON.stringify(profiles));
        renderProfiles();
    };
});

// Sidebar toggle functionality
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

// Toggle submenu functionality
function toggleSubmenu(submenuId) {
    var submenu = document.getElementById(submenuId);
    if (submenu.style.display === "block") {
        submenu.style.display = "none";
    } else {
        submenu.style.display = "block";
    }
}

// Event listener to open/close the sidebar
document.querySelector('.openbtn').addEventListener('click', openNav);
document.querySelector('.closebtn').addEventListener('click', closeNav);
