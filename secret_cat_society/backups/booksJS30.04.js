// Book creation function
async function createBook() {
    const bookTitle = prompt('Enter the title of the book:');
    if (!bookTitle) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Not logged in');
        return;
    }

    try {
        const db = firebase.firestore();
        const bookData = {
            title: bookTitle.length > 60 ? bookTitle.substring(0, 60) : bookTitle,
            description: '',
            cover: 'images/presetBook.png',
            userId: user.uid,
            email: user.email,
            timestamp: new Date()
        };

        const docRef = await db.collection('books').add(bookData);
        console.log('Book created with ID:', docRef.id);
        alert('Book created!');
        loadBooks();
    } catch (error) {
        console.error('Error creating book:', error);
    }
}



// Nav bar START ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    let dropdown = document.querySelector(".dropdown");
    let button = document.querySelector(".dropbtn");

    button.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents closing when clicking the button
        dropdown.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (!dropdown.contains(event.target)) {
            dropdown.classList.remove("show"); // Close dropdown when clicking outside
        }
    });
});

// nav bar END  --------------------------------------------------------------------------------

// Main books page logic
const db = firebase.firestore();
const bookList = document.getElementById('bookList');
const coverInput = document.getElementById('coverInput');

async function loadBooks() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    bookList.innerHTML = '';

    try {
        const snapshot = await db.collection('books')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .get();

        snapshot.forEach(doc => {
            const book = doc.data();
            addBookToList(book, doc.id);
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function addBookToList(book, bookId) {
    const newBookElement = document.createElement('a');
    newBookElement.classList.add('book-item');
    newBookElement.href = `chapters.html?bookId=${bookId}`;

    const coverImage = document.createElement('img');
    coverImage.src = book.cover;
    coverImage.classList.add('book-cover');

    const titleElement = document.createElement('span');
    titleElement.textContent = book.title;
    titleElement.classList.add('book-title');

    const descriptionElement = document.createElement('div');
    descriptionElement.classList.add('book-description');
    descriptionElement.textContent = book.description.length > 0 ? (book.description.length > 600 ? book.description.substring(0, 600) + '...' : book.description) : 'No description available.';

    newBookElement.appendChild(coverImage);
    newBookElement.appendChild(titleElement);
    newBookElement.appendChild(descriptionElement);

    bookList.appendChild(newBookElement);

    newBookElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, bookId, newBookElement);
    });
}

function showContextMenu(e, bookId, bookElement) {
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu) existingContextMenu.remove();

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete Book';
    deleteOption.addEventListener('click', () => {
        deleteBook(bookId, bookElement);
        contextMenu.remove();
    });

    contextMenu.appendChild(deleteOption);
    document.body.appendChild(contextMenu);

    document.addEventListener('click', () => {
        contextMenu.remove();
    }, { once: true });
}

async function deleteBook(bookId, bookElement) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        await db.collection('books').doc(bookId).delete();
        console.log('Book deleted');
        bookElement.remove();
    } catch (error) {
        console.error('Error deleting book:', error);
    }
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loadBooks();
    } else {
        window.location.href = 'login.html';
    }
});




