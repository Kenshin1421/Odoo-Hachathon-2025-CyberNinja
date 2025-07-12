document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data from localStorage
    const userKey = `user_${currentUser}`;
    let userData = JSON.parse(localStorage.getItem(userKey));
    
    if (!userData) {
        userData = {
            username: currentUser,
            fullName: '',
            location: '',
            availability: 'flexible',
            visibility: 'public',
            skills: [],
            skillsWanted: [],
            pendingRequests: [],  
            sentRequests: [],     
            connections: [],
            photo: 'assets/default-avatar.jpg'
        };
        localStorage.setItem(userKey, JSON.stringify(userData));
    }
    
    // Display user info
    document.getElementById('headerUsername').textContent = currentUser;
    document.getElementById('fullName').value = userData.fullName || '';
    document.getElementById('location').value = userData.location || '';
    document.getElementById('availability').value = userData.availability || 'flexible';
    
    // Set profile visibility
    if (userData.visibility === 'private') {
        document.getElementById('private').checked = true;
    } else {
        document.getElementById('public').checked = true;
    }
    
    // Load profile photo
    const loadProfilePhoto = (photoPath) => {
        const profilePic = document.getElementById('profilePicture');
        const headerPic = document.getElementById('headerProfilePhoto');
        
        if (photoPath.startsWith('data:') || photoPath.startsWith('http')) {
            // Handle data URLs or absolute paths
            profilePic.src = photoPath;
            headerPic.src = photoPath;
        } else {
            // Handle relative paths
            const fullPath = photoPath.startsWith('assets/') ? photoPath : `assets/${photoPath}`;
            profilePic.src = fullPath;
            headerPic.src = fullPath;
            userData.photo = fullPath;
        }
    };
    
    loadProfilePhoto(userData.photo || 'assets/default-avatar.jpg');
    
    // Handle photo upload
    document.getElementById('photoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                userData.photo = event.target.result;
                loadProfilePhoto(userData.photo);
                localStorage.setItem(userKey, JSON.stringify(userData));
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Load skills into text inputs
    document.getElementById('skillsInput').value = userData.skills?.join(', ') || '';
    document.getElementById('skillsWantedInput').value = userData.skillsWanted?.join(', ') || '';
    
    // Save profile
    document.getElementById('saveProfile').addEventListener('click', function() {
        userData.fullName = document.getElementById('fullName').value;
        userData.location = document.getElementById('location').value;
        userData.availability = document.getElementById('availability').value;
        userData.visibility = document.querySelector('input[name="visibility"]:checked').value;
        
        // Process skills from text inputs
        userData.skills = document.getElementById('skillsInput').value
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        userData.skillsWanted = document.getElementById('skillsWantedInput').value
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        localStorage.setItem(userKey, JSON.stringify(userData));
        alert('Profile saved successfully!');
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});