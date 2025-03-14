document.addEventListener("DOMContentLoaded", function() {
    // Get the different sections
    const loginSection = document.getElementById("login-section");
    const signupSection = document.getElementById("signup-section");
    const appSection = document.getElementById("app-section");

    // Modal elements
    const popupModal = document.getElementById("popup-modal");
    const modalMessage = document.getElementById("modal-message");
    const closeButton = document.querySelector(".close-button");

    // Function to show popup modal with a message
    function showPopup(message) {
        modalMessage.textContent = message;
        popupModal.style.display = "flex";
    }

    // Close modal when close button is clicked
    closeButton.addEventListener("click", function() {
        popupModal.style.display = "none";
    });

    // Function to display one section and hide others
    function showSection(section) {
        loginSection.style.display = "none";
        signupSection.style.display = "none";
        appSection.style.display = "none";
        section.style.display = "block";
    }

    // On page load, check if a user is logged in
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
        showSection(appSection);
    } else {
        showSection(loginSection);
    }

    // Toggle between login and signup views
    document.getElementById("show-signup").addEventListener("click", function(e) {
        e.preventDefault();
        showSection(signupSection);
    });
    document.getElementById("show-login").addEventListener("click", function(e) {
        e.preventDefault();
        showSection(loginSection);
    });

    // --- Login Functionality ---
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            showSection(appSection);
        } else {
            loginError.textContent = "Invalid username or password.";
        }
    });

    // --- Signup Functionality ---
    const signupForm = document.getElementById("signup-form");
    const signupError = document.getElementById("signup-error");
    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("signup-username").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm-password").value;

        if (password !== confirmPassword) {
            signupError.textContent = "Passwords do not match.";
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];
        if (users.some(user => user.username === username)) {
            signupError.textContent = "Username already exists.";
            return;
        }

        const newUser = { username, email, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        showSection(appSection);
    });

    // --- Logout Functionality ---
    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        localStorage.removeItem("currentUser");
        showSection(loginSection);
    });

    // --- App (Main) Section Functionality ---
    // Post creation functionality
    const postBtn = document.getElementById("post-btn");
    const postContent = document.getElementById("post-content");
    const feed = document.getElementById("feed");

    postBtn.addEventListener("click", function() {
        const content = postContent.value.trim();
        if (content !== "") {
            createPost(content);
            postContent.value = "";
        }
    });

    function createPost(content) {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        const postParagraph = document.createElement("p");
        postParagraph.textContent = content;
        postDiv.appendChild(postParagraph);

        const likeBtn = document.createElement("button");
        likeBtn.classList.add("like-btn");
        likeBtn.textContent = "Like";
        likeBtn.addEventListener("click", function() {
            showPopup("You liked this post!");
        });
        postDiv.appendChild(likeBtn);

        // Add the new post at the top of the feed
        feed.insertBefore(postDiv, feed.firstChild);
    }

    // Render default suggestions to follow
    const suggestions = [
        { username: "john_doe", name: "John Doe" },
        { username: "jane_smith", name: "Jane Smith" },
        { username: "tech_guru", name: "Tech Guru" },
        { username: "travel_bug", name: "Travel Bug" },
        { username: "foodie", name: "Foodie" }
    ];

    const suggestionsList = document.getElementById("suggestions-list");
    suggestions.forEach(suggestion => {
        const li = document.createElement("li");
        li.textContent = suggestion.name;

        const followBtn = document.createElement("button");
        followBtn.classList.add("follow-btn");
        followBtn.textContent = "Follow";
        followBtn.addEventListener("click", function() {
            showPopup("You followed " + suggestion.name + "!");
            followBtn.disabled = true;
            followBtn.textContent = "Following";
        });
        li.appendChild(followBtn);
        suggestionsList.appendChild(li);
    });
});
