// js/admin.js
// Admin Panel JavaScript

let allUsers = [];
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 10;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    if (!guardAdminAccess()) {
        return;
    }

    loadUsers();
    setupEventListeners();
});

// ============================================
// Restrict admin page to admin sessions
// ============================================
function guardAdminAccess() {
    const currentUserJSON = localStorage.getItem('inheriti_current_user');

    if (!currentUserJSON) {
        window.location.href = 'login.html';
        return false;
    }

    try {
        const currentUser = JSON.parse(currentUserJSON);
        if (currentUser.role !== 'admin') {
            showToast('Access denied: admin account required', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
            return false;
        }
    } catch (error) {
        localStorage.removeItem('inheriti_current_user');
        window.location.href = 'login.html';
        return false;
    }

    return true;
}

// ============================================
// Setup Event Listeners
// ============================================
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadUsers);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    // Clear all button
    const clearAllBtn = document.getElementById('clearAllBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllData);
    }
    
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1;
            renderUsersTable();
        });
    }
    
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            renderUsersTable();
        });
    });
    
    // Pagination buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderUsersTable();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = getTotalPages();
            if (currentPage < totalPages) {
                currentPage++;
                renderUsersTable();
            }
        });
    }
    
    // Modal close
    const modal = document.getElementById('userModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// ============================================
// Load Users from localStorage
// ============================================
function loadUsers() {
    try {
        const usersJSON = localStorage.getItem('inheriti_users');
        
        if (!usersJSON) {
            allUsers = [];
            showToast('No users found', 'info');
        } else {
            allUsers = JSON.parse(usersJSON);
            showToast(`Loaded ${allUsers.length} users`, 'success');
        }
        
        updateStats();
        renderUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error loading users', 'error');
    }
}

// ============================================
// Update Statistics
// ============================================
function updateStats() {
    const totalUsers = allUsers.length;
    const pendingUsers = allUsers.filter(u => u.status === 'pending_verification').length;
    const verifiedUsers = allUsers.filter(u => u.status === 'verified').length;
    
    // Calculate new this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = allUsers.filter(u => {
        const regDate = new Date(u.registeredAt);
        return regDate >= oneWeekAgo;
    }).length;
    
    // Update DOM
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('pendingUsers').textContent = pendingUsers;
    document.getElementById('verifiedUsers').textContent = verifiedUsers;
    document.getElementById('newThisWeek').textContent = newThisWeek;
}

