// Fetch word links from API
async function fetchSublinks() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/word-links');  // Fetch word links from the API
        const sublinks = await response.json();

        const sublinkList = document.getElementById('sublinkList');
        sublinkList.innerHTML = '';  // Clear the list before populating

        sublinks.forEach(link => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${link.word} - ${link.title}</span>
                <button onclick="editLink('${link.linkId}')">Edit</button>
                <button onclick="deleteLink('${link.linkId}')">Delete</button>
            `;
            sublinkList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching word links:', error);
    }
}

// Call fetchSublinks when the page loads
window.onload = function () {
    fetchSublinks();
};

// Function to edit a sublink
function editLink(linkId) {
    fetch(`/api/word-links/${linkId}`)
        .then(response => response.json())
        .then(data => {
            // Populate modal with link data
            document.getElementById('sublinkTitle').value = data.title;
            document.getElementById('sublinkDescription').value = data.content;

            // Open modal for editing
            document.getElementById('sublinkModal').classList.remove('hidden');

            // Save changes
            document.getElementById('saveButton').onclick = function () {
                const updatedTitle = document.getElementById('sublinkTitle').value;
                const updatedContent = document.getElementById('sublinkDescription').value;

                fetch(`/api/word-links/${linkId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ title: updatedTitle, content: updatedContent })
                })
                    .then(response => response.json())
                    .then(() => {
                        alert('Sublink updated successfully!');
                        document.getElementById('sublinkModal').classList.add('hidden');
                        fetchSublinks(); // Refresh list
                    })
                    .catch(error => {
                        console.error('Error updating sublink:', error);
                    });
            };
        })
        .catch(error => {
            console.error('Error fetching sublink details:', error);
        });
}

// Function to delete a sublink
function deleteLink(linkId) {
    fetch(`/api/word-links/${linkId}`, {
        method: 'DELETE'
    })
    .then(() => {
        alert('Sublink deleted successfully!');
        fetchSublinks(); // Refresh list
    })
    .catch(error => {
        console.error('Error deleting sublink:', error);
    });
}

// Function to close the sublink modal
function closeSublinkModal() {
    document.getElementById('sublinkModal').classList.add('hidden');
}

// Close sublink modal when the cancel button is clicked
//document.getElementById("cancelSublink").onclick = closeSublinkModal;

// Sidebar navigation functions
function openNav() {
    document.getElementById("mySidepanel").style.width = "250px";
}

function closeNav() {
    document.getElementById("mySidepanel").style.width = "0";
}

// Function to toggle submenu
function toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    submenu.style.display = submenu.style.display === "block" ? "none" : "block";
}
