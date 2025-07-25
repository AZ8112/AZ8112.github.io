document.addEventListener('DOMContentLoaded', () => {
  const cancelBtn = document.getElementById("cancelbtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "/secret_cat_society/frontend/main.html";
    });
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      console.warn("No user signed in.");
      window.location.href = "login.html";
      return;
    }

    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
      emailInput.value = user.email;
      emailInput.setAttribute("readonly", true);
    }

    const form = document.querySelector('.account-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const uid = user.uid;
        const username = document.querySelector('[name="username"]')?.value.trim();
        const birthday = document.querySelector('[name="birthday"]')?.value;
        const pronouns = document.querySelector('[name="pronouns"]')?.value;
        const bio = document.querySelector('[name="bio"]')?.value.trim();
        const profilePic = document.querySelector('[name="profilePic"]')?.value.trim();

        const data = {
          email: user.email,
          username,
          birthday,
          pronouns,
          bio,
          profilePic,
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
});
