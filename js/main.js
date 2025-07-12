// Load user data on homepage
document.addEventListener('DOMContentLoaded', function() {
    loadRecentUsers();
    
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userInfoDiv = document.getElementById('userInfo');
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        
        userInfoDiv.innerHTML = `
            <img src="${userData.photo || 'assets/default-avatar.jpg'}" alt="Profile Photo" class="profile-photo">
            <span>${userData.username}</span>
            <a href="profile.html">Profile</a> | 
            <a href="requests.html">Requests 
                ${userData.pendingRequests?.length > 0 ? 
                `<span class="notification-badge">${userData.pendingRequests.length}</span>` : ''}
            </a> | 
            <a href="browse.html">Browse</a> | 
            <a href="#" id="logoutBtn">Logout</a>
        `;
        
        document.getElementById('logout').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});

function loadRecentUsers() {
    
    const userGrid = document.getElementById('userGrid');
    
    // Clear existing content
    userGrid.innerHTML = '';
    
    
    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_') && !key.endsWith('_current')) {
            allUsers.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    
    
    allUsers.sort(() => Math.random() - 0.5);
    
    
    const recentUsers = allUsers.slice(0, 6);
    
    recentUsers.forEach(user => {
        if (user.visibility !== 'private') {
            const userCard = document.createElement('div');
            userCard.className = 'user-card';
            
            userCard.innerHTML = `
                <div class="user-info-small">
                    <img src="${user.photo || 'assets/default-avatar.jpg'}" alt="${user.username}">
                    <div class="user-details">
                        <h3>${user.fullName || user.username}</h3>
                        <p>${user.location || 'Location not specified'}</p>
                    </div>
                </div>
                <div class="skills-section">
                    <h4>Offers: ${user.skills.join(' | ')}</h4>
                </div>
                <a href="view-profile.html?user=${user.username}" class="request-btn">View Profile</a>
            `;
            userGrid.appendChild(userCard);
        }
    });
}

function searchSkills() {
    const searchTerm = document.getElementById('skillSearch').value.trim();
    if (searchTerm) {
        window.location.href = `browse.html?search=${encodeURIComponent(searchTerm)}`;
    }
}
