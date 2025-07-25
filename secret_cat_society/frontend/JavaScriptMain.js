document.addEventListener('DOMContentLoaded', function () {
  const userIcon = document.getElementById("userIcon");

  if (userIcon) {
    // Redirect to account page on click
    userIcon.addEventListener("click", function () {
        console.log("User icon clicked, redirecting to account page.");
      window.location.href = "account-related/accountPage.html";
    });
  }
});

// Open sidepanel
// function openNav() {
//   document.getElementById("mySidepanel").style.width = "250px";
// }

// Close sidepanel
// function closeNav() {
//   document.getElementById("mySidepanel").style.width = "0";
// }

// Toggle submenu
function toggleSubmenu(submenuId) {
  const submenu = document.getElementById(submenuId);
  submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}
