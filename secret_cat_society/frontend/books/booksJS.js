const db = firebase.firestore();
const bookList = document.getElementById("bookList");
const coverInput = document.getElementById("coverInput");

// 🛠 DEV BYPASS: Enable/disable DevMode here
const DEV_MODE = false;

async function loadBooks() {
  let user = firebase.auth().currentUser;

  // 🛠 DEV BYPASS: Mock user if not authenticated and DEV_MODE is true
  if (!user && DEV_MODE) {
    console.warn("🔥 Dev mode active - using mock user.");
    user = { uid: "devUser123", email: "dev@example.com" };
  }

  if (!user) return;

  bookList.innerHTML = "";
  try {
    const snapshot = await db
      .collection("books")
      .where("userId", "==", user.uid)
      .orderBy("timestamp", "desc")
      .get();

    snapshot.forEach((doc) => {
      const book = doc.data();
      addBookToList(book, doc.id);
    });
  } catch (error) {
    console.error("Error loading books:", error);
  }
}

function addBookToList(book, bookId) {
  const bookLink = document.createElement("a");
  bookLink.classList.add("book-item");
  bookLink.href = `chapters.html?bookId=${bookId}`;

  const coverImg = document.createElement("img");
  coverImg.src = book.cover || "images/presetBook.png";
  coverImg.classList.add("book-cover");

  const titleDiv = document.createElement("div");
  titleDiv.classList.add("book-title");
  titleDiv.textContent = book.title || "Untitled";

  const descDiv = document.createElement("div");
  descDiv.classList.add("book-description");
  descDiv.textContent = book.description?.trim()
    ? book.description.length > 600
      ? book.description.substring(0, 600) + "..."
      : book.description
    : "No description available.";

  bookLink.appendChild(coverImg);
  bookLink.appendChild(titleDiv);
  bookLink.appendChild(descDiv);
  bookList.appendChild(bookLink);

  bookLink.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    showContextMenu(e, bookId, book, bookLink);
  });
}

function showContextMenu(e, bookId, bookData, bookElement) {
  const existing = document.querySelector(".context-menu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.classList.add("context-menu");
  menu.style.top = `${e.pageY}px`;
  menu.style.left = `${e.pageX}px`;

  const rename = document.createElement("div");
  rename.textContent = "Rename";
  rename.onclick = async () => {
    const newName = prompt("Rename book:", bookData.title);
    if (newName && newName !== bookData.title) {
      await db.collection("books").doc(bookId).update({ title: newName });
      loadBooks();
    }
    menu.remove();
  };

  const del = document.createElement("div");
  del.textContent = "Delete";
  del.onclick = async () => {
    if (confirm(`Delete "${bookData.title}"?`)) {
      await db.collection("books").doc(bookId).delete();
      bookElement.remove();
    }
    menu.remove();
  };

  const changeCover = document.createElement("div");
  changeCover.textContent = "Change Cover";
  changeCover.onclick = () => {
    coverInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 1 * 1024 * 1024) {
        // 1MB in bytes
        alert("Image is too large. Please choose an image under 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;
        try {
          await db.collection("books").doc(bookId).update({ cover: dataUrl });
          loadBooks();
        } catch (err) {
          console.error("Error updating cover:", err);
          alert("Failed to update cover image.");
        }
      };
      reader.onerror = () => {
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    };
    coverInput.click();
    menu.remove();
  };

  const publish = document.createElement("div");
  publish.textContent = "Publish";
  publish.onclick = async () => {
    await db.collection("books").doc(bookId).update({ published: true });
    alert(`"${bookData.title}" published.`);
    menu.remove();
  };

  menu.append(rename, del, changeCover, publish);
  document.body.appendChild(menu);

  document.addEventListener("click", () => menu.remove(), { once: true });
}

async function createBook() {
  const bookTitle = prompt("Enter the title of the book:");
  if (!bookTitle) return;

  let user = firebase.auth().currentUser;

  // 🛠 DEV BYPASS: Mock user if needed
  if (!user && DEV_MODE) {
    console.warn("Dev mode active - using mock user.");
    user = { uid: "devUser123", email: "dev@example.com" };
  }

  if (!user) {
    alert("Not logged in.");
    return;
  }

  const bookData = {
    title: bookTitle.length > 60 ? bookTitle.substring(0, 60) : bookTitle,
    description: "",
    cover: "./../images/presetBook.png",
    userId: user.uid,
    email: user.email,
    timestamp: new Date(),
    isPublic: false,
    tags: []
  };

  try {
    await db.collection("books").add(bookData);
    alert("Book created");
    loadBooks();
  } catch (err) {
    console.error("Error creating book:", err);
  }
}

firebase.auth().onAuthStateChanged((user) => {
  // 🛠 DEV BYPASS: Skip redirect and load with mock user
  if (user || DEV_MODE) {
    if (!user && DEV_MODE) {
      console.warn("🔥 Dev mode active – no auth, using mock user.");
    }
    loadBooks();
  } else {
    // Normal redirect if not in dev mode
    window.location.href = "../account-related/login.html";
  }
});


document.addEventListener('DOMContentLoaded', function () {
  const userIcon = document.getElementById("userIcon");
  if (userIcon) {
    // Redirect to account page on click
    userIcon.addEventListener("click", function () {
        console.log("User icon clicked, redirecting to account page.");
      window.location.href = "./../account-related/accountPage.html";
    });
  }
});
