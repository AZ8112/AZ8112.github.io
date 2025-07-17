document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    let currentChapterId = null;

    const quill = new Quill('#chapterContent', { theme: 'snow' });

    const header = document.getElementById('header');

    if (bookId) {
        db.collection('books').doc(bookId).get().then(doc => {
            if (doc.exists) {
                const bookData = doc.data();
                header.textContent = `Book: ${bookData.title || "Untitled"} - Chapters`;
                document.getElementById("descriptionInput").value = bookData.description || "";
                document.getElementById("charCount").textContent = `${(bookData.description || "").length} / 1000`;
            } else {
                header.textContent = "Book not found";
            }
        }).catch(err => {
            console.error("Error fetching book:", err);
            header.textContent = "Error loading book";
        });
    } else {
        header.textContent = 'Your Chapters';
    }

    document.getElementById("saveDescription").addEventListener("click", function () {
        const description = document.getElementById("descriptionInput").value;
        if (!bookId) return alert("Book ID missing.");
        if (!description) return alert("Description can't be empty.");
        db.collection("books").doc(bookId).update({
            description: description
        }).then(() => {
            alert("Description saved!");
        }).catch(err => {
            console.error("Error saving description:", err);
            alert("Failed to save description.");
        });
    });

    function getChapterContent() {
        return quill.root.innerHTML;
    }

    function setChapterContent(content) {
        quill.root.innerHTML = content;
    }

    function addChapter() {
        const title = document.getElementById('chapterTitle').value;
        const content = getChapterContent();

        if (!title || !content) return alert("Please fill out both fields.");

        db.collection('books').doc(bookId).collection('chapters').add({
            title,
            content,
            sublinks: [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            document.getElementById('chapterTitle').value = '';
            setChapterContent('');
            renderChapters();
        }).catch(err => console.error("Add failed:", err));
    }

    function updateChapter() {
        const title = document.getElementById('chapterTitle').value;
        const content = getChapterContent();

        if (!title || !content || !currentChapterId) return alert("Missing data or selection.");

        db.collection('books').doc(bookId).collection('chapters').doc(currentChapterId)
            .update({ title, content })
            .then(() => {
                document.getElementById('chapterTitle').value = '';
                setChapterContent('');
                currentChapterId = null;
                toggleButtons();
                renderChapters();
            })
            .catch(err => console.error("Update failed:", err));
    }

    function deleteChapter(chapterId) {
        if (!confirm("Delete this chapter?")) return;

        db.collection('books').doc(bookId).collection('chapters').doc(chapterId).delete()
            .then(() => {
                currentChapterId = null;
                toggleButtons();
                renderChapters();
            })
            .catch(err => console.error("Delete failed:", err));
    }

    function editChapter(docId, data) {
        document.getElementById('chapterTitle').value = data.title;
        setChapterContent(data.content);
        currentChapterId = docId;
        toggleButtons(true);
    }

    function toggleButtons(editing = false) {
        document.querySelector('button[onclick="addChapter()"]').style.display = editing ? 'none' : 'inline-block';
        document.getElementById('updateButton').style.display = editing ? 'inline-block' : 'none';
    }

    function attachContextMenu(element, chapterId, sublinks = []) {
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const selected = getSelectedWord();
            if (selected) {
                showSublinkPopup(selected, chapterId, sublinks);
            }
        });
    }

    function getSelectedWord() {
        return window.getSelection().toString().trim();
    }

    function showSublinkPopup(selectedWord, chapterId, sublinks = []) {
        const existing = sublinks.find(s => s.word.toLowerCase() === selectedWord.toLowerCase());
        document.getElementById('selectedWord').textContent = selectedWord;
        document.getElementById('sublinkTitle').value = existing?.title || selectedWord;
        document.getElementById('sublinkContent').value = existing?.content || '';
        document.getElementById('sublinkPopup').style.display = 'block';
        window.currentSelectedText = selectedWord;
        window.currentChapterId = chapterId;
    }

    function closeSublinkPopup() {
        document.getElementById('sublinkPopup').style.display = 'none';
    }

    window.saveSublink = function () {
        const title = document.getElementById('sublinkTitle').value;
        const content = document.getElementById('sublinkContent').value;
        const word = window.currentSelectedText;
        const chapterId = window.currentChapterId;

        if (!title || !content || !word || !chapterId) return alert("Missing fields");

        const chapterRef = db.collection("books").doc(bookId).collection("chapters").doc(chapterId);

        chapterRef.get().then(doc => {
            const chapter = doc.data();
            let sublinks = chapter.sublinks || [];
            const index = sublinks.findIndex(s => s.word.toLowerCase() === word.toLowerCase());

            if (index >= 0) {
                sublinks[index].title = title;
                sublinks[index].content = content;
            } else {
                sublinks.push({ word, title, content });
            }

            const updatedContent = chapter.content.replace(
                new RegExp(`\\b${word}\\b`, 'g'),
                `<a href="#" class="linked-word">${word}</a>`
            );

            return chapterRef.update({ sublinks, content: updatedContent });
        }).then(() => {
            closeSublinkPopup();
            renderChapters();
        }).catch(err => console.error("Sublink update failed:", err));
    };

    function renderChapters() {
        const chapterList = document.getElementById('chapterList');
        chapterList.innerHTML = '';

        db.collection('books').doc(bookId).collection('chapters').orderBy('timestamp').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const wrapper = document.createElement('div');
                    const title = document.createElement('div');
                    const content = document.createElement('div');
                    const editBtn = document.createElement('button');
                    const delBtn = document.createElement('button');

                    title.className = 'chapter-title';
                    content.className = 'chapter-content';
                    editBtn.className = 'edit-btn';
                    delBtn.className = 'delete-btn';

                    title.textContent = data.title;
                    content.innerHTML = data.content;
                    content.style.display = 'none';

                    editBtn.textContent = 'Edit';
                    delBtn.textContent = 'Delete';

                    title.onclick = () => content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    editBtn.onclick = () => editChapter(doc.id, data);
                    delBtn.onclick = () => deleteChapter(doc.id);

                    attachContextMenu(content, doc.id, data.sublinks || []);

                    content.addEventListener('click', e => {
                        if (e.target.classList.contains('linked-word')) {
                            showSublinkPopup(e.target.textContent, doc.id, data.sublinks || []);
                        }
                    });

                    wrapper.appendChild(title);
                    wrapper.appendChild(content);
                    wrapper.appendChild(editBtn);
                    wrapper.appendChild(delBtn);
                    chapterList.appendChild(wrapper);
                });

                quill.root.addEventListener('click', e => {
                    if (e.target.classList.contains('linked-word')) {
                        showSublinkPopup(e.target.textContent, currentChapterId);
                    }
                });
            });
    }

    window.addChapter = addChapter;
    window.updateChapter = updateChapter;
    window.renderChapters = renderChapters;
    window.closeSublinkPopup = closeSublinkPopup;
    window.openNav = () => document.getElementById("mySidepanel").style.width = "250px";
    window.closeNav = () => document.getElementById("mySidepanel").style.width = "0";
    window.toggleSubmenu = (id) => {
        const el = document.getElementById(id);
        el.style.display = el.style.display === "block" ? "none" : "block";
    };

    renderChapters();
});
