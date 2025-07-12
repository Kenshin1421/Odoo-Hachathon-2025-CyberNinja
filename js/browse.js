document.addEventListener('DOMContentLoaded', function() {
    
    const currentUser = localStorage.getItem('currentUser');
    const userInfoDiv = document.getElementById('browseUserInfo');
    
    if (currentUser) {
        const userData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
        
        userInfoDiv.innerHTML = `
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
    } else {
        userInfoDiv.innerHTML = `
            <a href="login.html">Login</a> | <a href="signup.html">Sign Up</a>
        `;
    }

    
    document.getElementById('applyFilters').addEventListener('click', function() {
        const skill = document.getElementById('skillFilter').value;
        const location = document.getElementById('locationFilter').value;
        searchUsers(skill, location);
    });
});

function searchUsers(skill, location) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '<p>Loading results...</p>';
    
    
    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_') && !key.endsWith('_current')) {
            allUsers.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    
    
    const filteredUsers = allUsers.filter(user => {
        
        if (user.visibility === 'private' || user.username === localStorage.getItem('currentUser')) {
            return false;
        }
        
        
        if (skill && skill.trim() !== '') {
            const searchSkill = skill.toLowerCase().trim();
            
            const hasMatchingSkill = user.skills?.some(wantedSkill => 
                wantedSkill.toLowerCase().includes(searchSkill)
            );
            if (!hasMatchingSkill) return false;
        }
        
        
        if (location && location.trim() !== '') {
            const searchLocation = location.toLowerCase().trim();
            if (!user.location?.toLowerCase().includes(searchLocation)) {
                return false;
            }
        }
        
        return true;
    });
    
    
    displayResults(filteredUsers);
}

function displayResults(users) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (users.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">No users found matching your criteria.</p>';
        return;
    }
    
    resultsContainer.innerHTML = '';
    
    users.forEach(user => {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="user-info-small">
                    <img src="${user.photo || 'assets/default-avatar.jpg'}" alt="${user.username}">
                    <div class="user-details">
                        <h3>${user.fullName || user.username}</h3>
                        <p><i class="fas fa-map-marker-alt"></i> ${user.location || 'Location not specified'}</p>
                        <p><i class="far fa-calendar-alt"></i> Available: ${formatAvailability(user.availability) || 'Flexible'}</p>
                    </div>
                </div>
                <button class="request-btn" data-user="${user.username}">
                    <i class="fas fa-exchange-alt"></i> Request Swap
                </button>
            </div>
            <div class="skills-section">
                <h4><i class="fas fa-hands-helping"></i> Offers:</h4>
                <div class="skills-list">
                    ${user.skills?.map(skill => `<span class="skill-tag">${skill}</span>`).join('') || '<span>None</span>'}
                </div>
            </div>
            <div class="skills-section">
                <h4><i class="fas fa-lightbulb"></i> Wants:</h4>
                <div class="skills-list">
                    ${user.skillsWanted?.map(skill => `<span class="skill-tag">${skill}</span>`).join('') || '<span>None</span>'}
                </div>
            </div>
        `;
        
        resultsContainer.appendChild(resultCard);
    });
    
    
    addRequestButtonHandlers();
}


function formatAvailability(availability) {
    const availabilityMap = {
        'weekdays': 'Weekdays',
        'weekends': 'Weekends',
        'both': 'Weekdays & Weekends',
        'flexible': 'Flexible'
    };
    return availabilityMap[availability] || 'Flexible';
}

function addRequestButtonHandlers() {
    document.querySelectorAll('.request-btn').forEach(button => {
        button.addEventListener('click', function() {
            const requestedUser = this.getAttribute('data-user');
            const currentUser = localStorage.getItem('currentUser');
            
            if (!currentUser) {
                alert('Please log in to send swap requests');
                window.location.href = 'login.html';
                return;
            }
            
            const currentUserData = JSON.parse(localStorage.getItem(`user_${currentUser}`));
            const targetUserData = JSON.parse(localStorage.getItem(`user_${requestedUser}`));
            
            
            const requestId = Date.now().toString();
            const newRequest = {
                id: requestId,
                fromUser: currentUser,
                fromUserPhoto: currentUserData.photo || 'assets/default-avatar.jpg',
                skillsOffered: currentUserData.skills || [],
                skillsWanted: currentUserData.skillsWanted || [],
                date: new Date().toISOString(),
                status: 'pending',
                toUser: requestedUser
            };
            
            
            currentUserData.sentRequests = currentUserData.sentRequests || [];
            targetUserData.pendingRequests = targetUserData.pendingRequests || [];
            
            
            currentUserData.sentRequests.push(newRequest);
            targetUserData.pendingRequests.push(newRequest);
            
            
            localStorage.setItem(`user_${currentUser}`, JSON.stringify(currentUserData));
            localStorage.setItem(`user_${requestedUser}`, JSON.stringify(targetUserData));
            
            
            this.textContent = 'Request Pending';
            this.disabled = true;
            
            alert(`Swap request sent to ${requestedUser}!`);
        });
    });
}