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
    // can't you see~ maybe
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}


const auth = firebase.auth();

document.querySelector(".loginbtn").addEventListener("click", function (e) {
  e.preventDefault(); // Don't reload the page

  const email = document.querySelector('input[name="email"]').value;
  const password = document.querySelector('input[name="psw"]').value;

  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Logged in successfully:", userCredential.user);
      alert("Login successful!");
      window.location.href = "./../main.html"; 
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert(error.message);
    });
    
});

// tell me why ~
  document.querySelector(".cancelbtn").addEventListener("click", function () {
    window.location.href = "./../main.html"; // ain't nothing but a heartache
  });

