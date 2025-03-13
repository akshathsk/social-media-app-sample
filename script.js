document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const postPopup = document.getElementById('postPopup');
    const postDetails = document.getElementById('postDetails');
    const createPostSection = document.getElementById('createPostSection');
    const postsContainer = document.getElementById('postsContainer');
    const peopleSection = document.getElementById('peopleSection');
    const peopleContainer = document.getElementById('peopleContainer');

    // Default list of people to follow
    const defaultPeople = [
        { username: "Alice" },
        { username: "Bob" },
        { username: "Charlie" },
        { username: "Diana" },
        { username: "Ethan" }
    ];

    // Utility functions for modal open/close
    function openModal(modal) {
        modal.style.display = 'block';
    }
    function closeModal(modal) {
        modal.style.display = 'none';
    }

    // Attach close events for modal close buttons (x)
    document.querySelectorAll('.close').forEach(function(closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modalId = closeBtn.getAttribute('data-modal');
            closeModal(document.getElementById(modalId));
        });
    });

    // Close modal when clicking outside modal content
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    });

    // In-memory storage simulation (using localStorage)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Ensure currentUser.following exists if logged in
    if (currentUser && !currentUser.following) {
        currentUser.following = [];
    }

    // Update localStorage
    function updateStorage() {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // Update UI based on login state
    function updateUI() {
        if (currentUser) {
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            createPostSection.style.display = 'block';
            peopleSection.style.display = 'block';
        } else {
            loginBtn.style.display = 'inline-block';
            signupBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            createPostSection.style.display = 'none';
            peopleSection.style.display = 'none';
        }
        renderPosts();
        renderPeople();
    }

    // Render posts feed (newest first)
    function renderPosts() {
        postsContainer.innerHTML = '';
        posts.slice().reverse().forEach(function(post) {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';
            postDiv.innerHTML = `<strong>${post.username}</strong>: ${post.content} <br><small>${new Date(post.timestamp).toLocaleString()}</small>`;
            postDiv.addEventListener('click', function() {
                // Show post details in popup
                postDetails.innerHTML = `<strong>${post.username}</strong>: ${post.content} <br><small>${new Date(post.timestamp).toLocaleString()}</small>`;
                openModal(postPopup);
            });
            postsContainer.appendChild(postDiv);
        });
    }

    // Render default people list with follow/unfollow buttons
    function renderPeople() {
        peopleContainer.innerHTML = '';
        defaultPeople.forEach(function(person) {
            const personDiv = document.createElement('div');
            personDiv.className = 'person';
            const nameSpan = document.createElement('span');
            nameSpan.textContent = person.username;
            const followBtn = document.createElement('button');
            // Check if current user already follows this person
            const isFollowing = currentUser && currentUser.following && currentUser.following.includes(person.username);
            followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
            followBtn.addEventListener('click', function(e) {
                // Prevent any parent click events
                e.stopPropagation();
                if (!currentUser) return; // Should not happen as section is hidden when logged out
                if (!currentUser.following) {
                    currentUser.following = [];
                }
                if (isFollowing) {
                    // Unfollow: remove person.username from following list
                    currentUser.following = currentUser.following.filter(name => name !== person.username);
                    showPopup(`Unfollowed ${person.username}.`);
                } else {
                    // Follow: add person.username to following list
                    currentUser.following.push(person.username);
                    showPopup(`Now following ${person.username}.`);
                }
                updateStorage();
                renderPeople(); // re-render list to update button text
            });
            personDiv.appendChild(nameSpan);
            personDiv.appendChild(followBtn);
            peopleContainer.appendChild(personDiv);
        });
    }

    // Event listeners for login, signup, and logout buttons
    loginBtn.addEventListener('click', function() {
        openModal(loginModal);
    });
    signupBtn.addEventListener('click', function() {
        openModal(signupModal);
    });
    logoutBtn.addEventListener('click', function() {
        currentUser = null;
        updateStorage();
        updateUI();
        showPopup('Logged out successfully!');
    });

    // Login submission
    document.getElementById('loginSubmit').addEventListener('click', function() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        if (!username || !password) {
            showPopup('Please fill in all fields for login.');
            return;
        }
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            // Ensure following array exists for the user
            if (!currentUser.following) {
                currentUser.following = [];
            }
            updateStorage();
            updateUI();
            closeModal(loginModal);
            showPopup('Login successful!');
        } else {
            showPopup('Invalid username or password.');
        }
    });

    // Signup submission
    document.getElementById('signupSubmit').addEventListener('click', function() {
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        if (!username || !password) {
            showPopup('Please fill in all fields for sign up.');
            return;
        }
        if (users.find(u => u.username === username)) {
            showPopup('Username already exists.');
            return;
        }
        // Create new user with an empty following list
        const newUser = { username, password, following: [] };
        users.push(newUser);
        currentUser = newUser;
        updateStorage();
        updateUI();
        closeModal(signupModal);
        showPopup('Sign up successful!');
    });

    // Post creation
    document.getElementById('postBtn').addEventListener('click', function() {
        const content = document.getElementById('postContent').value.trim();
        if (!content) {
            showPopup('Please enter some content for your post.');
            return;
        }
        const newPost = {
            username: currentUser.username,
            content,
            timestamp: Date.now()
        };
        posts.push(newPost);
        updateStorage();
        renderPosts();
        document.getElementById('postContent').value = '';
        showPopup('Post created successfully!');
    });

    // Custom popup function (uses a temporary modal instead of alert)
    function showPopup(message) {
        const popup = document.createElement('div');
        popup.className = 'modal';
        popup.style.display = 'block';
        popup.innerHTML = `
      <div class="modal-content">
        <span class="close" data-popup="true">&times;</span>
        <p>${message}</p>
      </div>
    `;
        document.body.appendChild(popup);

        // Close popup on clicking the close button
        popup.querySelector('.close').addEventListener('click', function() {
            document.body.removeChild(popup);
        });
        // Close when clicking outside the popup content
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                document.body.removeChild(popup);
            }
        });
        // Auto-close after 3 seconds
        setTimeout(function() {
            if (document.body.contains(popup)) {
                document.body.removeChild(popup);
            }
        }, 3000);
    }

    // Initialize UI on page load
    updateUI();
});
