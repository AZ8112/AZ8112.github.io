document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const userIcon = document.getElementById("userIcon");
    const userDropdown = document.getElementById("userDropdown");

    if (!userIcon || !userDropdown) {
        console.warn("User icon or dropdown not found in the DOM.");
        return;
    }

    userIcon.addEventListener("click", () => {
        userDropdown.style.display = userDropdown.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
        if (!userDropdown.contains(event.target) && !userIcon.contains(event.target)) {
            userDropdown.style.display = "none";
        }
    });

    auth.onAuthStateChanged((user) => {
        if (user) {
            const emailDisplay = document.getElementById("userEmail");
            if (emailDisplay) {
                emailDisplay.textContent = "Logged in as: " + user.email;
            }
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
