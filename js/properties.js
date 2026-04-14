// js/properties.js
// Properties page - Display all properties from all businesses

let allProperties = [];
let filteredProperties = [];
let currentPage = 1;
const itemsPerPage = 9;

document.addEventListener('DOMContentLoaded', function() {
    loadProperties();
    setupEventListeners();
});

function loadProperties() {
    const storedProperties = localStorage.getItem('inheriti_properties');
    if (storedProperties) {
        allProperties = JSON.parse(storedProperties);
    } else {
        allProperties = [];
    }
    
    // Sort by newest first
    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    applyFilters();
}

function setupEventListeners() {
    // Apply filters button
    const applyBtn = document.getElementById('applyFiltersBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyFilters);
    }
    
    // Reset filters button
    const resetBtn = document.getElementById('resetFiltersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Sort change
    const sortSelect = document.getElementById('sortProperties');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            applyFilters();
        });
    }
    
    // Pagination buttons
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProperties();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderProperties();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    // Close modals with close button
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllModals();
        });
    });
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        const propertyModal = document.getElementById('propertyModal');
        const contactModal = document.getElementById('contactModal');
        if (e.target === propertyModal) closeAllModals();
        if (e.target === contactModal) closeAllModals();
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeAllModals() {
    const propertyModal = document.getElementById('propertyModal');
    const contactModal = document.getElementById('contactModal');
    
    if (propertyModal) propertyModal.classList.remove('show');
    if (contactModal) contactModal.classList.remove('show');
    
    // Re-enable body scroll
    document.body.style.overflow = '';
}

