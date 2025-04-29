// Open sidepanel
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

// Close sidepanel
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

// Toggle submenu
function toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}


