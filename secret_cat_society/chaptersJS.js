document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const bookTitle = urlParams.get('book');
    let currentChapterIndex = null;
    let selectedText = '';

    // Initialize Quill.js editor
    const quill = new Quill('#chapterContent', {
        theme: 'snow'  // Snow theme
    });

    const header = document.getElementById('header');
    header.textContent = bookTitle ? `${bookTitle} - Chapters` : 'Your Chapters';

    function openNav() {
        document.getElementById("mySidepanel").style.width = "250px";
    }

    function closeNav() {
        document.getElementById("mySidepanel").style.width = "0";
    }

    function toggleSubmenu(submenuId) {
        const submenu = document.getElementById(submenuId);
        submenu.style.display = submenu.style.display === "block" ? "none" : "block";
    }

    // Get the HTML content from Quill editor
    function getChapterContent() {
        return quill.root.innerHTML;  // Retrieves the content as HTML
    }

    // Set the content in Quill editor
    function setChapterContent(content) {
        quill.root.innerHTML = content;  // Sets the content as HTML
    }

    function addChapter() {
        const title = document.getElementById('chapterTitle').value;
        const content = getChapterContent();  // Get content from Quill editor

        if (title && content) {
            const newChapter = {
                title: title,
                content: content,
                sublinks: []  // Initialize an empty sublinks array
            };
            let chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];
            chapters.push(newChapter);
            localStorage.setItem(bookTitle, JSON.stringify(chapters));

            // Clear input fields
            document.getElementById('chapterTitle').value = '';
            setChapterContent('');  // Clear Quill editor

            // Render updated chapters
            renderChapters();
        } else {
            alert('Please fill out both the title and content fields.');
        }
    }

    function deleteChapter(index) {
        // Ask for confirmation
        const confirmDelete = confirm("Are you sure you want to delete this chapter?");
        
        // If the user confirms, proceed with deletion
        if (confirmDelete) {
            let chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];
            
            // Remove the selected chapter
            chapters.splice(index, 1);
        
            // Save updated chapters back to localStorage
            localStorage.setItem(bookTitle, JSON.stringify(chapters));
        
            // Clear chapter title and content
            document.getElementById('chapterTitle').value = '';
            setChapterContent('');
        
            // Reset the current chapter index
            currentChapterIndex = null;
        
            // Hide update button and show add button
            document.querySelector('button[onclick="addChapter()"]').style.display = 'inline-block';
            document.getElementById('updateButton').style.display = 'none';
        
            // Re-render the chapters
            renderChapters();
        }
    }
    

    function renderChapters() {
        const chapterList = document.getElementById('chapterList');
        chapterList.innerHTML = '';
        const chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];

        chapters.forEach((chapter, index) => {
            const chapterDiv = document.createElement('div');
            const chapterTitle = document.createElement('div');
            chapterTitle.classList.add('chapter-title');
            chapterTitle.textContent = chapter.title;

            const chapterContent = document.createElement('div');
            chapterContent.classList.add('chapter-content');
            chapterContent.innerHTML = chapter.content; // Use innerHTML to preserve links
            chapterContent.style.display = 'none'; // Default to hidden

            chapterTitle.addEventListener('click', () => {
                chapterContent.style.display = chapterContent.style.display === 'none' ? 'block' : 'none';
            });

            // Attach context menu event listener
            attachContextMenu(chapterContent, index);

            // Add event listener for clicks on linked words
            chapterContent.addEventListener('click', (e) => {
                if (e.target.classList.contains('linked-word')) {
                    const selectedText = e.target.textContent; // Use the word clicked
                    showSublinkPopup(selectedText, index); // Call showSublinkPopup function to handle the pop-up
                }
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('edit-btn');
            editButton.onclick = () => editChapter(index);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('delete-btn');
            deleteButton.onclick = () => deleteChapter(index);

            chapterDiv.appendChild(chapterTitle);
            chapterDiv.appendChild(chapterContent);
            chapterDiv.appendChild(editButton);
            chapterDiv.appendChild(deleteButton);
            chapterList.appendChild(chapterDiv);
        });

        // Add click event listener to handle linked words inside Quill
        quill.root.addEventListener('click', function (e) {
            if (e.target.classList.contains('linked-word')) {
                const selectedText = e.target.textContent;  // Get the clicked word
                showSublinkPopup(selectedText, currentChapterIndex);  // Show the pop-up when clicking the linked word
            }
        });
    }

    // Helper function to attach context menu event
    function attachContextMenu(chapterContent, chapterIndex) {
        chapterContent.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const selectedText = getSelectedWord();
            if (selectedText) {
                showSublinkPopup(selectedText, chapterIndex);
            }
        });
    }

    function getSelectedWord() {
        const selection = window.getSelection();
        return selection.toString().trim();
    }

    function showSublinkPopup(selectedText, chapterIndex) {
        document.getElementById('selectedWord').textContent = selectedText; // Show selected word
        document.getElementById('sublinkTitle').value = selectedText; // Pre-fill title with selected word
        document.getElementById('sublinkContent').value = ''; // Reset content

        // Show popup
        const sublinkPopup = document.getElementById('sublinkPopup');
        sublinkPopup.style.display = 'block';

        // Save the current selected text and chapter index for later use
        window.currentSelectedText = selectedText;
        window.currentChapterIndex = chapterIndex;

        let chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];
        let chapter = chapters[chapterIndex];

        // Check if the word already has a sublink
        const existingSublink = chapter.sublinks.find(s => s.word.toLowerCase() === selectedText.toLowerCase());

        if (existingSublink) {
            // Pre-fill popup fields with the existing sublink data
            document.getElementById('sublinkTitle').value = existingSublink.title;
            document.getElementById('sublinkContent').value = existingSublink.content;
        }
    }

    function closeSublinkPopup() {
        document.getElementById('sublinkPopup').style.display = 'none';
    }

    window.saveSublink = function () {
        const sublinkTitle = document.getElementById('sublinkTitle').value;
        const sublinkContent = document.getElementById('sublinkContent').value;

        if (!sublinkTitle || !sublinkContent) {
            alert('Please fill out both the title and content fields.');
            return;
        }

        let chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];
        let chapter = chapters[window.currentChapterIndex];

        // Create or update sublink
        if (!chapter.sublinks) {
            chapter.sublinks = [];
        }

        // Check if the word already has a sublink
        const existingSublink = chapter.sublinks.find(s => s.word.toLowerCase() === window.currentSelectedText.toLowerCase());

        if (existingSublink) {
            // Update the existing sublink
            existingSublink.title = sublinkTitle;
            existingSublink.content = sublinkContent;
        } else {
            // Create a new sublink
            chapter.sublinks.push({
                word: window.currentSelectedText,
                title: sublinkTitle,
                content: sublinkContent
            });
        }

        // Update chapter content with new links for the word
        chapter.content = chapter.content.replace(new RegExp(`\\b${window.currentSelectedText}\\b`, 'g'),
            `<a href="#" class="linked-word">${window.currentSelectedText}</a>`);

        // Save updated chapters back to localStorage
        localStorage.setItem(bookTitle, JSON.stringify(chapters));

        renderChapters();  // Re-render the chapters to display the updated sublinks
        closeSublinkPopup();  // Close the popup
    };

    function editChapter(index) {
        const chapters = JSON.parse(localStorage.getItem(bookTitle));
        document.getElementById('chapterTitle').value = chapters[index].title;
        setChapterContent(chapters[index].content);

        currentChapterIndex = index;

        document.querySelector('button[onclick="addChapter()"]').style.display = 'none';
        document.getElementById('updateButton').style.display = 'inline-block';
    }

    function updateChapter() {
        const title = document.getElementById('chapterTitle').value;
        const content = getChapterContent();

        if (title && content) {
            let chapters = JSON.parse(localStorage.getItem(bookTitle)) || [];
            chapters[currentChapterIndex] = {
                title: title,
                content: content,
                sublinks: chapters[currentChapterIndex].sublinks || []
            };

            localStorage.setItem(bookTitle, JSON.stringify(chapters));
            document.getElementById('chapterTitle').value = '';
            setChapterContent('');

            currentChapterIndex = null;

            document.querySelector('button[onclick="addChapter()"]').style.display = 'inline-block';
            document.getElementById('updateButton').style.display = 'none';

            renderChapters();
        } else {
            alert('Please fill out both the title and content fields.');
        }
    }

    // Call this function on page load
    window.onload = function () {
        renderChapters();
    };

    window.addChapter = addChapter;
    window.updateChapter = updateChapter;
    window.renderChapters = renderChapters;
    window.openNav = openNav;
    window.closeNav = closeNav;
    window.toggleSubmenu = toggleSubmenu;
    window.showSublinkPopup = showSublinkPopup;
    window.saveSublink = saveSublink;
    window.closeSublinkPopup = closeSublinkPopup;
});
