document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data with proper initialization
    const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`)) || {
        username: currentUser,
        pendingRequests: [],
        sentRequests: [],
        connections: [],
        feedbackReceived: []
    };

    // Set up header
    document.getElementById('requestsUserInfo').innerHTML = `
        <img src="${userData.photo || 'assets/default-avatar.jpg'}" alt="Profile Photo" class="profile-photo">
        <span>${userData.username}</span>
        <a href="profile.html">Profile</a> | 
        <a href="index.html">Home</a> | 
        <a href="#" id="logoutBtn">Logout</a>
    `;

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${this.dataset.tab}Requests`).classList.add('active');
            loadTab(this.dataset.tab);
        });
    });

    // Initialize star rating system
    setupStarRating();

    
    document.getElementById('submitFeedback').addEventListener('click', submitFeedback);

    // Load initial tab
    loadTab('received');

    function loadTab(tabName) {
        const container = document.getElementById(`${tabName}Requests`);
        container.innerHTML = '';

        
        userData.pendingRequests = userData.pendingRequests || [];
        userData.sentRequests = userData.sentRequests || [];
        userData.connections = userData.connections || [];
        userData.feedbackReceived = userData.feedbackReceived || [];

        if (tabName === 'connections') {
            displayConnections(container);
        } else if (tabName === 'received') {
            displayReceivedRequests(container);
        } else if (tabName === 'sent') {
            displaySentRequests(container);
        } else if (tabName === 'feedback') {
            displayFeedback(container);
        }
    }

    function displayConnections(container) {
        if (userData.connections.length === 0) {
            container.innerHTML = '<div class="empty-message"><p>No connections yet</p></div>';
            return;
        }

        userData.connections.forEach(connection => {
            const otherUser = connection.fromUser === currentUser ? connection.toUser : connection.fromUser;
            const otherUserData = JSON.parse(localStorage.getItem(`user_${otherUser}`)) || {};

            const card = document.createElement('div');
            card.className = 'connection-card';
            card.innerHTML = `
                <div class="connection-header">
                    <img src="${otherUserData.photo || 'assets/default-avatar.jpg'}" 
                         alt="${otherUser}" class="user-avatar">
                    <div class="connection-info">
                        <h3>${otherUserData.fullName || otherUser}</h3>
                        <div class="skills-exchange">
                            <div class="skill-direction">
                                <span class="direction-label">You received:</span>
                                <span class="skill-received">${connection.skillsOffered.join(', ')}</span>
                            </div>
                            <div class="skill-direction">
                                <span class="direction-label">You offered:</span>
                                <span class="skill-given">${connection.skillsWanted.join(', ')}</span>
                            </div>
                        </div>
                        <p class="connection-date">
                            Connected on ${new Date(connection.date).toLocaleDateString()}
                        </p>
                        <button class="give-feedback-btn" data-user="${otherUser}">
                            <i class="fas fa-star"></i> Give Feedback
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

       
        document.querySelectorAll('.give-feedback-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                openFeedbackModal(this.dataset.user);
            });
        });
    }

    function displayFeedback(container) {
        if (userData.feedbackReceived.length === 0) {
            container.innerHTML = '<div class="empty-message"><p>No feedback received yet</p></div>';
            return;
        }

        userData.feedbackReceived.forEach(feedback => {
            const feedbackUserData = JSON.parse(localStorage.getItem(`user_${feedback.fromUser}`)) || {};
            const card = document.createElement('div');
            card.className = 'feedback-card';
            card.innerHTML = `
                <div class="feedback-header">
                    <div class="feedback-rating">
                        ${'<i class="fas fa-star"></i>'.repeat(feedback.rating)}
                        ${'<i class="far fa-star"></i>'.repeat(5 - feedback.rating)}
                    </div>
                    <h3>From: ${feedbackUserData.fullName || feedback.fromUser}</h3>
                </div>
                <div class="feedback-content">
                    <p>${feedback.comment}</p>
                </div>
                <p class="feedback-date">
                    ${new Date(feedback.date).toLocaleDateString()}
                </p>
            `;
            container.appendChild(card);
        });
    }

    function displayReceivedRequests(container) {
        if (userData.pendingRequests.length === 0) {
            container.innerHTML = '<div class="empty-message"><p>No pending requests</p></div>';
            return;
        }

        userData.pendingRequests.forEach(request => {
            const requesterData = JSON.parse(localStorage.getItem(`user_${request.fromUser}`)) || {};
            const card = document.createElement('div');
            card.className = 'request-card';
            card.dataset.id = request.id;
            card.innerHTML = `
                <div class="request-header">
                    <img src="${request.fromUserPhoto || 'assets/default-avatar.jpg'}" 
                         alt="${request.fromUser}" class="user-avatar">
                    <div class="request-info">
                        <h3>${request.fromUser}</h3>
                        <div class="skills-info">
                            <p><strong>Offers:</strong> ${request.skillsOffered.join(', ')}</p>
                            <p><strong>Wants:</strong> ${request.skillsWanted.join(', ')}</p>
                        </div>
                        <div class="request-actions">
                            <button class="btn accept-btn">Accept</button>
                            <button class="btn decline-btn">Decline</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Add event listeners
        document.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                handleRequest(this.closest('.request-card').dataset.id, true);
            });
        });

        document.querySelectorAll('.decline-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                handleRequest(this.closest('.request-card').dataset.id, false);
            });
        });
    }

    function displaySentRequests(container) {
        if (userData.sentRequests.length === 0) {
            container.innerHTML = '<div class="empty-message"><p>No sent requests</p></div>';
            return;
        }

        userData.sentRequests.forEach(request => {
            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="request-header">
                    <img src="${userData.photo || 'assets/default-avatar.jpg'}" 
                         alt="You" class="user-avatar">
                    <div class="request-info">
                        <h3>You → ${request.toUser}</h3>
                        <div class="skills-info">
                            <p><strong>Offered:</strong> ${request.skillsOffered.join(', ')}</p>
                            <p><strong>Requested:</strong> ${request.skillsWanted.join(', ')}</p>
                        </div>
                        <p class="request-status ${request.status}">
                            Status: ${request.status}
                        </p>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    function handleRequest(requestId, accept) {
        const requestIndex = userData.pendingRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const request = userData.pendingRequests[requestIndex];
        const action = accept ? 'accepted' : 'declined';
        request.status = action;

        // Update sender's record
        const senderData = JSON.parse(localStorage.getItem(`user_${request.fromUser}`)) || {};
        const senderRequestIndex = senderData.sentRequests.findIndex(r => r.id === requestId);

        if (senderRequestIndex !== -1) {
            senderData.sentRequests[senderRequestIndex].status = action;

            if (accept) {
                // Create connection for both users
                const connection = {
                    id: requestId,
                    fromUser: request.fromUser,
                    fromUserPhoto: request.fromUserPhoto,
                    toUser: currentUser,
                    toUserPhoto: userData.photo || 'assets/default-avatar.jpg',
                    skillsOffered: request.skillsOffered,
                    skillsWanted: request.skillsWanted,
                    date: new Date().toISOString(),
                    status: 'connected'
                };

                userData.connections.unshift(connection);
                senderData.connections = senderData.connections || [];
                senderData.connections.unshift(connection);
            }

            localStorage.setItem(`user_${request.fromUser}`, JSON.stringify(senderData));
        }

        // Remove from pending requests
        userData.pendingRequests.splice(requestIndex, 1);
        localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));

        // Show notification
        showNotification(`Request ${action}!`, accept ? 'success' : 'error');
        
        // Reload all tabs
        loadTab('received');
        loadTab('sent');
        loadTab('connections');
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function openFeedbackModal(userId) {
        const modal = document.getElementById('feedbackModal');
        modal.style.display = 'block';
        modal.dataset.user = userId;

        // Reset form
        document.getElementById('ratingValue').value = '0';
        document.getElementById('feedbackText').value = '';
        resetStars();

        // Close modal when clicking X
        document.querySelector('.close-btn').onclick = function() {
            modal.style.display = 'none';
        };

        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    function resetStars() {
        const stars = document.querySelectorAll('.stars i');
        stars.forEach(star => {
            star.classList.remove('fas', 'active', 'hovered');
            star.classList.add('far');
        });
    }

    function setupStarRating() {
        const stars = document.querySelectorAll('.stars i');
        
        stars.forEach(star => {
            // Click event
            star.addEventListener('click', function() {
                const rating = parseInt(this.dataset.rating);
                document.getElementById('ratingValue').value = rating;
                
                resetStars();
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas', 'active');
                    }
                });
            });
            
            // Hover events
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.dataset.rating);
                resetStars();
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('hovered');
                    }
                });
            });
            
            star.addEventListener('mouseout', function() {
                const currentRating = parseInt(document.getElementById('ratingValue').value);
                resetStars();
                if (currentRating > 0) {
                    stars.forEach((s, index) => {
                        if (index < currentRating) {
                            s.classList.remove('far');
                            s.classList.add('fas', 'active');
                        }
                    });
                }
            });
        });
    }

    function submitFeedback() {
        const modal = document.getElementById('feedbackModal');
        const userId = modal.dataset.user;
        const rating = parseInt(document.getElementById('ratingValue').value);
        const comment = document.getElementById('feedbackText').value.trim();

        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        if (!comment) {
            alert('Please enter your feedback');
            return;
        }

        // Get the target user's data
        const targetUserData = JSON.parse(localStorage.getItem(`user_${userId}`)) || {};
        targetUserData.feedbackReceived = targetUserData.feedbackReceived || [];

        // Create feedback object
        const feedback = {
            fromUser: currentUser,
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        };

        // Add feedback to target user
        targetUserData.feedbackReceived.unshift(feedback);
        localStorage.setItem(`user_${userId}`, JSON.stringify(targetUserData));

        // Close modal
        modal.style.display = 'none';
        showNotification('Feedback submitted successfully!', 'success');

        // Reload feedback tab if it's active
        if (document.getElementById('feedbackRequests').classList.contains('active')) {
            loadTab('feedback');
        }
    }
});