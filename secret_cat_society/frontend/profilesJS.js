document.addEventListener('DOMContentLoaded', function() {
    const defaultImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
    let editMode = false;
    let currentEditId = null;

    loadProfiles();

    document.getElementById("profileTitle").addEventListener("input", function () {
        const maxLength = 40;
        if (this.value.length > maxLength) {
            this.value = this.value.slice(0, maxLength);
        }
    });

    document.getElementById('imagePreview').addEventListener('click', function() {
        document.getElementById('imageUpload').click();
    });

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

    document.getElementById('showProfileFormBtn').addEventListener('click', function() {
        resetForm();
        document.getElementById('profileFormContainer').style.display = 'flex';
    });

    document.getElementById('closeProfileFormBtn').addEventListener('click', function() {
        document.getElementById('profileFormContainer').style.display = 'none';
        resetForm();
    });

    document.getElementById('createProfileBtn').addEventListener('click', function() {
        if (editMode) {
            updateProfile();
        } else {
            saveProfile();
        }
    });

    async function saveProfile() {
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

        try {
            const docRef = await db.collection('profiles').add({
                name: name,
                description: description,
                imageSrc: imageSrc,
                timestamp: new Date()
            });
            console.log('Profile saved to Firestore!');
            alert('Profile saved!');
            resetForm();
            document.getElementById('profileFormContainer').style.display = 'none';
            addSingleProfile(docRef.id, { name, description, imageSrc }); // Only add the new card!
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }

    async function loadProfiles() {
        const profileContainer = document.getElementById('profileContainer');
        profileContainer.innerHTML = '';

        try {
            const snapshot = await db.collection('profiles').orderBy('timestamp', 'desc').get();
            snapshot.forEach((doc) => {
                const profile = doc.data();
                addProfileCard(profile, doc.id);
            });
        } catch (error) {
            console.error('Error loading profiles:', error);
        }
    }

    async function deleteProfile(id) {
        try {
            await db.collection('profiles').doc(id).delete();
            console.log('Profile deleted!');
            document.getElementById(`profile-${id}`).remove(); // Remove only the deleted card
        } catch (error) {
            console.error('Error deleting profile:', error);
        }
    }

    function addProfileCard(profile, id) {
        const profileContainer = document.getElementById('profileContainer');
        const profileCard = document.createElement('div');
        profileCard.classList.add('profile-card');
        profileCard.setAttribute('id', `profile-${id}`);

        let imageHtml = (profile.imageSrc === '' || profile.imageSrc === defaultImageSrc)
            ? `<div class="placeholder">No Image</div>`
            : `<img src="${profile.imageSrc}" alt="${profile.name}">`;

        profileCard.innerHTML = `
            ${imageHtml}
            <div class="profile-name">${profile.name}</div>
            <div class="profile-description">${profile.description.slice(0, 100)}...</div>
            <div class="profile-actions">
                <button class="edit-btn" onclick="editProfile('${id}')">Edit</button>
                <button class="delete-btn" onclick="deleteProfile('${id}')">Delete</button>
            </div>
        `;
        profileContainer.appendChild(profileCard);
    }

    function addSingleProfile(id, profile) {
        addProfileCard(profile, id);
    }

    function resetForm() {
        document.getElementById('profileTitle').value = '';
        document.getElementById('profileContent').value = '';
        document.getElementById('imagePreview').src = defaultImageSrc;
        document.getElementById('imagePreview').alt = 'Upload Image';
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
        document.querySelector('.modal-content h2').textContent = 'Create Character Profile';
        editMode = false;
        currentEditId = null;
    }

    window.editProfile = async function(id) {
        try {
            const doc = await db.collection('profiles').doc(id).get();
            if (doc.exists) {
                const profile = doc.data();
                document.getElementById('profileTitle').value = profile.name;
                document.getElementById('profileContent').value = profile.description;
                document.getElementById('imagePreview').src = profile.imageSrc || defaultImageSrc;
                document.getElementById('profileFormContainer').style.display = 'flex';
                document.getElementById('createProfileBtn').innerText = 'Update Profile';
                document.querySelector('.modal-content h2').textContent = 'Update Character Profile';
                editMode = true;
                currentEditId = id;
            } else {
                console.error("Profile not found!");
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }

    async function updateProfile() {
        const name = document.getElementById('profileTitle').value;
        const description = document.getElementById('profileContent').value;
        const imageSrc = document.getElementById('imagePreview').src;

        if (!currentEditId) {
            console.error("No profile selected for editing.");
            return;
        }

        try {
            await db.collection('profiles').doc(currentEditId).update({
                name: name,
                description: description,
                imageSrc: imageSrc,
                timestamp: new Date()
            });

            console.log('Profile updated!');
            alert('Profile updated!');
            updateProfileCard(currentEditId, { name, description, imageSrc });
            document.getElementById('profileFormContainer').style.display = 'none';
            resetForm();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }

    function updateProfileCard(id, profile) {
        const card = document.getElementById(`profile-${id}`);
        if (!card) return;

        card.querySelector('img').src = profile.imageSrc || defaultImageSrc;
        card.querySelector('.profile-name').textContent = profile.name;
        card.querySelector('.profile-description').textContent = profile.description.slice(0, 100) + '...';
    }
});

// Sidebar and submenu
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}
function toggleSubmenu(submenuId) {
    var submenu = document.getElementById(submenuId);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}
document.querySelector('.openbtn').addEventListener('click', openNav);
document.querySelector('.closebtn').addEventListener('click', closeNav);
