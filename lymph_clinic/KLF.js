document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.getElementById("menu-btn");
    const navMenu = document.getElementById("nav-menu");

    // Function to toggle navigation menu
    function toggleNav() {
        navMenu.classList.toggle("active");
    }

    // menuBtn.addEventListener("click", toggleNav);
    menuBtn.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });

    // Enable dropdown toggle on click
    let dropdowns = document.querySelectorAll(".dropdown > a");

    dropdowns.forEach((dropdown) => {
        dropdown.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            let parent = this.parentElement;

            // Toggle active class for dropdown
            parent.classList.toggle("active");
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown").forEach((dropdown) => {
                dropdown.classList.remove("active");
            });
        }
    });
});
