document.addEventListener('DOMContentLoaded', function () {
    const libraryGrid = document.getElementById('libraryBookGrid');

function renderBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';

  // Cover
  const cover = document.createElement('div');
  cover.className = 'book-cover';
  cover.innerHTML = `
    <img src="${book.cover || 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'}"
         alt="${book.title || 'Untitled Book'}" loading="lazy">
  `;

  // Timestamp text
  const publishedText = book.timestamp
    ? "Published on " + book.timestamp.toDate().toLocaleString()
    : "Unknown date";

  // Tags as styled buttons
  let tagsHTML = "No tags";
  if (Array.isArray(book.tags) && book.tags.length > 0) {
    tagsHTML = book.tags
      .filter(t => t && String(t).trim())
      .map(t => `<button class="tag-button" disabled>${t}</button>`)
      .join(" ");
  }

  // Info container (username/email will be filled later)
  const info = document.createElement('div');
  info.className = 'book-info';
  info.innerHTML = `
    <div class="book-meta">
      <div class="username-badge">Loading...</div>
      <div class="timestamp-badge">${publishedText}</div>
    </div>
    <h3>${book.title || "Untitled"}</h3>
    <div class="genre">${tagsHTML}</div>
    <div class="book-description">${book.description || "No description provided."}</div>
    <div class="action-buttons">
      <button class="like-btn"><i class="fas fa-thumbs-up"></i> <span class="count">0</span></button>
      <button class="comment-btn"><i class="fas fa-comment"></i> Comment</button>
    </div>
  `;

  card.appendChild(cover);
  card.appendChild(info);

  // Store tags on card for filtering
  const tagStrings = Array.isArray(book.tags) ? book.tags.map(t => t.toLowerCase()) : [];
  card.dataset.tags = JSON.stringify(tagStrings);

  libraryGrid.appendChild(card);

  // Fetch the user's username/email from /users/{userId}
  if (book.userId) {
    db.collection("users").doc(book.userId).get()
      .then(userDoc => {
        const userData = userDoc.data() || {};
        const nameToShow = userData.username?.trim() || userData.email || "Unknown";
        info.querySelector('.username-badge').textContent = nameToShow;
      })
      .catch(err => {
        console.error("Error fetching user data:", err);
        info.querySelector('.username-badge').textContent = "Unknown";
      });
  } else {
    info.querySelector('.username-badge').textContent = "Unknown";
  }
}


// Fetch and render published books from Firestore
function refreshLibraryBooks() {
    libraryGrid.innerHTML = '';

    db.collection("books")
        .where("isPublic", "==", true)
        .orderBy("timestamp", "desc")
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                libraryGrid.innerHTML = "<p>No published books yet.</p>";
                return;
            }
            snapshot.forEach(doc => {
                renderBookCard(doc.data());
            });
        })
        .catch(error => {
            console.error("Firestore error while loading books:", error);
        });
}


    // Like button click handler
    document.addEventListener('click', function (e) {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn) {
            const count = likeBtn.querySelector('.count');
            count.textContent = parseInt(count.textContent) + 1;
            likeBtn.disabled = true;
        }
    });

    // Search filter
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll('.book-card').forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                card.style.display = title.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    // Genre filter
    const genreFilter = document.getElementById('genre-filter');
    if (genreFilter) {
        genreFilter.addEventListener('change', function () {
            const genre = this.value.toLowerCase();
            document.querySelectorAll('.book-card').forEach(card => {
                const cardGenre = card.querySelector('.genre')?.textContent?.toLowerCase() || "";
                card.style.display = !genre || cardGenre === genre ? 'flex' : 'none';
            });
        });
    }

    // Account icon redirect
    const userIcon = document.getElementById("userIcon");
    if (userIcon) {
        userIcon.addEventListener("click", function () {
            console.log("User icon clicked, redirecting to account page.");
            window.location.href = "./../account-related/accountPage.html";
        });
    }

    // Mark page as loaded for CSS transitions
    document.body.classList.add('loaded');

    // Load published books
    refreshLibraryBooks();
});
