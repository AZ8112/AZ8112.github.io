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

document.addEventListener('DOMContentLoaded', function() {
    
    const bookList = document.getElementById('bookList');
    const coverInput = document.getElementById('coverInput');

    window.openNav = function() {
        document.getElementById("mySidepanel").style.width = "250px";
    };

    window.closeNav = function() {
        document.getElementById("mySidepanel").style.width = "0";
    };

    window.createBook = function() {
        const bookTitle = prompt('Enter the title of the book:');

        if (bookTitle) {
            if (bookTitle.length > 60) {
                alert("Title is too long; max. 60 characters");
                bookTitle = bookTitle.substring(0, 60);
            }

            // Retrieve the existing books array from localStorage
            let books = JSON.parse(localStorage.getItem('books')) || [];

            // Check if the book already exists (optional, to avoid duplicates)
            if (!books.some(book => book.title === bookTitle)) {
                const newBook = {
                    title: bookTitle,
                    cover: 'images/presetBook.png' // Default cover image
                };
                books.push(newBook);  // Add the new book to the array

                // Store the updated array back to localStorage
                localStorage.setItem('books', JSON.stringify(books));
                
                addBookToList(newBook); 

                // Optionally, make an API request to save the book
                // saveBookToAPI(bookTitle);
            } else {
                alert('Book already exists.');
            }
            displayBooks();
        }
    };

    // Add book to the UI
    function addBookToList(book) {
        const newBookElement = document.createElement('a');
        newBookElement.classList.add('book-item');

        const coverImage = document.createElement('img');
        coverImage.src = book.cover;
        coverImage.classList.add('book-cover');

        const titleElement = document.createElement('span');
        titleElement.textContent = book.title;
        titleElement.classList.add('book-title');

        const descriptionElement = document.createElement('div');
        descriptionElement.classList.add('book-description');
        const description = localStorage.getItem(`${book.title}_description`) || '';
        descriptionElement.textContent = description.length > 0 ? (description.length > 600 ? description.substring(0, 600) + '...' : description) : 'No description available.';

        newBookElement.href = `chapters.html?book=${encodeURIComponent(book.title)}`; // link to the book's chapters
        newBookElement.appendChild(coverImage);
        newBookElement.appendChild(titleElement);
        newBookElement.appendChild(descriptionElement);
        bookList.appendChild(newBookElement);

        // Attach context menu event to the new book
        newBookElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, book.title, newBookElement);
        });
    }

    // Display books in the list
    function displayBooks() {
        bookList.innerHTML = ''; // Clear the current list
        const books = JSON.parse(localStorage.getItem('books')) || [];
        books.forEach(book => {
            addBookToList(book);
        });
    }

 // Function to show context menu with delete, rename, and change cover options
