document.addEventListener('DOMContentLoaded', function() {
    const bookList = document.getElementById('bookList');

    window.openNav = function() {
        document.getElementById("mySidepanel").style.width = "250px";
    };

    window.closeNav = function() {
        document.getElementById("mySidepanel").style.width = "0";
    };

    window.createBook = function() {
        const bookTitle = prompt('Enter the title of the book:');
        if (bookTitle) {
            // Retrieve the existing books array from localStorage
            let books = JSON.parse(localStorage.getItem('books')) || [];

            // Check if the book already exists (optional, to avoid duplicates)
            if (!books.includes(bookTitle)) {
                books.push(bookTitle);  // Add the new book to the array

                // Store the updated array back to localStorage
                localStorage.setItem('books', JSON.stringify(books));
                
                addBookToList(bookTitle); 

                // Optionally, make an API request to save the book
                saveBookToAPI(bookTitle);
            } else {
                alert('Book already exists.');
            }
            displayBooks();
        }
    };

    // API request function (optional, if using API)
   // function saveBookToAPI(bookTitle) {
        //fetch('/api/books', {
           // method: 'POST',
           // headers: {
           //     'Content-Type': 'application/json',
            //},
            //body: JSON.stringify({ title: bookTitle }),
        //})
        //.then(response => response.json())
        //.then(data => {
          //  console.log('Success:', data);
            //addBookToList(bookTitle);  // Add to UI after successful API call
        //})
        //.catch((error) => {
          //  console.error('Error:', error);
        //});
    //}

    // Add book to the UI
    function addBookToList(bookTitle) {
        const newBook = document.createElement('a');
        newBook.textContent = bookTitle;
        newBook.href = `chapters.html?book=${encodeURIComponent(bookTitle)}`; // link to the book's chapters
        bookList.appendChild(newBook);

        // Attach context menu event to the new book
        newBook.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, bookTitle, newBook);
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

    // Function to show context menu with delete and rename options
    function showContextMenu(e, bookName, bookElement) {
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');
        contextMenu.style.top = `${e.pageY}px`;
        contextMenu.style.left = `${e.pageX}px`;

        const renameOption = document.createElement('div');
        renameOption.textContent = 'Rename';
        renameOption.addEventListener('click', () => {
            renameBook(bookName, bookElement);
            document.body.removeChild(contextMenu);
        });

        const deleteOption = document.createElement('div');
        deleteOption.textContent = 'Delete';
        deleteOption.addEventListener('click', () => {
            deleteBook(bookName, bookElement);
            document.body.removeChild(contextMenu);
        });

        contextMenu.appendChild(renameOption);
        contextMenu.appendChild(deleteOption);
        document.body.appendChild(contextMenu);

        document.addEventListener('click', () => {
            document.body.removeChild(contextMenu);
        }, { once: true });
    }

    // Function to delete book
    function deleteBook(bookName, bookElement) {
        if (confirm(`Are you sure you want to delete the book "${bookName}"?`)) {
            localStorage.removeItem(bookName);  // Removes the book's chapters
            bookElement.remove();  // Removes the book element
            saveBooks();  // Updates the saved books list
        }
    }

    // Function to rename book
    function renameBook(oldBookName, bookElement) {
        const newBookName = prompt('Rename your book', oldBookName);
        if (newBookName && newBookName !== oldBookName) {
            bookElement.textContent = newBookName;
            bookElement.href = `chapters.html?book=${encodeURIComponent(newBookName)}`;

            const books = JSON.parse(localStorage.getItem('books')) || [];
            const bookIndex = books.indexOf(oldBookName);
            if (bookIndex !== -1) {
                books[bookIndex] = newBookName;
                localStorage.setItem('books', JSON.stringify(books));
            }

            const chapters = localStorage.getItem(oldBookName);
            if (chapters) {
                localStorage.setItem(newBookName, chapters);
                localStorage.removeItem(oldBookName);
            }
        }
    }

    // Save books to localStorage
    function saveBooks() {
        const books = [];
        bookList.querySelectorAll('a').forEach(book => {
            books.push(book.textContent);
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

    // Toggle submenu visibility
    window.toggleSubmenu = function(submenuId) {
        const submenu = document.getElementById(submenuId);
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
    };
});
