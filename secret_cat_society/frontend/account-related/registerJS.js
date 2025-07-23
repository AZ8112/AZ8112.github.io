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

// --- Firebase Auth Registration Code ---
const auth = firebase.auth(); // assuming firebase is already initialized above

document.querySelector(".signup").addEventListener("click", function (e) {
  e.preventDefault(); // prevent form default submission
  
  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="psw"]').value;
  const repeatPassword = document.querySelector('input[name="psw-repeat"]').value;

  if (password !== repeatPassword) {
    alert("Passwords do not match!");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("User registered:", userCredential.user);
      alert("Registration successful! Redirecting to login page.");
      window.location.href = "login.html"; // or wherever your login form is
    })
    .catch((error) => {
      console.error("Registration error:", error.message);
      alert(error.message);
    });

    
  
});

document.querySelector(".cancelbtn").addEventListener("click", function () {
      window.location.href = "./../main.html"; // or wherever you want to send them
  });