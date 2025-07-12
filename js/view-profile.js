document.addEventListener('DOMContentLoaded', function() {
    // Get username from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    
    if (!username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user data
    const userKey = `user_${username}`;
    const userData = JSON.parse(localStorage.getItem(userKey));
    
    if (!userData) {
        alert('User not found');
        window.location.href = 'index.html';
        return;
    }
    
    // Update header if current user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const currentUserData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        const userInfoDiv = document.getElementById('userInfo');
        
        userInfoDiv.innerHTML = `
            <img src="${currentUserData.photo || 'assets/default-avatar.jpg'}" alt="Profile Photo" class="profile-photo">
            <span>${currentUserData.username}</span>
            <a href="profile.html">Profile</a> | 
            <a href="requests.html">Requests 
                ${currentUserData.pendingRequests?.length > 0 ? 
                `<span class="notification-badge">${currentUserData.pendingRequests.length}</span>` : ''}
            </a> | 
            <a href="browse.html">Browse</a> | 
            <a href="#" id="logoutBtn">Logout</a>
        `;
        
        document.getElementById('logoutBtn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Display user info
    document.getElementById('profilePicture').src = userData.photo || 'assets/default-avatar.jpg';
    document.getElementById('fullName').textContent = userData.fullName || username;
    document.getElementById('location').textContent = userData.location || 'Not specified';
    document.getElementById('availability').textContent = formatAvailability(userData.availability);
    
    // Display skills
    const skillsContainer = document.getElementById('skills');
    const skillsWantedContainer = document.getElementById('skillsWanted');
    
    if (userData.skills && userData.skills.length > 0) {
        userData.skills.forEach(skill => {
            const skillElement = document.createElement('span');
            skillElement.className = 'skill-tag';
            skillElement.textContent = skill;
            skillsContainer.appendChild(skillElement);
        });
    } else {
        skillsContainer.textContent = 'No skills listed';
    }
    
    if (userData.skillsWanted && userData.skillsWanted.length > 0) {
        userData.skillsWanted.forEach(skill => {
            const skillElement = document.createElement('span');
            skillElement.className = 'skill-tag';
            skillElement.textContent = skill;
            skillsWantedContainer.appendChild(skillElement);
        });
    } else {
        skillsWantedContainer.textContent = 'No skills wanted listed';
    }
});

function formatAvailability(availability) {
    const availabilityMap = {
        'weekdays': 'Weekdays',
        'weekends': 'Weekends',
        'both': 'Weekdays and Weekends',
        'flexible': 'Flexible'
    };
    return availabilityMap[availability] || 'Flexible';
}