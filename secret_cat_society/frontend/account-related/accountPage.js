// Toggle submenu
function toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

// tell me why ~
  document.getElementById("cancelbtn").addEventListener("click", function () {
    window.location.href = "/secret_cat_society/frontend/main.html"; // ain't nothing but a heartache
  });

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.value = user.email;
      emailInput.setAttribute("readonly", true); // Optional: prevent editing
    }
  } else {
    console.warn("No user signed in.");
    // Optionally redirect to login.html
    window.location.href = "login.html";
  }
});

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Autofill email
  const emailInput = document.querySelector('input[name="email"]');
  if (emailInput) {
    emailInput.value = user.email;
    emailInput.setAttribute("readonly", true);
  }

  // Handle form submit
  const form = document.querySelector('.account-form');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const uid = user.uid;

      const data = {
        email: user.email,
        username: document.querySelector('[name="username"]').value.trim(),
        birthday: document.querySelector('[name="birthday"]').value,
        pronouns: document.querySelector('[name="pronouns"]').value,
        bio: document.querySelector('[name="bio"]').value.trim(),
        profilePic: document.querySelector('[name="profilePic"]').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        await firebase.firestore().collection('users').doc(uid).set(data, { merge: true });
        alert("Account data saved!");
      } catch (err) {
        console.error("Error saving account data:", err);
        alert("Error saving. Check the console.");
      }
    });
  }
});