function showContextMenu(e, bookName, bookElement) {
    // Remove any existing context menu
    const existingContextMenu = document.querySelector('.context-menu');
    if (existingContextMenu) {
        existingContextMenu.remove();
    }

    const contextMenu = document.createElement('div');
    contextMenu.classList.add('context-menu');
    contextMenu.style.top = `${e.pageY}px`;
    contextMenu.style.left = `${e.pageX}px`;

    const renameOption = document.createElement('div');
    renameOption.textContent = 'Rename';
    renameOption.addEventListener('click', () => {
        renameBook(bookName, bookElement);
        contextMenu.remove();
    });

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete';
    deleteOption.addEventListener('click', () => {
        deleteBook(bookName, bookElement);
        contextMenu.remove();
    });

    const changeCoverOption = document.createElement('div');
    changeCoverOption.textContent = 'Change Cover';
    changeCoverOption.addEventListener('click', () => {
        coverInput.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const fileReader = new FileReader();
                fileReader.onload = function(event) {
                    const newCoverBase64 = event.target.result;

                    let books = JSON.parse(localStorage.getItem('books')) || [];
                    const bookIndex = books.findIndex(book => book.title === bookName);

                    if (bookIndex !== -1) {
                        books[bookIndex].cover = newCoverBase64;
                        localStorage.setItem('books', JSON.stringify(books));

                        // Update the cover in the UI
                        const coverImage = bookElement.querySelector('.book-cover');
                        coverImage.src = newCoverBase64;
                    } else {
                        alert('Book not found.');
                    }
                };
                fileReader.readAsDataURL(file);
            }
        };
        coverInput.click(); // Trigger the file input dialog
        contextMenu.remove();
    });

    // 🆕 Publish Option
    const publishOption = document.createElement('div');
    publishOption.textContent = 'Publish';
    publishOption.addEventListener('click', () => {
        let publishedBooks = JSON.parse(localStorage.getItem('publishedBooks')) || [];
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const book = books.find(b => b.title === bookName);

        if (!publishedBooks.some(b => b.title === bookName)) {
            publishedBooks.push(book);
            localStorage.setItem('publishedBooks', JSON.stringify(publishedBooks));
            alert(`"${bookName}" has been published to the library.`);
        } else {
            alert(`"${bookName}" is already published.`);
        }

        contextMenu.remove();
    });

    contextMenu.appendChild(renameOption);
    contextMenu.appendChild(deleteOption);
    contextMenu.appendChild(changeCoverOption);
    contextMenu.appendChild(publishOption); // Add here
    document.body.appendChild(contextMenu);

    document.addEventListener('click', () => {
        contextMenu.remove();
    }, { once: true });
}


    // Function to delete book
    function deleteBook(bookName, bookElement) {
        if (confirm(`Are you sure you want to delete the book "${bookName}"?`)) {
            localStorage.removeItem(bookName);  // Removes the book's chapters
            localStorage.removeItem(`${bookName}_description`);  // Removes the book's description

            // Remove all related chapters and sublinks
            const chapters = JSON.parse(localStorage.getItem(bookName)) || [];
            chapters.forEach((chapter, index) => {
                localStorage.removeItem(`chapter_${index}_open`);  // Remove chapter open state
                chapter.sublinks.forEach(sublink => {
                    localStorage.removeItem(`${bookName}_sublink_${sublink.word}`);  // Remove sublink data
                });
            });

            bookElement.remove();  // Removes the book element
            saveBooks();  // Updates the saved books list
        }
    }

    // Function to rename book
    function renameBook(oldBookName, bookElement) {
        const newBookName = prompt('Rename your book', oldBookName);
        if (newBookName && newBookName !== oldBookName) {
            bookElement.querySelector('.book-title').textContent = newBookName;
            bookElement.href = `chapters.html?book=${encodeURIComponent(newBookName)}`;

            const books = JSON.parse(localStorage.getItem('books')) || [];
            const bookIndex = books.findIndex(book => book.title === oldBookName);
            if (bookIndex !== -1) {
                books[bookIndex].title = newBookName;
                localStorage.setItem('books', JSON.stringify(books));
            }

            const chapters = localStorage.getItem(oldBookName);
            if (chapters) {
                localStorage.setItem(newBookName, chapters);
                localStorage.removeItem(oldBookName);
            }

            // Update the description key in localStorage
            const description = localStorage.getItem(`${oldBookName}_description`);
            if (description) {
                localStorage.setItem(`${newBookName}_description`, description);
                localStorage.removeItem(`${oldBookName}_description`);
            }
        }
    }

    // Save books to localStorage
    function saveBooks() {
        const books = [];
        bookList.querySelectorAll('a.book-item').forEach(book => {
            books.push({
                title: book.querySelector('.book-title').textContent,
                cover: book.querySelector('.book-cover').src
            });
        });
        localStorage.setItem('books', JSON.stringify(books));
    }

    // Load books from localStorage
    function loadBooks() {
        const books = JSON.parse(localStorage.getItem('books')) || [];
        books.forEach(book => {
            addBookToList(book);
        });
    }

    loadBooks();  // Initial load of books
});