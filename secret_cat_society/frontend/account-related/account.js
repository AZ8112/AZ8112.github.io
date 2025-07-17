document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const userIcon = document.getElementById("userIcon");
    const userDropdown = document.getElementById("userDropdown");
    const userEmailDisplay = document.getElementById("userEmail");
    const userActionButton = userDropdown.querySelector("button");

    if (!userIcon || !userDropdown || !userEmailDisplay || !userActionButton) {
        console.warn("Some user dropdown elements are missing.");
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
            window.location.href = "login.html";
        })
        .catch((error) => {
            console.error("Logout error:", error.message);
        });
}

function redirectToLogin() {
    window.location.href = "login.html";
}
