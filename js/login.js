// js/login.js
// Login functionality with localStorage authentication

document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    
    // Ensure there is at least one admin account for panel access
    ensureAdminAccount();

    // Check if user is already logged in
    checkExistingSession();
    
    // Password visibility toggle
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle icon
            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            setLoadingState(true);
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember')?.checked || false;
            
            // Simple validation
            if (!email || !password) {
                showLoginModal('Please enter both email and password', 'error');
                setLoadingState(false);
                return;
            }
            
            // Attempt login
            setTimeout(() => {
                const loginResult = authenticateUser(email, password, remember);
                
                if (loginResult.success) {
                    showLoginModal(loginResult.message, 'success', loginResult.user);
                } else {
                    showLoginModal(loginResult.message, 'error');
                    setLoadingState(false);
                }
            }, 1000); // Simulate network delay
        });
    }
    
    // Add "Enter" key support
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }
});

// ============================================
// FUNCTION: Seed default admin account once
// ============================================
function ensureAdminAccount() {
    const defaultAdminEmail = 'admin@inheriti.com';

    try {
        const usersJSON = localStorage.getItem('inheriti_users');
        let users = [];

        if (usersJSON) {
            users = JSON.parse(usersJSON);
            if (!Array.isArray(users)) users = [];
        }

        const adminExists = users.some(user =>
            (user.email && user.email.toLowerCase() === defaultAdminEmail) ||
            (user.businessEmail && user.businessEmail.toLowerCase() === defaultAdminEmail)
        );

        if (adminExists) return;

        users.push({
            userId: 'ADMIN_DEFAULT',
            firstName: 'System',
            lastName: 'Admin',
            email: defaultAdminEmail,
            businessEmail: defaultAdminEmail,
            password: 'Admin1234',
            phone: 'N/A',
            businessName: 'InHeriti Administration',
            businessType: 'platform_admin',
            role: 'admin',
            status: 'verified',
            registeredAt: new Date().toISOString(),
            registrationDate: new Date().toLocaleDateString(),
            registrationTime: new Date().toLocaleTimeString(),
            newsletter: false,
            propertyAlerts: false
        });

        localStorage.setItem('inheriti_users', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Unable to seed admin account:', error);
    }
}

// ============================================
// FUNCTION: Check if user is already logged in
// ============================================
function checkExistingSession() {
    const currentUser = localStorage.getItem('inheriti_current_user');
    const rememberMe = localStorage.getItem('inheriti_remember') === 'true';
    
    if (currentUser && rememberMe) {
        // Auto-fill email if remembered
        const emailInput = document.getElementById('email');
        const rememberCheck = document.getElementById('remember');
        
        if (emailInput) {
            const user = JSON.parse(currentUser);
            emailInput.value = user.email || '';
        }
        
        if (rememberCheck) {
            rememberCheck.checked = true;
        }
        
        // Optional: Show welcome back message
        showToast('Welcome back! Please enter your password.', 'info');
    }
}

// ============================================
// FUNCTION: Authenticate user against localStorage
// ============================================
function authenticateUser(email, password, remember = false) {
    try {
        // Get users from localStorage
        const usersJSON = localStorage.getItem('inheriti_users');
        
        if (!usersJSON) {
            return {
                success: false,
                message: 'No registered users found. Please register first.'
            };
        }
        
        const users = JSON.parse(usersJSON);
        
        // Find user by email
        const user = users.find(u => 
            u.email.toLowerCase() === email.toLowerCase() || 
            (u.businessEmail && u.businessEmail.toLowerCase() === email.toLowerCase())
        );
        
        if (!user) {
            return {
                success: false,
                message: 'Email not found. Please check your email or register.'
            };
        }
        
        const passwordInput = password;
        const isAdminAccount =
            user.role === 'admin' ||
            (user.email && user.email.toLowerCase() === 'admin@inheriti.com') ||
            (user.businessEmail && user.businessEmail.toLowerCase() === 'admin@inheriti.com');

        // Hardcoded admin credentials
        if (isAdminAccount) {
            if (email.toLowerCase() !== 'admin@inheriti.com' || passwordInput !== 'Admin1234') {
                return {
                    success: false,
                    message: 'Invalid admin credentials.'
                };
            }
        } else if (passwordInput.length < 8 || !/\d/.test(passwordInput)) {
            // Keep existing demo validation for non-admin users
            return {
                success: false,
                message: 'Invalid password. Password must be at least 8 characters with 1 number.'
            };
        }
        
        // Check if account is verified
        if (user.status === 'pending_verification') {
            return {
                success: false,
                message: 'Your account is pending verification. You will be able to login once verified.'
            };
        }
        
        // Store current user session
        const userSession = {
            email: user.email,
            businessName: user.businessName,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role || 'user',
            status: user.status || 'pending_verification',
            loginTime: new Date().toISOString(),
            remember: remember
        };
        
        localStorage.setItem('inheriti_current_user', JSON.stringify(userSession));
        
        if (remember) {
            localStorage.setItem('inheriti_remember', 'true');
            localStorage.setItem('inheriti_remembered_email', user.email);
        } else {
            localStorage.removeItem('inheriti_remember');
            localStorage.removeItem('inheriti_remembered_email');
        }
        
        return {
            success: true,
            message: (userSession.role === 'admin')
                ? 'Login successful! Redirecting to admin panel...'
                : 'Login successful! Redirecting to dashboard...',
            user: userSession
        };
        
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'An error occurred during login. Please try again.'
        };
    }
}

