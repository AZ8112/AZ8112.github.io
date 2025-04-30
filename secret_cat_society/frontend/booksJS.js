// --- Firebase Books with Context Menu (Rename, Cover, Publish, Delete) ---

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
    descriptionElement.textContent = book.description?.length > 0
        ? (book.description.length > 600 ? book.description.substring(0, 600) + '...' : book.description)
        : 'No description available.';

    newBookElement.appendChild(coverImage);
    newBookElement.appendChild(titleElement);
    newBookElement.appendChild(descriptionElement);
    bookList.appendChild(newBookElement);

    newBookElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, bookId, book, newBookElement);
    });
}

function showContextMenu(e, bookId, bookData, bookElement) {
    const existing = document.querySelector('.context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.classList.add('context-menu');
    menu.style.top = `${e.pageY}px`;
    menu.style.left = `${e.pageX}px`;

    const rename = document.createElement('div');
    rename.textContent = 'Rename';
    rename.onclick = async () => {
        const newName = prompt('Rename book:', bookData.title);
        if (newName && newName !== bookData.title) {
            await db.collection('books').doc(bookId).update({ title: newName });
            loadBooks();
        }
        menu.remove();
    };

    const del = document.createElement('div');
    del.textContent = 'Delete';
    del.onclick = async () => {
        if (confirm(`Delete "${bookData.title}"?`)) {
            await db.collection('books').doc(bookId).delete();
            bookElement.remove();
        }
        menu.remove();
    };

    const changeCover = document.createElement('div');
    changeCover.textContent = 'Change Cover';
    changeCover.onclick = () => {
        coverInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    await db.collection('books').doc(bookId).update({ cover: e.target.result });
                    loadBooks();
                };
                reader.readAsDataURL(file);
            }
        };
        coverInput.click();
        menu.remove();
    };

    const publish = document.createElement('div');
    publish.textContent = 'Publish';
    publish.onclick = async () => {
        await db.collection('books').doc(bookId).update({ published: true });
        alert(`"${bookData.title}" published.`);
        menu.remove();
    };

    menu.append(rename, del, changeCover, publish);
    document.body.appendChild(menu);

    document.addEventListener('click', () => menu.remove(), { once: true });
}

async function createBook() {
    const bookTitle = prompt('Enter the title of the book:');
    if (!bookTitle) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Not logged in');
        return;
    }

    const bookData = {
        title: bookTitle.length > 60 ? bookTitle.substring(0, 60) : bookTitle,
        description: '',
        cover: 'images/presetBook.png',
        userId: user.uid,
        email: user.email,
        timestamp: new Date()
    };

    try {
        await db.collection('books').add(bookData);
        alert('Book created');
        loadBooks();
    } catch (err) {
        console.error('Error creating book:', err);
    }
}

firebase.auth().onAuthStateChanged(user => {
    if (user) loadBooks();
    else window.location.href = 'login.html';
});
