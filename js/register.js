// js/register.js
// Complete registration with localStorage storage and redirect to login

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the registration form
    const registerForm = document.getElementById('registerForm');
    
    // If form exists on this page, run the code
    if (registerForm) {
        
        // Add password visibility toggle
        addPasswordToggle();
        
        // Handle form submission
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Step 1: Get all form values
            const formData = collectFormData();
            
            // Step 2: Validate the data
            const validationError = validateFormData(formData);
            
            if (validationError) {
                showErrorModal(validationError);
                return;
            }
            
            // Step 3: Save to localStorage
            const saveResult = saveToLocalStorage(formData);
            
            if (saveResult.success) {
                // Step 4: Show success modal with redirect option
                showSuccessModal(formData);
                
                // Step 5: Clear the form
                registerForm.reset();
                
            } else {
                showErrorModal('❌ Error saving data. Please try again.');
            }
        });
        
        // Add a "View Saved Data" button for testing
        addViewDataButton();
    }
});

// ============================================
// FUNCTION: Show Success Modal with Redirect
// ============================================
function showSuccessModal(userData) {
    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
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
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        text-align: center;
    `;

    // Add success icon
    const successIcon = document.createElement('div');
    successIcon.innerHTML = '✅';
    successIcon.style.cssText = `
        font-size: 80px;
        margin-bottom: 20px;
        animation: bounce 0.5s ease;
    `;

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Registration Successful!';
    title.style.cssText = `
        color: #0f5f5c;
        font-size: 28px;
        margin-bottom: 15px;
        font-weight: 600;
    `;

    // Add personalized message
    const message = document.createElement('div');
    message.style.cssText = `
        margin-bottom: 25px;
        color: #333;
    `;
    
    message.innerHTML = `
        <p style="font-size: 18px; margin-bottom: 10px;">Thank you for registering <strong>${userData.businessName}</strong>!</p>
        <p style="font-size: 16px; color: #666; margin-bottom: 20px;">Your account has been created successfully.</p>
        <div style="background: #e8f4f3; padding: 15px; border-radius: 10px; text-align: left; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${userData.businessEmail || userData.email}</p>
            <p style="margin: 5px 0;"><strong>📞 Phone:</strong> ${userData.phone}</p>
            <p style="margin: 5px 0;"><strong>🔔 Status:</strong> <span style="color: #f39c12;">Pending Verification</span></p>
        </div>
        <p style="font-size: 15px; color: #666;">Please login to access your dashboard.</p>
    `;

    // Create button container for two buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex;
        gap: 15px;
        margin-top: 20px;
    `;

    // Login button (primary)
    const loginButton = document.createElement('button');
    loginButton.textContent = 'Login Now';
    loginButton.style.cssText = `
        background: #0f5f5c;
        color: white;
        border: none;
        padding: 12px 25px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
        box-shadow: 0 4px 15px rgba(15, 95, 92, 0.3);
    `;

    // Stay here button (secondary)
    const stayButton = document.createElement('button');
    stayButton.textContent = 'Stay Here';
    stayButton.style.cssText = `
        background: #f0f0f0;
        color: #666;
        border: none;
        padding: 12px 25px;
        font-size: 16px;
        font-weight: 500;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        flex: 1;
    `;

    // Add hover effects
    loginButton.addEventListener('mouseenter', () => {
        loginButton.style.background = '#1a7a76';
        loginButton.style.transform = 'translateY(-2px)';
    });

    loginButton.addEventListener('mouseleave', () => {
        loginButton.style.background = '#0f5f5c';
        loginButton.style.transform = 'translateY(0)';
    });

    stayButton.addEventListener('mouseenter', () => {
        stayButton.style.background = '#e0e0e0';
    });

    stayButton.addEventListener('mouseleave', () => {
        stayButton.style.background = '#f0f0f0';
    });

    // Close modal function
    const closeModal = () => {
        modalOverlay.style.animation = 'fadeOut 0.3s ease';
        modalContent.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    };

    // Login button redirect
    loginButton.addEventListener('click', () => {
        closeModal();
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Stay button just closes modal
    stayButton.addEventListener('click', closeModal);

    // Close when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Assemble modal
    buttonContainer.appendChild(loginButton);
    buttonContainer.appendChild(stayButton);
    modalContent.appendChild(successIcon);
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContent);
    
    // Add to page
    document.body.appendChild(modalOverlay);

    // Add keyframe animations
    addModalAnimations();
    
    // Auto-redirect after 5 seconds (optional)
    setTimeout(() => {
        if (document.body.contains(modalOverlay)) {
            closeModal();
            window.location.href = 'login.html';
        }
    }, 5000);
}

// ============================================
// FUNCTION: Show Error Modal
// ============================================
function showErrorModal(errorMessage) {
    // Create modal container
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
        max-width: 450px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        text-align: center;
    `;

    // Add error icon
    const errorIcon = document.createElement('div');
    errorIcon.innerHTML = '❌';
    errorIcon.style.cssText = `
        font-size: 60px;
        margin-bottom: 20px;
    `;

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Validation Error';
    title.style.cssText = `
        color: #dc3545;
        font-size: 24px;
        margin-bottom: 15px;
    `;

    // Add error message
    const message = document.createElement('p');
    message.textContent = errorMessage;
    message.style.cssText = `
        color: #666;
        font-size: 16px;
        margin-bottom: 25px;
        line-height: 1.6;
    `;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Try Again';
    closeButton.style.cssText = `
        background: #0f5f5c;
        color: white;
        border: none;
        padding: 12px 30px;
        font-size: 15px;
        font-weight: 600;
        border-radius: 50px;
        cursor: pointer;
        transition: all 0.3s ease;
        width: 100%;
    `;

    closeButton.addEventListener('mouseenter', () => {
        closeButton.style.background = '#1a7a76';
    });

    closeButton.addEventListener('mouseleave', () => {
        closeButton.style.background = '#0f5f5c';
    });

    // Close modal function
    const closeModal = () => {
        modalOverlay.style.animation = 'fadeOut 0.3s ease';
        modalContent.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(modalOverlay);
        }, 300);
    };

    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Assemble modal
    modalContent.appendChild(errorIcon);
    modalContent.appendChild(title);
    modalContent.appendChild(message);
    modalContent.appendChild(closeButton);
    modalOverlay.appendChild(modalContent);
    
    // Add to page
    document.body.appendChild(modalOverlay);
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
// FUNCTION: Collect all form data
// ============================================
function collectFormData() {
    return {
        firstName: getValue('firstName'),
        lastName: getValue('lastName'),
        email: getValue('email'),
        password: getValue('password'),
        businessName: getValue('businessName'),
        businessType: getValue('businessType'),
        licenseNumber: getValue('licenseNumber'),
        yearsInBusiness: getValue('yearsInBusiness'),
        employeeCount: getValue('employeeCount'),
        phone: getValue('phone'),
        businessEmail: getValue('businessEmail'),
        website: getValue('website'),
        address: getValue('address'),
        city: getValue('city'),
        state: getValue('state'),
        zipCode: getValue('zipCode'),
        newsletter: getChecked('newsletter'),
        propertyAlerts: getChecked('propertyAlerts'),
        terms: getChecked('terms'),
        registeredAt: new Date().toISOString(),
        registrationDate: new Date().toLocaleDateString(),
        registrationTime: new Date().toLocaleTimeString(),
        role: 'user',
        status: 'pending_verification',
        userId: generateUserId()
    };
}

function getValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : '';
}

function getChecked(name) {
    const element = document.querySelector(`input[name="${name}"]`);
    return element ? element.checked : false;
}

function generateUserId() {
    return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// FUNCTION: Validate form data
// ============================================
function validateFormData(data) {
    if (!data.firstName) return 'First name is required';
    if (!data.lastName) return 'Last name is required';
    if (!data.email) return 'Email address is required';
    if (!data.businessEmail) return 'Business email is required';
    if (!data.password) return 'Password is required';
    if (!data.businessName) return 'Business name is required';
    if (!data.businessType) return 'Business type is required';
    if (!data.licenseNumber) return 'License number is required';
    if (!data.phone) return 'Phone number is required';
    if (!data.address) return 'Address is required';
    if (!data.city) return 'City is required';
    if (!data.state) return 'State is required';
    if (!data.zipCode) return 'ZIP code is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) return 'Please enter a valid email address';
    if (!emailRegex.test(data.businessEmail)) return 'Please enter a valid business email address';
    
    if (data.password.length < 6) return 'Password must be at least 6 characters long';
    
    const confirmPassword = getValue('confirmPassword');
    if (!confirmPassword) {
        return 'Please confirm your password';
    }
    if (data.password !== confirmPassword) {
        return 'Passwords do not match';
    }
    
    if (!data.terms) return 'You must agree to the Terms of Service';
    
    return null;
}

// ============================================
// FUNCTION: Save to localStorage
// ============================================
function saveToLocalStorage(newUserData) {
    try {
        // Remove password before storing
        const userDataToStore = { ...newUserData };
        delete userDataToStore.password;
        
        let users = [];
        const existingUsersJSON = localStorage.getItem('inheriti_users');
        
        if (existingUsersJSON) {
            users = JSON.parse(existingUsersJSON);
            if (!Array.isArray(users)) {
                users = [];
            }
        }
        
        users.push(userDataToStore);
        localStorage.setItem('inheriti_users', JSON.stringify(users, null, 2));
        
        // Store last registration info
        localStorage.setItem('inheriti_last_registration', JSON.stringify({
            email: userDataToStore.email,
            businessName: userDataToStore.businessName,
            timestamp: new Date().toISOString()
        }));
        
        return { success: true };
        
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return { success: false };
    }
}

// ============================================
// FUNCTION: Add password visibility toggle
// ============================================
function addPasswordToggle() {
    const passwordField = document.getElementById('password');
    const confirmField = document.getElementById('confirmPassword');
    
    if (passwordField) {
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.innerHTML = '👁️ Show';
        toggleBtn.style.marginLeft = '10px';
        toggleBtn.style.padding = '5px 10px';
        toggleBtn.style.fontSize = '12px';
        toggleBtn.style.cursor = 'pointer';
        
        passwordField.parentNode.insertBefore(toggleBtn, passwordField.nextSibling);
        
        toggleBtn.addEventListener('click', function() {
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                if (confirmField) confirmField.type = 'text';
                toggleBtn.innerHTML = '👁️ Hide';
            } else {
                passwordField.type = 'password';
                if (confirmField) confirmField.type = 'password';
                toggleBtn.innerHTML = '👁️ Show';
            }
        });
    }
}

// ============================================
// FUNCTION: Add "View Saved Data" button
// ============================================
function addViewDataButton() {
    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.innerHTML = '📋 View Saved Registrations';
    viewBtn.style.marginTop = '20px';
    viewBtn.style.padding = '12px 20px';
    viewBtn.style.backgroundColor = '#6c757d';
    viewBtn.style.color = 'white';
    viewBtn.style.border = 'none';
    viewBtn.style.borderRadius = '5px';
    viewBtn.style.cursor = 'pointer';
    viewBtn.style.width = '100%';
    viewBtn.style.fontSize = '16px';
    
    viewBtn.addEventListener('click', function() {
        displaySavedUsers();
    });
    
    const form = document.getElementById('registerForm');
    if (form) {
        form.parentNode.insertBefore(viewBtn, form.nextSibling);
    }
}

// ============================================
// FUNCTION: Display saved users
// ============================================
function displaySavedUsers() {
    try {
        const users = JSON.parse(localStorage.getItem('inheriti_users') || '[]');
        
        if (users.length === 0) {
            alert('No registered businesses yet.');
            return;
        }
        
        let message = `📊 TOTAL REGISTERED BUSINESSES: ${users.length}\n\n`;
        
        users.forEach((user, index) => {
            message += `${index + 1}. ${user.businessName || 'Unknown'}\n`;
            message += `   Contact: ${user.firstName} ${user.lastName}\n`;
            message += `   Email: ${user.businessEmail || user.email}\n`;
            message += `   Phone: ${user.phone}\n`;
            message += `   Status: ${user.status}\n\n`;
        });
        
        alert(message);
        
    } catch (error) {
        alert('Error reading data');
    }
}