//open sidepanel
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

//close sidepanel
function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

//toggle submenu
function toggleSubmenu(submenuId)  {
    const submenu = document.getElementById(submenuId);
    // Toggle visibility of the submenu
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}

// Assume Firebase is already initialized from HTML

const auth = firebase.auth();

document.querySelector(".loginbtn").addEventListener("click", function (e) {
  e.preventDefault(); // Don't reload the page

  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="psw"]').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Logged in successfully:", userCredential.user);
      alert("Login successful!");
      window.location.href = "main.html"; // <-- or wherever you want logged-in users to go
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert(error.message);
    });
    
    document.querySelector(".cancelbtn").addEventListener("click", function () {
    window.location.href = "main.html"; // Or whatever page you want to cancel back to
  });
  
});