// ============================================
// FUNCTION: Show login modal
// ============================================
function showLoginModal(message, type = 'success', userData = null) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        text-align: center;
    `;

    // Add icon based on type
    const icon = document.createElement('div');
    icon.style.cssText = `
        font-size: 60px;
        margin-bottom: 20px;
    `;
    
    if (type === 'success') {
        icon.innerHTML = '✅';
        icon.style.animation = 'bounce 0.5s ease';
    } else if (type === 'error') {
        icon.innerHTML = '❌';
    } else {
        icon.innerHTML = 'ℹ️';
    }

    // Add title
    const title = document.createElement('h3');
    title.style.cssText = `
        color: ${type === 'success' ? '#0f5f5c' : type === 'error' ? '#dc3545' : '#17a2b8'};
        font-size: 24px;
        margin-bottom: 15px;
    `;
    title.textContent = type === 'success' ? 'Welcome!' : type === 'error' ? 'Login Failed' : 'Notice';

    // Add message
    const messageEl = document.createElement('p');
    messageEl.style.cssText = `
        color: #666;
        font-size: 16px;
        margin-bottom: 25px;
        line-height: 1.6;
    `;
    messageEl.textContent = message;

    // Add user info if success
    let userInfo = null;
    if (type === 'success' && userData) {
        userInfo = document.createElement('div');
        userInfo.style.cssText = `
            background: #e8f4f3;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 25px;
            text-align: left;
        `;
        userInfo.innerHTML = `
            <p style="margin: 5px 0; color: #0f5f5c;"><strong>👤 ${userData.businessName}</strong></p>
            <p style="margin: 5px 0; color: #666;">Welcome back, ${userData.firstName}!</p>
            <p style="margin: 5px 0; color: #666; font-size: 13px;">Login time: ${new Date().toLocaleTimeString()}</p>
        `;
    }

    // Add button
    const button = document.createElement('button');
    button.style.cssText = `
        background: ${type === 'success' ? '#0f5f5c' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
    `;
    button.textContent = type === 'success'
        ? (userData?.role === 'admin' ? 'Go to Admin Panel' : 'Go to Dashboard')
        : 'Try Again';

    // Add animations
    addModalAnimations();

    // Close function
    const closeModal = () => {
        modalOverlay.style.animation = 'fadeOut 0.3s ease';
        modalContent.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
            if (type === 'success') {
                const targetPage = userData?.role === 'admin' ? 'admin.html' : 'dashboard.html';
                window.location.href = targetPage;
            }
        }, 300);
    };

    button.addEventListener('click', closeModal);
    
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Assemble modal
    modalContent.appendChild(icon);
    modalContent.appendChild(title);
    modalContent.appendChild(messageEl);
    if (userInfo) modalContent.appendChild(userInfo);
    modalContent.appendChild(button);
    modalOverlay.appendChild(modalContent);
    
    document.body.appendChild(modalOverlay);
}

// ============================================
// FUNCTION: Show toast notification
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? '#0f5f5c' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ============================================
// FUNCTION: Set loading state
// ============================================
function setLoadingState(isLoading) {
    const loginButton = document.getElementById('loginButton');
    if (!loginButton) return;
    
    if (isLoading) {
        loginButton.innerHTML = '<span>Logging in...</span> <i class="fas fa-spinner fa-spin"></i>';
        loginButton.disabled = true;
    } else {
        loginButton.innerHTML = '<span>Sign In</span> <i class="fas fa-arrow-right"></i>';
        loginButton.disabled = false;
    }
}

// ============================================
// FUNCTION: Add CSS animations
// ============================================
function addModalAnimations() {
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateY(-30px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(30px);
                    opacity: 0;
                }
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-20px); }
                60% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ============================================
// FUNCTION: Logout (can be called from any page)
// ============================================
window.logout = function() {
    localStorage.removeItem('inheriti_current_user');
    localStorage.removeItem('inheriti_remember');
    window.location.href = 'login.html';
};