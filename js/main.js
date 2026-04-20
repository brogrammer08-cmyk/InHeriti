const FEATURED_STORAGE_KEY = 'inheriti_properties';
const AUTO_SCROLL_MS = 3000;

const fallbackFeaturedProperties = [
  {
    id: 'fallback-1',
    name: 'Modern Villa in Downtown',
    price: 450000,
    location: 'Tirana, Albania',
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 250,
    description: 'Stunning modern villa with contemporary design and premium finishes.',
    listingType: 'for-sale',
    type: 'Villa',
    images: ['./images/360_F_335268468_WhuECjWCoOfQOovIMq7VASxI0imSrnTE.jpg']
  },
  {
    id: 'fallback-2',
    name: 'Cozy Apartment in City Center',
    price: 280000,
    location: 'Tirana, Albania',
    bedrooms: 2,
    bathrooms: 2,
    squareMeters: 120,
    description: 'Comfortable apartment with excellent location and modern amenities.',
    listingType: 'for-sale',
    type: 'Apartment',
    images: ['./images/cozy_apartment.webp']
  },
  {
    id: 'fallback-3',
    name: 'Luxury Penthouse',
    price: 750000,
    location: 'Tirana, Albania',
    bedrooms: 5,
    bathrooms: 4,
    squareMeters: 400,
    description: 'Exclusive penthouse with panoramic views and luxury finishes.',
    listingType: 'for-sale',
    type: 'Penthouse',
    images: ['./images/luxurious.webp']
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('featuredCarouselTrack');
  setupHomeSearch();
  if (!track) return;

  const properties = getFeaturedProperties();
  renderFeaturedCards(track, properties);
  startAutoCarousel(track);
});

function setupHomeSearch() {
  const searchBox = document.querySelector('.search-box');
  if (!searchBox) return;

  const searchInput = searchBox.querySelector('input[type="text"]');
  const searchButton = searchBox.querySelector('button');
  if (!searchInput || !searchButton) return;

  const submitSearch = () => {
    const term = (searchInput.value || '').trim();
    const targetUrl = term
      ? `properties.html?search=${encodeURIComponent(term)}`
      : 'properties.html';
    window.location.href = targetUrl;
  };

  searchButton.addEventListener('click', submitSearch);
  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitSearch();
    }
  });
}

function getFeaturedProperties() {
  try {
    const stored = JSON.parse(localStorage.getItem(FEATURED_STORAGE_KEY) || '[]');
    if (Array.isArray(stored) && stored.length > 0) {
      // Ensure enough slides for visible movement even with very small datasets.
      const merged = [...stored];
      let fallbackIndex = 0;
      while (merged.length < 3) {
        merged.push({
          ...fallbackFeaturedProperties[fallbackIndex % fallbackFeaturedProperties.length],
          id: `${fallbackFeaturedProperties[fallbackIndex % fallbackFeaturedProperties.length].id}-extra-${merged.length}`
        });
        fallbackIndex += 1;
      }
      return merged.slice(0, 12);
    }
  } catch (error) {
    console.warn('Failed reading featured properties from storage:', error);
  }

  return fallbackFeaturedProperties;
}

function renderFeaturedCards(track, properties) {
  track.innerHTML = properties.map((property) => {
    const imageSrc = property.images && property.images[0]
      ? property.images[0]
      : 'https://via.placeholder.com/400x250?text=No+Image';

    const title = escapeHtml(property.name || property.title || 'Featured Property');
    const description = escapeHtml(property.description || 'Explore this featured listing on InHeriti.');
    const location = escapeHtml(property.location || 'Tirana, Albania');
    const beds = Number(property.bedrooms) || 0;
    const baths = Number(property.bathrooms) || 0;
    const size = Number(property.squareMeters) || 0;
    const badge = property.listingType === 'for-rent' ? 'For Rent' : 'For Sale';

    return `
      <article class="property-card">
        <div class="card-image">
          <img src="${imageSrc}" alt="${title}">
          <span class="card-badge">${badge}</span>
        </div>
        <div class="card-content">
          <h3>${title}</h3>
          <p class="price">${formatPrice(property.price)}</p>
          <p class="location"><i class="fas fa-map-marker-alt"></i> ${location}</p>
          <div class="card-details">
            ${beds ? `<span><i class="fas fa-bed"></i> ${beds} Beds</span>` : ''}
            ${baths ? `<span><i class="fas fa-bath"></i> ${baths} Baths</span>` : ''}
            ${size ? `<span><i class="fas fa-ruler-combined"></i> ${size} m²</span>` : ''}
          </div>
          <p class="card-description">${description}</p>
          <a href="properties.html" class="view-btn">View Details</a>
        </div>
      </article>
    `;
  }).join('');
}

function startAutoCarousel(track) {
  let cards = Array.from(track.children);
  if (cards.length === 0) return;

  // Ensure enough slides for smooth movement on large screens.
  if (cards.length < 4) {
    const originalCards = [...cards];
    while (cards.length < 4) {
      const nextClone = originalCards[cards.length % originalCards.length].cloneNode(true);
      track.appendChild(nextClone);
      cards.push(nextClone);
    }
  }

  const clone = cards[0].cloneNode(true);
  track.appendChild(clone);

  let currentIndex = 0;
  let timerId = null;

  function getStepWidth() {
    const firstCard = track.querySelector('.property-card');
    if (!firstCard) return 0;
    const gapValue = window.getComputedStyle(track).gap || '0';
    const parsedGap = Number.parseFloat(gapValue);
    const gap = Number.isFinite(parsedGap) ? parsedGap : 0;
    return firstCard.getBoundingClientRect().width + gap;
  }

  function moveTo(index, withTransition = true) {
    const step = getStepWidth();
    if (!step) return;
    track.style.transition = withTransition ? 'transform 0.7s ease' : 'none';
    track.style.transform = `translateX(-${index * step}px)`;
  }

  function nextSlide() {
    currentIndex += 1;
    moveTo(currentIndex, true);
  }

  function start() {
    stop();
    timerId = window.setInterval(nextSlide, AUTO_SCROLL_MS);
  }

  function stop() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  track.addEventListener('transitionend', () => {
    if (currentIndex === cards.length) {
      currentIndex = 0;
      moveTo(currentIndex, false);
    }
  });

  track.parentElement.addEventListener('mouseenter', stop);
  track.parentElement.addEventListener('mouseleave', start);

  window.addEventListener('resize', () => moveTo(currentIndex, false));

  // Wait one frame so card widths are fully computed before first movement.
  window.requestAnimationFrame(() => {
    moveTo(0, false);
    start();
  });
}

function formatPrice(price) {
  const parsedPrice = Number(price) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(parsedPrice);
}

function escapeHtml(value) {
  const text = String(value || '');
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
