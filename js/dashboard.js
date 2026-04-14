// js/dashboard.js
// Dashboard JavaScript - Modern Layout

let currentUser = null;
let userProperties = [];
let uploadedImages = [];

document.addEventListener('DOMContentLoaded', function() {
    checkUserLogin();
    setupEventListeners();
    loadUserProperties();
    setupUserDropdown();
});

function checkUserLogin() {
    const userJSON = localStorage.getItem('inheriti_current_user');
    if (!userJSON) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userJSON);
    const allUsers = JSON.parse(localStorage.getItem('inheriti_users') || '[]');
    const userRecord = allUsers.find(u => u.email === currentUser.email);
    
    if (!userRecord || userRecord.status !== 'verified') {
        alert('Your account is pending verification.');
        window.location.href = 'login.html';
        return;
    }
    
    updateUserInfo(userRecord);
}

function updateUserInfo(userRecord) {
    const displayName = userRecord.firstName || userRecord.businessName || 'User';
    document.getElementById('welcomeName').textContent = displayName;
    
    document.querySelector('.dropdown-header strong').textContent = userRecord.businessName;
    document.querySelector('.dropdown-header span').textContent = userRecord.email;
    
    document.getElementById('profileBusinessName').textContent = userRecord.businessName;
    document.getElementById('profileEmail').textContent = userRecord.email;
    document.getElementById('profilePhone').textContent = userRecord.phone || 'Not provided';
    document.getElementById('profileAddress').textContent = `${userRecord.address || 'Not provided'}, ${userRecord.city || ''}`;
    document.getElementById('profileLicense').textContent = userRecord.licenseNumber || 'Not provided';
    document.getElementById('profileJoined').textContent = userRecord.registeredAt ? new Date(userRecord.registeredAt).toLocaleDateString() : 'Not available';
    
    const statusEl = document.getElementById('profileStatus');
    if (userRecord.status === 'verified') {
        statusEl.textContent = '✓ Verified Account';
        statusEl.className = 'status-badge status-verified';
    } else {
        statusEl.textContent = '⏳ Pending Verification';
        statusEl.className = 'status-badge status-pending';
    }
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // Quick action buttons
    document.getElementById('addPropertyQuickBtn')?.addEventListener('click', () => switchTab('add'));
    document.getElementById('viewAllPropertiesBtn')?.addEventListener('click', () => switchTab('listings'));
    document.getElementById('analyticsBtn')?.addEventListener('click', () => switchTab('analytics'));
    
    // Search
    const searchInput = document.querySelector('.nav-search input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProperties(this.value);
        });
    }
    
    // Filters
    document.getElementById('filterType')?.addEventListener('change', () => renderProperties());
    document.getElementById('sortBy')?.addEventListener('change', () => renderProperties());
    
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('profileLink')?.addEventListener('click', () => switchTab('profile'));
    
    // Form submission
    const propertyForm = document.getElementById('propertyForm');
    if (propertyForm) {
        propertyForm.addEventListener('submit', submitProperty);
    }
    
    // Image upload
    setupImageUpload();
    
    // Modal close
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.getElementById('propertyDetailModal')?.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function setupUserDropdown() {
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }
    
    document.addEventListener('click', function() {
        userDropdown?.classList.remove('show');
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Tab`);
    });
    
    if (tabId === 'listings') {
        renderProperties();
    }
    if (tabId === 'analytics') {
        updateAnalytics();
    }
}

function loadUserProperties() {
    const allProperties = JSON.parse(localStorage.getItem('inheriti_properties') || '[]');
    userProperties = allProperties.filter(p => p.userEmail === currentUser.email);
    renderProperties();
    updateStats();
    updateAnalytics();
}

function renderProperties() {
    let filtered = [...userProperties];
    
    // Apply type filter
    const filterType = document.getElementById('filterType')?.value;
    if (filterType && filterType !== 'all') {
        filtered = filtered.filter(p => p.listingType === filterType);
    }
    
    // Apply search filter
    const searchTerm = document.querySelector('.nav-search input')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sorting
    const sortBy = document.getElementById('sortBy')?.value;
    if (sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'price-high') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price-low') {
        filtered.sort((a, b) => a.price - b.price);
    }
    
    const container = document.getElementById('propertiesContainer');
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>No properties found</h3>
                <p>Click "Add New" to list your first property</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(property => `
        <div class="property-card">
            <div class="property-image" style="background-image: url('${property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x200?text=No+Image'}')">
                <span class="property-badge ${property.listingType === 'for-sale' ? 'badge-sale' : 'badge-rent'}">
                    ${property.listingType === 'for-sale' ? 'FOR SALE' : 'FOR RENT'}
                </span>
            </div>
            <div class="property-info">
                <h3 class="property-title">${property.name}</h3>
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${property.location}</p>
                <div class="property-details">
                    <span><i class="fas fa-arrows-alt"></i> ${property.squareMeters} m²</span>
                    ${property.bedrooms ? `<span><i class="fas fa-bed"></i> ${property.bedrooms}</span>` : ''}
                    ${property.bathrooms ? `<span><i class="fas fa-bath"></i> ${property.bathrooms}</span>` : ''}
                </div>
                <div class="property-price">${formatPrice(property.price)} ${property.listingType === 'for-rent' ? '/month' : ''}</div>
                <div class="property-actions">
                    <button class="btn-view" onclick="viewProperty('${property.id}')"><i class="fas fa-eye"></i> View</button>
                    <button class="btn-edit" onclick="editProperty('${property.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn-delete" onclick="deleteProperty('${property.id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProperties(searchTerm) {
    renderProperties();
}

function updateStats() {
    document.getElementById('totalPropertiesCount').textContent = userProperties.length;
    document.querySelector('.stat-bubble:first-child span').textContent = userProperties.length;
}

function updateAnalytics() {
    const total = userProperties.length;
    const forSale = userProperties.filter(p => p.listingType === 'for-sale').length;
    const forRent = userProperties.filter(p => p.listingType === 'for-rent').length;
    const avgPrice = total > 0 ? userProperties.reduce((sum, p) => sum + parseFloat(p.price), 0) / total : 0;
    
    document.getElementById('analyticsTotal').textContent = total;
    document.getElementById('analyticsSale').textContent = forSale;
    document.getElementById('analyticsRent').textContent = forRent;
    document.getElementById('analyticsAvgPrice').textContent = formatPrice(Math.round(avgPrice));
    
    const recentList = document.getElementById('recentListingsList');
    if (recentList) {
        const recent = [...userProperties].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        if (recent.length === 0) {
            recentList.innerHTML = '<div class="empty-state"><p>No properties yet</p></div>';
        } else {
            recentList.innerHTML = recent.map(p => `
                <div class="recent-item">
                    <span><strong>${p.name}</strong> - ${p.location}</span>
                    <span>${formatPrice(p.price)}</span>
                </div>
            `).join('');
        }
    }
}

function setupImageUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('propImages');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleImageUpload);
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#e8f4f3';
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.background = '#f8f9fa';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.background = '#f8f9fa';
            fileInput.files = e.dataTransfer.files;
            handleImageUpload({ target: { files: e.dataTransfer.files } });
        });
    }
}

