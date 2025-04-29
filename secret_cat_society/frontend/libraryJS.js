document.addEventListener('DOMContentLoaded', function () {
// Like/Dislike buttons
document.addEventListener('click', function (e) {
    const likeBtn = e.target.closest('.like-btn');
    const dislikeBtn = e.target.closest('.dislike-btn');

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
                const cardGenre = card.querySelector('.genre').textContent.toLowerCase();
                card.style.display = !genre || cardGenre === genre ? 'flex' : 'none';
            });
        });
    }

    function refreshLibraryBooks() {
        const libraryGrid = document.getElementById('libraryBookGrid');
        libraryGrid.innerHTML = ''; // Clear existing cards
    
        const books = JSON.parse(localStorage.getItem('publishedBooks')) || [];
    
        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';
    
            const cover = document.createElement('div');
            cover.className = 'book-cover';
    
            const img = document.createElement('img');
            img.src = book.cover;
            img.alt = book.title;
            img.loading = "lazy";
            cover.appendChild(img);
    
            const info = document.createElement('div');
            info.className = 'book-info';
            info.innerHTML = `
                <h3>${book.title}</h3>
                <p class="author">Author Unknown</p>
                <p class="genre">Fiction</p>
                <div class="action-buttons">
                    <button class="like-btn"><i class="fas fa-thumbs-up"></i> <span class="count">0</span></button>
                </div>
            `;
    
            card.appendChild(cover);
            card.appendChild(info);
            libraryGrid.appendChild(card);
        });
    }
    


    document.body.classList.add('loaded');


    loadLibraryBooks();
});