// ============================================
// Render Users Table with Filter and Search
// ============================================
function renderUsersTable() {
    // Filter users
    let filteredUsers = [...allUsers];
    
    // Apply status filter
    if (currentFilter === 'pending') {
        filteredUsers = filteredUsers.filter(u => u.status === 'pending_verification');
    } else if (currentFilter === 'verified') {
        filteredUsers = filteredUsers.filter(u => u.status === 'verified');
    }
    
    // Apply search
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(u => 
            (u.businessName && u.businessName.toLowerCase().includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.businessEmail && u.businessEmail.toLowerCase().includes(searchTerm)) ||
            (u.phone && u.phone.includes(searchTerm)) ||
            (u.firstName && u.firstName.toLowerCase().includes(searchTerm)) ||
            (u.lastName && u.lastName.toLowerCase().includes(searchTerm))
        );
    }
    
    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Update pagination UI
    updatePagination(totalPages);
    
    // Render table
    const tbody = document.getElementById('usersTableBody');
    
    if (paginatedUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox"></i> No users found
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = paginatedUsers.map((user, index) => `
        <tr>
            <td>${startIndex + index + 1}</td>
            <td><strong>${user.businessName || 'N/A'}</strong></td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.businessEmail || user.email}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${user.businessType || 'N/A'}</td>
            <td>${user.registrationDate || new Date(user.registeredAt).toLocaleDateString()}</td>
            <td>
                <span class="status-badge status-${user.status === 'verified' ? 'verified' : 'pending'}">
                    ${user.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                </span>
            </td>
            <td class="action-buttons-cell">
                <button class="btn-view" onclick="viewUserDetails('${user.userId}')">
                    <i class="fas fa-eye"></i>
                </button>
                ${user.status !== 'verified' ? `
                    <button class="btn-verify" onclick="verifyUser('${user.userId}')">
                        <i class="fas fa-check"></i>
                    </button>
                ` : ''}
                <button class="btn-delete" onclick="deleteUser('${user.userId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ============================================
// Update Pagination UI
// ============================================
function updatePagination(totalPages) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    }
}

// ============================================
// Get Total Pages
// ============================================
function getTotalPages() {
    let filteredUsers = [...allUsers];
    
    if (currentFilter === 'pending') {
        filteredUsers = filteredUsers.filter(u => u.status === 'pending_verification');
    } else if (currentFilter === 'verified') {
        filteredUsers = filteredUsers.filter(u => u.status === 'verified');
    }
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filteredUsers = filteredUsers.filter(u => 
            (u.businessName && u.businessName.toLowerCase().includes(searchTerm)) ||
            (u.email && u.email.toLowerCase().includes(searchTerm)) ||
            (u.phone && u.phone.includes(searchTerm))
        );
    }
    
    return Math.ceil(filteredUsers.length / itemsPerPage);
}

// ============================================
// View User Details Modal
// ============================================
window.viewUserDetails = function(userId) {
    const user = allUsers.find(u => u.userId === userId);
    
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="user-detail-item">
            <div class="user-detail-label">Business Name:</div>
            <div class="user-detail-value"><strong>${user.businessName || 'N/A'}</strong></div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Contact Person:</div>
            <div class="user-detail-value">${user.firstName} ${user.lastName}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Email:</div>
            <div class="user-detail-value">${user.businessEmail || user.email}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Phone:</div>
            <div class="user-detail-value">${user.phone || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Business Type:</div>
            <div class="user-detail-value">${user.businessType || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">License Number:</div>
            <div class="user-detail-value">${user.licenseNumber || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Years in Business:</div>
            <div class="user-detail-value">${user.yearsInBusiness || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Employees:</div>
            <div class="user-detail-value">${user.employeeCount || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Address:</div>
            <div class="user-detail-value">${user.address || 'N/A'}, ${user.city || 'N/A'}, ${user.state || 'N/A'} ${user.zipCode || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Website:</div>
            <div class="user-detail-value">${user.website || 'N/A'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Registered:</div>
            <div class="user-detail-value">${user.registrationDate || new Date(user.registeredAt).toLocaleDateString()} at ${user.registrationTime || new Date(user.registeredAt).toLocaleTimeString()}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Status:</div>
            <div class="user-detail-value">
                <span class="status-badge status-${user.status === 'verified' ? 'verified' : 'pending'}">
                    ${user.status === 'verified' ? '✓ Verified' : '⏳ Pending Verification'}
                </span>
            </div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Newsletter:</div>
            <div class="user-detail-value">${user.newsletter ? '✅ Subscribed' : '❌ Not subscribed'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">Property Alerts:</div>
            <div class="user-detail-value">${user.propertyAlerts ? '✅ Enabled' : '❌ Disabled'}</div>
        </div>
        <div class="user-detail-item">
            <div class="user-detail-label">User ID:</div>
            <div class="user-detail-value"><code>${user.userId}</code></div>
        </div>
    `;
    
    const modal = document.getElementById('userModal');
    modal.classList.add('show');
};

// ============================================
// Verify User
// ============================================
window.verifyUser = function(userId) {
    if (!confirm('Are you sure you want to verify this user?')) {
        return;
    }
    
    const userIndex = allUsers.findIndex(u => u.userId === userId);
    
    if (userIndex !== -1) {
        allUsers[userIndex].status = 'verified';
        saveUsersToStorage();
        renderUsersTable();
        updateStats();
        showToast('User verified successfully!', 'success');
    }
};

// ============================================
// Delete User
// ============================================
window.deleteUser = function(userId) {
    if (!confirm('⚠️ Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    const user = allUsers.find(u => u.userId === userId);
    allUsers = allUsers.filter(u => u.userId !== userId);
    saveUsersToStorage();
    renderUsersTable();
    updateStats();
    showToast(`${user.businessName} has been deleted`, 'success');
};

// ============================================
// Save Users to localStorage
// ============================================
function saveUsersToStorage() {
    localStorage.setItem('inheriti_users', JSON.stringify(allUsers, null, 2));
}

// ============================================
// Export Data as JSON
// ============================================
function exportData() {
    if (allUsers.length === 0) {
        showToast('No data to export', 'error');
        return;
    }
    
    // Remove sensitive data for export
    const exportData = allUsers.map(({ password, ...rest }) => rest);
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `inheriti_users_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showToast(`Exported ${allUsers.length} users`, 'success');
}

// ============================================
// Clear All Data
// ============================================
function clearAllData() {
    if (!confirm('⚠️ WARNING: This will delete ALL registered users. Are you absolutely sure?')) {
        return;
    }
    
    if (!confirm('LAST CHANCE: This action is permanent. Type "DELETE" to confirm')) {
        return;
    }
    
    const confirmation = prompt('Type "DELETE" to confirm deletion of all users:');
    
    if (confirmation === 'DELETE') {
        allUsers = [];
        localStorage.removeItem('inheriti_users');
        localStorage.removeItem('inheriti_current_user');
        localStorage.removeItem('inheriti_remember');
        localStorage.removeItem('inheriti_last_registration');
        renderUsersTable();
        updateStats();
        showToast('All data has been cleared', 'success');
    } else {
        showToast('Deletion cancelled', 'info');
    }
}

// ============================================
// Logout
// ============================================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('inheriti_current_user');
        window.location.href = 'login.html';
    }
}

// ============================================
// Show Toast Notification
// ============================================
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ============================================
// Keyboard Shortcuts
// ============================================
document.addEventListener('keydown', function(e) {
    // Ctrl + R to refresh
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        loadUsers();
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('userModal');
        if (modal.classList.contains('show')) {
            modal.classList.remove('show');
        }
    }
});