function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImages.push(event.target.result);
                const preview = document.createElement('div');
                preview.className = 'image-preview-item';
                preview.innerHTML = `
                    <img src="${event.target.result}" alt="Preview">
                    <button class="remove-image-btn" onclick="removeImage(this, '${event.target.result}')">&times;</button>
                `;
                previewGrid.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(btn, imageSrc) {
    uploadedImages = uploadedImages.filter(img => img !== imageSrc);
    btn.parentElement.remove();
}

function submitProperty(e) {
    e.preventDefault();
    
    const propertyData = {
        id: generateId(),
        userEmail: currentUser.email,
        name: document.getElementById('propTitle').value,
        type: document.getElementById('propType').value,
        squareMeters: document.getElementById('propSqm').value,
        bedrooms: document.getElementById('propBedrooms').value || null,
        bathrooms: document.getElementById('propBathrooms').value || null,
        location: document.getElementById('propLocation').value,
        listingType: document.querySelector('input[name="listingType"]:checked')?.value,
        price: document.getElementById('propPrice').value,
        description: document.getElementById('propDescription').value,
        images: uploadedImages,
        createdAt: new Date().toISOString()
    };
    
    if (!propertyData.name || !propertyData.squareMeters || !propertyData.location || !propertyData.price || !propertyData.description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (!propertyData.listingType) {
        showToast('Please select listing type', 'error');
        return;
    }
    
    if (uploadedImages.length === 0) {
        showToast('Please upload at least one image', 'error');
        return;
    }
    
    const allProperties = JSON.parse(localStorage.getItem('inheriti_properties') || '[]');
    allProperties.push(propertyData);
    localStorage.setItem('inheriti_properties', JSON.stringify(allProperties));
    
    uploadedImages = [];
    document.getElementById('propertyForm').reset();
    document.getElementById('imagePreviewGrid').innerHTML = '';
    
    showToast('Property published successfully!', 'success');
    loadUserProperties();
    switchTab('listings');
}

function viewProperty(propertyId) {
    const property = userProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    const modal = document.getElementById('propertyDetailModal');
    const modalTitle = document.getElementById('modalPropertyTitle');
    const modalContent = document.getElementById('modalPropertyContent');
    
    modalTitle.textContent = property.name;
    modalContent.innerHTML = `
        ${property.images && property.images[0] ? `<img src="${property.images[0]}" style="width: 100%; border-radius: 12px; margin-bottom: 1rem;">` : ''}
        <p><i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${property.location}</p>
        <p><i class="fas fa-arrows-alt"></i> <strong>Size:</strong> ${property.squareMeters} m²</p>
        ${property.bedrooms ? `<p><i class="fas fa-bed"></i> <strong>Bedrooms:</strong> ${property.bedrooms}</p>` : ''}
        ${property.bathrooms ? `<p><i class="fas fa-bath"></i> <strong>Bathrooms:</strong> ${property.bathrooms}</p>` : ''}
        <p><i class="fas fa-tag"></i> <strong>Type:</strong> ${property.listingType === 'for-sale' ? 'For Sale' : 'For Rent'}</p>
        <p><i class="fas fa-euro-sign"></i> <strong>Price:</strong> ${formatPrice(property.price)} ${property.listingType === 'for-rent' ? '/month' : ''}</p>
        <p><i class="fas fa-calendar"></i> <strong>Listed:</strong> ${new Date(property.createdAt).toLocaleDateString()}</p>
        <h4 style="margin: 1rem 0 0.5rem;">Description</h4>
        <p>${property.description}</p>
    `;
    
    modal.classList.add('show');
}

function editProperty(propertyId) {
    const property = userProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    document.getElementById('propTitle').value = property.name;
    document.getElementById('propType').value = property.type;
    document.getElementById('propSqm').value = property.squareMeters;
    document.getElementById('propBedrooms').value = property.bedrooms || '';
    document.getElementById('propBathrooms').value = property.bathrooms || '';
    document.getElementById('propLocation').value = property.location;
    document.querySelector(`input[name="listingType"][value="${property.listingType}"]`).checked = true;
    document.getElementById('propPrice').value = property.price;
    document.getElementById('propDescription').value = property.description;
    
    uploadedImages = property.images || [];
    const previewGrid = document.getElementById('imagePreviewGrid');
    previewGrid.innerHTML = '';
    uploadedImages.forEach(img => {
        const preview = document.createElement('div');
        preview.className = 'image-preview-item';
        preview.innerHTML = `
            <img src="${img}" alt="Preview">
            <button class="remove-image-btn" onclick="removeImage(this, '${img}')">&times;</button>
        `;
        previewGrid.appendChild(preview);
    });
    
    const propertyToDelete = property;
    deleteProperty(propertyId);
    
    switchTab('add');
    showToast('Property loaded for editing. Make changes and publish again.', 'info');
}

function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    const allProperties = JSON.parse(localStorage.getItem('inheriti_properties') || '[]');
    const filtered = allProperties.filter(p => p.id !== propertyId);
    localStorage.setItem('inheriti_properties', JSON.stringify(filtered));
    
    loadUserProperties();
    showToast('Property deleted successfully', 'success');
}

function closeModal() {
    document.getElementById('propertyDetailModal')?.classList.remove('show');
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

function generateId() {
    return 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('inheriti_current_user');
        window.location.href = 'login.html';
    }
}