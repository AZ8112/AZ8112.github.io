document.addEventListener('DOMContentLoaded', function () {
    // Wait until Firebase is actually available
    if (typeof firebase === "undefined" || !firebase.apps.length) {
        console.error("Firebase is not initialized. Make sure firebase-init.js loads before this script.");
        return;
    }

    const auth = firebase.auth();

    const userIcon = document.getElementById("userIcon");
    const userDropdown = document.getElementById("userDropdown");
    const userEmailDisplay = document.getElementById("userEmail");
    const userActionButton = userDropdown ? userDropdown.querySelector("button") : null;

    if (!userIcon || !userDropdown || !userEmailDisplay || !userActionButton) {
        console.warn("Some user dropdown elements are missing. Skipping dropdown setup.");
        return;
    }

    // Toggle dropdown on icon click
    userIcon.addEventListener("click", () => {
        userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (!userDropdown.contains(event.target) && !userIcon.contains(event.target)) {
            userDropdown.style.display = "none";
        }
    });

    // Check auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            userEmailDisplay.textContent = "Logged in as: " + user.email;
            userActionButton.textContent = "Log out";
            userActionButton.onclick = logout;
        } else {
            userEmailDisplay.textContent = "Not logged in.";
            userActionButton.textContent = "Log in";
            userActionButton.onclick = redirectToLogin;
        }
    });
});

function logout() {
    firebase.auth().signOut()
        .then(() => {
            alert("Logged out!");
            window.location.href = "/frontend/account-related/login.html";
        })
        .catch((error) => {
            console.error("Logout error:", error.message);
        });
}

function redirectToLogin() {
        window.location.href = "/frontend/account-related/login.html";
}
