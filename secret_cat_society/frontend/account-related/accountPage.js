document.addEventListener("DOMContentLoaded", () => {
  // 🛠 DEV BYPASS: Enable/disable DevMode here
  const DEV_MODE = false;

  const cancelBtn = document.querySelector(".cancelbtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "/secret_cat_society/frontend/main.html";
    });
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    // 🔥 DEV BYPASS
    if (!user && DEV_MODE) {
      console.warn("DEV_MODE active.");
      user = { uid: "devUser123", email: "dev@example.com" };
    }

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

    const form = document.querySelector(".account-form");
    if (form) {
      const uid = user.uid;

      // 🧠 Load existing data into form
      try {
        const doc = await firebase.firestore().collection("users").doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          document.querySelector('[name="username"]').value = data.username || "";
          document.querySelector('[name="birthday"]').value = data.birthday || "";
          document.querySelector('[name="pronouns"]').value = data.pronouns || "";
          document.querySelector('[name="bio"]').value = data.bio || "";
          document.querySelector('[name="profilePic"]').value = data.profilePic || "";
        } else {
          console.warn("No user data found in Firestore.");
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document
          .querySelector('[name="username"]')
          ?.value.trim();
        const birthday = document
          .querySelector('[name="birthday"]')
          ?.value.trim();
        const pronouns = document
          .querySelector('[name="pronouns"]')
          ?.value.trim();
        const bio = document.querySelector('[name="bio"]')?.value.trim();
        const profilePic = document
          .querySelector('[name="profilePic"]')
          ?.value.trim();

        if (!username) {
          alert("Username is required.");
          return;
        }

        if (profilePic && !isValidURL(profilePic)) {
          alert("Profile picture URL is invalid.");
          return;
        }

        // Build data object with only valid string fields
        const data = {
          email: user.email,
          username,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          userId: uid
        };

        // Optional fields - include ONLY if not empty
        if (bio) data.bio = bio;
        if (birthday) data.birthday = birthday;
        if (pronouns) data.pronouns = pronouns;
        if (profilePic) data.profilePic = profilePic;

        try {
          await firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .set(data, { merge: true });
          alert("Account data saved!");
        } catch (err) {
          console.error("Error saving account data:", err);
          alert("Well, that broke...");
        }
      });

      function isValidURL(str) {
        try {
          new URL(str);
          return true;
        } catch (_) {
          return false;
        }
      }
    }
  });
});