function applyFilters() {
    let results = [...allProperties];
    
    // Filter by listing type
    const forSale = document.getElementById('filterForSale')?.checked;
    const forRent = document.getElementById('filterForRent')?.checked;
    
    if (forSale && !forRent) {
        results = results.filter(p => p.listingType === 'for-sale');
    } else if (!forSale && forRent) {
        results = results.filter(p => p.listingType === 'for-rent');
    }
    
    // Filter by property type
    const typeFilters = {
        Apartment: document.getElementById('filterApartment')?.checked,
        Villa: document.getElementById('filterVilla')?.checked,
        House: document.getElementById('filterHouse')?.checked,
        Commercial: document.getElementById('filterCommercial')?.checked,
        Land: document.getElementById('filterLand')?.checked
    };
    
    const activeTypes = Object.keys(typeFilters).filter(key => typeFilters[key]);
    if (activeTypes.length > 0) {
        results = results.filter(p => activeTypes.includes(p.type));
    }
    
    // Filter by price range
    const minPrice = document.getElementById('minPrice')?.value;
    const maxPrice = document.getElementById('maxPrice')?.value;
    
    if (minPrice) {
        results = results.filter(p => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
        results = results.filter(p => p.price <= parseFloat(maxPrice));
    }
    
    // Filter by size
    const minSize = document.getElementById('minSize')?.value;
    const maxSize = document.getElementById('maxSize')?.value;
    
    if (minSize) {
        results = results.filter(p => p.squareMeters >= parseFloat(minSize));
    }
    if (maxSize) {
        results = results.filter(p => p.squareMeters <= parseFloat(maxSize));
    }
    
    // Filter by bedrooms
    const bedrooms = document.getElementById('bedroomsFilter')?.value;
    if (bedrooms) {
        results = results.filter(p => p.bedrooms && p.bedrooms >= parseInt(bedrooms));
    }
    
    // Apply sorting
    const sortBy = document.getElementById('sortProperties')?.value;
    if (sortBy === 'price-low') {
        results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
        results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'size-small') {
        results.sort((a, b) => a.squareMeters - b.squareMeters);
    } else if (sortBy === 'size-large') {
        results.sort((a, b) => b.squareMeters - a.squareMeters);
    } else {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    filteredProperties = results;
    currentPage = 1;
    
    // Update property count
    const countSpan = document.getElementById('propertyCount');
    if (countSpan) {
        countSpan.textContent = filteredProperties.length;
    }
    
    renderProperties();
}

function resetFilters() {
    // Reset all checkboxes
    document.querySelectorAll('.checkbox-filter input').forEach(cb => cb.checked = false);
    
    // Reset price and size inputs
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const minSize = document.getElementById('minSize');
    const maxSize = document.getElementById('maxSize');
    const bedrooms = document.getElementById('bedroomsFilter');
    
    if (minPrice) minPrice.value = '';
    if (maxPrice) maxPrice.value = '';
    if (minSize) minSize.value = '';
    if (maxSize) maxSize.value = '';
    if (bedrooms) bedrooms.value = '';
    
    // Reset sort to default
    const sortSelect = document.getElementById('sortProperties');
    if (sortSelect) sortSelect.value = 'newest';
    
    applyFilters();
}

function renderProperties() {
    const grid = document.getElementById('propertiesGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const propertiesToShow = filteredProperties.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    
    // Update pagination
    updatePagination(totalPages);
    
    if (filteredProperties.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-home"></i>
                <h3>No properties found</h3>
                <p>Try adjusting your filters or check back later</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = propertiesToShow.map(property => `
        <div class="property-card" onclick="viewPropertyDetails('${property.id}')">
            <div class="property-image" style="background-image: url('${property.images && property.images[0] ? property.images[0] : 'https://via.placeholder.com/400x250?text=No+Image'}')">
                <span class="property-badge ${property.listingType === 'for-sale' ? 'badge-sale' : 'badge-rent'}">
                    ${property.listingType === 'for-sale' ? 'FOR SALE' : 'FOR RENT'}
                </span>
                <span class="property-type-badge">${property.type}</span>
            </div>
            <div class="property-info">
                <h3 class="property-title">${escapeHtml(property.name)}</h3>
                <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(property.location)}</p>
                <div class="property-details">
                    <span><i class="fas fa-arrows-alt"></i> ${property.squareMeters} m²</span>
                    ${property.bedrooms ? `<span><i class="fas fa-bed"></i> ${property.bedrooms}</span>` : ''}
                    ${property.bathrooms ? `<span><i class="fas fa-bath"></i> ${property.bathrooms}</span>` : ''}
                </div>
                <div class="property-price">${formatPrice(property.price)} ${property.listingType === 'for-rent' ? '/month' : ''}</div>
                <div class="property-agent">
                    <i class="fas fa-building"></i> ${escapeHtml(property.businessName || 'Real Estate Agency')}
                </div>
            </div>
        </div>
    `).join('');
}

function updatePagination(totalPages) {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
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

function viewPropertyDetails(propertyId) {
    const property = allProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    const modal = document.getElementById('propertyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('propertyModalBody');
    
    modalTitle.textContent = property.name;
    modalBody.innerHTML = `
        ${property.images && property.images[0] ? `<img src="${property.images[0]}" class="property-detail-image" alt="${escapeHtml(property.name)}">` : ''}
        
        <div class="property-detail-grid">
            <div class="detail-item">
                <span class="detail-label">Property Type</span>
                <span class="detail-value">${property.type}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Listing Type</span>
                <span class="detail-value">${property.listingType === 'for-sale' ? 'For Sale' : 'For Rent'}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Size</span>
                <span class="detail-value">${property.squareMeters} m²</span>
            </div>
            ${property.bedrooms ? `
            <div class="detail-item">
                <span class="detail-label">Bedrooms</span>
                <span class="detail-value">${property.bedrooms}</span>
            </div>
            ` : ''}
            ${property.bathrooms ? `
            <div class="detail-item">
                <span class="detail-label">Bathrooms</span>
                <span class="detail-value">${property.bathrooms}</span>
            </div>
            ` : ''}
            <div class="detail-item">
                <span class="detail-label">Price</span>
                <span class="detail-value">${formatPrice(property.price)} ${property.listingType === 'for-rent' ? '/month' : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">${escapeHtml(property.location)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Listed Date</span>
                <span class="detail-value">${new Date(property.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
        
        <h4 style="margin: 20px 0 10px; color: #333;">Description</h4>
        <p style="line-height: 1.6; color: #666; margin-bottom: 25px;">${escapeHtml(property.description)}</p>
        
        <button class="contact-agent-btn" onclick="openContactModal('${property.id}')">
            <i class="fas fa-envelope"></i> Contact Agent
        </button>
    `;
    
    // Show modal and disable body scroll
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function openContactModal(propertyId) {
    // Find the property
    const property = allProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    // Get the agent/user details from localStorage
    const allUsers = JSON.parse(localStorage.getItem('inheriti_users') || '[]');
    const agent = allUsers.find(u => u.email === property.userEmail);
    
    // Get the contact modal
    const modal = document.getElementById('contactModal');
    const modalBody = document.getElementById('contactModalBody');
    
    // Display agent information directly without form
    modalBody.innerHTML = `
        <div style="text-align: center;">
            <div style="width: 80px; height: 80px; background: #e8f4f3; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i class="fas fa-user-tie" style="font-size: 40px; color: #0f5f5c;"></i>
            </div>
            
            <h3 style="color: #0f5f5c; margin-bottom: 10px;">${escapeHtml(property.businessName || 'Real Estate Agency')}</h3>
            
            <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: left;">
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-user" style="width: 20px; color: #0f5f5c;"></i>
                    <div>
                        <strong>Contact Person</strong><br>
                        <span style="color: #666;">${agent ? escapeHtml(agent.firstName + ' ' + agent.lastName) : 'Not provided'}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-envelope" style="width: 20px; color: #0f5f5c;"></i>
                    <div>
                        <strong>Email Address</strong><br>
                        <span style="color: #666;">${property.userEmail || 'Not provided'}</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-phone" style="width: 20px; color: #0f5f5c;"></i>
                    <div>
                        <strong>Phone Number</strong><br>
                        <span style="color: #666;">${agent && agent.phone ? agent.phone : 'Not provided'}</span>
                    </div>
                </div>
                
                ${agent && agent.businessEmail ? `
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-building" style="width: 20px; color: #0f5f5c;"></i>
                    <div>
                        <strong>Business Email</strong><br>
                        <span style="color: #666;">${escapeHtml(agent.businessEmail)}</span>
                    </div>
                </div>
                ` : ''}
                
                ${agent && agent.licenseNumber ? `
                <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-id-card" style="width: 20px; color: #0f5f5c;"></i>
                    <div>
                        <strong>License Number</strong><br>
                        <span style="color: #666;">${escapeHtml(agent.licenseNumber)}</span>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div style="background: #e8f4f3; border-radius: 12px; padding: 15px; margin-top: 10px;">
                <i class="fas fa-clock" style="color: #0f5f5c; margin-right: 8px;"></i>
                <span style="color: #555; font-size: 14px;">Contact the agent directly for more information about this property</span>
            </div>
        </div>
    `;
    
    // Close property modal first, then open contact modal
    const propertyModal = document.getElementById('propertyModal');
    propertyModal.classList.remove('show');
    
    // Show contact modal
    modal.classList.add('show');
    // Body scroll is already disabled from property modal
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}