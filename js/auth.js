document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            
            
            const userKey = `user_${username}`;
            const userData = localStorage.getItem(userKey);
            
            if (userData) {
                const user = JSON.parse(userData);
                
                if (user.password === password) {
                    localStorage.setItem('currentUser', username);
                    window.location.href = 'profile.html';
                } else {
                    alert('Incorrect password');
                }
            } else {
                alert('User not found');
            }
        });
    }
    
    // Signup form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            
            document.querySelectorAll('.error-message').forEach(el => {
                el.textContent = '';
            });
            
            // Get form values
            const username = document.getElementById('newUsername').value.trim();
            const password = document.getElementById('newPassword').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            
            // Validate inputs
            let isValid = true;
            
            if (username.length < 4) {
                document.getElementById('usernameError').textContent = 'Username must be at least 4 characters';
                isValid = false;
            }
            
            if (password.length < 6) {
                document.getElementById('passwordError').textContent = 'Password must be at least 6 characters';
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                document.getElementById('confirmError').textContent = 'Passwords do not match';
                isValid = false;
            }
            
            if (!isValid) return;
            
            
            const userKey = `user_${username}`;
            if (localStorage.getItem(userKey)) {
                document.getElementById('usernameError').textContent = 'Username already taken';
                return;
            }
            
            // Create new user
            const newUser = {
                username: username,
                password: password, 
                fullName: '',
                location: '',
                availability: 'flexible',
                visibility: 'public',
                skills: [],
                skillsWanted: [],
                photo: 'assets/default-avatar.jpg',
                joinedDate: new Date().toISOString()
            };
            
            
            localStorage.setItem(userKey, JSON.stringify(newUser));
            
            
            localStorage.setItem('currentUser', username);
            alert('Account created successfully! Please complete your profile.');
            window.location.href = 'profile.html';
        });
    }
});