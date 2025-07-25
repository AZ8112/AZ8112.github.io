document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();
    const defaultImageSrc = 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png';
    let editMode = false;
    let currentEditId = null;

    // 🛠 DEV BYPASS: Enable/disable DevMode here
    const DEV_MODE = false;
    const devUser = { uid: "devUser123", email: "dev@example.com" };

    firebase.auth().onAuthStateChanged(function (user) {
        // 🛠 DEV BYPASS: Use fake user if not logged in and DEV_MODE is true
        if (!user && DEV_MODE) {
            console.warn("🔥 Dev mode active – using mock user.");
            user = devUser;
        }

        if (user) {
            loadProfiles(user);
            if (typeof patchProfilesWithUserId === 'function') {
                patchProfilesWithUserId(user);
            }
        } else {
            window.location.href = '../account-related/login.html';
        }
    });

    document.getElementById("profileTitle").addEventListener("input", function () {
        const maxLength = 40;
        if (this.value.length > maxLength) {
            this.value = this.value.slice(0, maxLength);
        }
    });

    document.getElementById('imagePreview').addEventListener('click', function () {
        document.getElementById('imageUpload').click();
    });

    document.getElementById('imageUpload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('imagePreview').src = e.target.result;
                document.getElementById('imagePreview').alt = '';
            };
            reader.readAsDataURL(file);
        } else {
            document.getElementById('imagePreview').src = defaultImageSrc;
            document.getElementById('imagePreview').alt = 'Upload Image';
        }
    });

    document.getElementById('age').addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    document.getElementById('showProfileFormBtn').addEventListener('click', function () {
        resetForm();
        document.getElementById('profileFormContainer').style.display = 'flex';
    });

    document.getElementById('closeProfileFormBtn').addEventListener('click', function () {
        document.getElementById('profileFormContainer').style.display = 'none';
        resetForm();
    });

    document.getElementById('createProfileBtn').addEventListener('click', function () {
        if (editMode) {
            updateProfile();
        } else {
            saveProfile();
        }
    });

    async function saveProfile() {
        const profileData = collectProfileData();
        if (!profileData) return;

        const user = firebase.auth().currentUser || devUser; // 🛠 DEV BYPASS

        try {
            const docRef = await db.collection('profiles').add({
                ...profileData,
                userId: user.uid,
                email: user.email,
                timestamp: new Date()
            });
            alert('Profile saved!');
            resetForm();
            document.getElementById('profileFormContainer').style.display = 'none';
            profileData.userId = user.uid;
            profileData.email = user.email;
            addProfileCard(profileData, docRef.id);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    }

    async function loadProfiles(user) {
        const profileContainer = document.getElementById('profileContainer');
        profileContainer.innerHTML = '';

        try {
            const userId = user.uid; // 🛠 DEV BYPASS safe
            const snapshot = await db.collection('profiles')
                .where('userId', '==', userId)
                .orderBy('timestamp', 'desc')
                .get();
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
            document.getElementById(`profile-${id}`).remove();
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
            : `<img src="${profile.imageSrc}" alt="${profile.firstName}">`;

        profileCard.innerHTML = `
            ${imageHtml}
            <div class="profile-name">
                ${profile.firstName ? profile.firstName : ''}<br>
                ${profile.age ? profile.age : ''}<br>
                ${profile.genderPronouns ? profile.genderPronouns : ''}
            </div>
            <div class="profile-actions">
                <button class="edit-btn" onclick="editProfile('${id}')">Edit</button>
                <button class="delete-btn" onclick="deleteProfile('${id}')">Delete</button>
            </div>
        `;

        profileContainer.appendChild(profileCard);
    }

    function resetForm() {
        document.getElementById('profileTitle').value = '';
        document.getElementById('middleName').value = '';
        document.getElementById('lastName').value = '';
        document.getElementById('age').value = '';
        document.getElementById('genderPronouns').value = '';
        document.getElementById('profileContent').value = '';
        document.getElementById('imagePreview').src = defaultImageSrc;
        document.getElementById('imagePreview').alt = 'Upload Image';
        document.getElementById('createProfileBtn').innerText = 'Create Profile';
        const modalHeader = document.getElementById('modalHeader');
        if (modalHeader) modalHeader.textContent = 'Create Character Profile';
        editMode = false;
        currentEditId = null;
    }

    function collectProfileData() {
        const firstName = document.getElementById('profileTitle').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const age = document.getElementById('age').value.trim();
        const genderPronouns = document.getElementById('genderPronouns').value.trim();
        const description = document.getElementById('profileContent').value.trim();
        const imageSrc = document.getElementById('imagePreview').src;

        if (!firstName || !description) {
            alert("Please fill in required fields.");
            return null;
        }

        return { firstName, middleName, lastName, age, genderPronouns, description, imageSrc };
    }

    window.editProfile = async function (id) {
        try {
            const doc = await db.collection('profiles').doc(id).get();
            if (doc.exists) {
                const profile = doc.data();
                document.getElementById('profileTitle').value = profile.firstName || '';
                document.getElementById('middleName').value = profile.middleName || '';
                document.getElementById('lastName').value = profile.lastName || '';
                document.getElementById('age').value = profile.age || '';
                document.getElementById('genderPronouns').value = profile.genderPronouns || '';
                document.getElementById('profileContent').value = profile.description || '';
                document.getElementById('imagePreview').src = profile.imageSrc || defaultImageSrc;
                document.getElementById('profileFormContainer').style.display = 'flex';
                document.getElementById('createProfileBtn').innerText = 'Update Profile';
                const modalHeader = document.getElementById('modalHeader');
                if (modalHeader) modalHeader.textContent = 'Update Character Profile';
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
        const profileData = collectProfileData();
        if (!profileData || !currentEditId) return;

        try {
            await db.collection('profiles').doc(currentEditId).update({
                ...profileData,
                timestamp: new Date()
            });

            alert('Profile updated!');
            updateProfileCard(currentEditId, profileData);
            document.getElementById('profileFormContainer').style.display = 'none';
            resetForm();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    }

    function updateProfileCard(id, profile) {
        const card = document.getElementById(`profile-${id}`);
        if (!card) return;

        if (card.querySelector('img')) {
            card.querySelector('img').src = profile.imageSrc || defaultImageSrc;
        }

        card.querySelector('.profile-name').innerHTML = `
            ${profile.firstName ? profile.firstName : ''}<br>
            ${profile.age ? profile.age : ''}<br>
            ${profile.genderPronouns ? profile.genderPronouns : ''}
        `;
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

const openBtn = document.querySelector('.openbtn');
const closeBtn = document.querySelector('.closebtn');
if (openBtn) openBtn.addEventListener('click', openNav);
if (closeBtn) closeBtn.addEventListener('click', closeNav);



document.addEventListener('DOMContentLoaded', function () {
  const userIcon = document.getElementById("userIcon");
  if (userIcon) {
    // Redirect to account page on click
    userIcon.addEventListener("click", function () {
        console.log("User icon clicked, redirecting to account page.");
      window.location.href = "./../account-related/accountPage.html";
    });
  }
});
