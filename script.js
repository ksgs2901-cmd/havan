// Exibe a cidade do visitante no campo "Enviar para"
const locationPlaceholders = document.querySelectorAll('.location-placeholder');
const locationLoadingEls = document.querySelectorAll('.location-loading');

function setVisitorLocation(label) {
    if (!label) return;
    locationPlaceholders.forEach(el => { el.textContent = label; });
    locationLoadingEls.forEach(el => { el.textContent = label; });
}

async function loadVisitorLocation() {
    try {
        const res = await fetch('/api/location');
        if (res.ok) {
            const data = await res.json();
            if (data?.label) {
                setVisitorLocation(data.label);
                return;
            }
        }
    } catch (_) {
        // tenta API externa
    }

    try {
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        if (data?.city) {
            const label = data.region_code ? `${data.city} - ${data.region_code}` : data.city;
            setVisitorLocation(label);
        }
    } catch (_) {
        // Mantém "Digite o CEP" / "Carregando" se não conseguir obter a cidade
    }
}

if (locationPlaceholders.length || locationLoadingEls.length) {
    loadVisitorLocation();
}

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const prevButton = document.querySelector('.carousel-prev');
const nextButton = document.querySelector('.carousel-next');
const totalSlides = slides.length;

function showSlide(index) {
    const carousel = document.querySelector('.carousel-slides');
    if (!carousel || totalSlides === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }

    carousel.style.transform = `translateX(-${index * 100}%)`;
}

function nextSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

// Event listeners for carousel
if (nextButton) {
    nextButton.addEventListener('click', nextSlide);
}

if (prevButton) {
    prevButton.addEventListener('click', prevSlide);
}

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Auto-play carousel
let carouselInterval = totalSlides > 0 ? setInterval(nextSlide, 5000) : null;

// Pause on hover
const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer && totalSlides > 0) {
    carouselContainer.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });
    
    carouselContainer.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(nextSlide, 5000);
    });
}

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
const closeMobileMenu = document.querySelector('.mobile-menu-close');

if (menuToggle && mobileMenuOverlay) {
    menuToggle.addEventListener('click', () => {
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (closeMobileMenu && mobileMenuOverlay) {
    closeMobileMenu.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Fechar menu ao clicar no overlay
if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Search functionality
const searchButton = document.querySelector('.search-button');
const searchInput = document.querySelector('#searchInput');

if (searchButton && searchInput) {
    searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            console.log('Buscando por:', searchTerm);
            // Search functionality can be implemented here
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

// Wishlist toggle
const wishlistButtons = document.querySelectorAll('.wishlist-btn');
wishlistButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        button.textContent = button.textContent === '♡' ? '♥' : '♡';
        button.style.color = button.textContent === '♥' ? '#dc2626' : '';
    });
});

// Wishlist toggle (product detail page - SVG icon based)
const wishlistDetailButtons = document.querySelectorAll('.wishlist-btn-detail');
wishlistDetailButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        button.classList.toggle('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Botão "Comprar agora" -> leva para o checkout com os dados do produto
const buyNowBtn = document.querySelector('.btn-buy-now');
if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
        const titleEl = document.querySelector('.product-title');
        const priceEl = document.querySelector('.price-current-detail');
        const imgEl = document.getElementById('mainImage');
        const qtyEl = document.querySelector('.qty-input');

        const name = titleEl ? titleEl.textContent.trim() : 'Produto Havan';
        const priceText = priceEl ? priceEl.textContent : '0';
        const price = parseFloat(priceText.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;

        let image = '';
        if (imgEl) {
            image = imgEl.getAttribute('src') || imgEl.src || '';
        }

        const qty = qtyEl ? qtyEl.value : '1';

        const params = new URLSearchParams({
            name,
            price: String(price),
            image,
            qty
        });

        try {
            localStorage.setItem('havan_prize_selected', name);
            localStorage.removeItem('havan_prize_pending');
        } catch (_) {}

        window.location.href = 'checkout.html?' + params.toString();
    });
}

// Initialize carousel only on pages that have one
document.addEventListener('DOMContentLoaded', () => {
    if (totalSlides > 0) {
        showSlide(0);
    }
    initPrizeNotice();
    initProductStockBadges();
});

function initPrizeNotice() {
    const notice = document.getElementById('prizeNotice');
    if (!notice) return;

    let shouldShow = false;

    try {
        shouldShow = localStorage.getItem('havan_prize_pending') === '1';
    } catch (_) {
        shouldShow = false;
    }

    if (!shouldShow) return;

    notice.hidden = false;

    const dismissBtn = document.getElementById('prizeNoticeDismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            notice.hidden = true;
        });
    }
}

function getProductCardKey(card) {
    const link = card.querySelector('.product-name a, .product-image');
    return link ? (link.getAttribute('href') || link.textContent.trim()) : '';
}

function parsePopularity(card) {
    const countEl = card.querySelector('.rating-count');
    const match = countEl?.textContent.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 50;
}

function getStockForRank(rank, total) {
    const ratio = total <= 1 ? 0 : rank / (total - 1);
    const min = Math.max(3, Math.round(3 + ratio * 5));
    const max = Math.min(12, Math.max(min, Math.round(6 + ratio * 6)));
    return min + Math.floor(Math.random() * (max - min + 1));
}

function initProductStockBadges() {
    const cards = Array.from(document.querySelectorAll('.products-grid .product-card'));
    if (!cards.length) return;

    const ranked = cards
        .map((card) => ({ card, popularity: parsePopularity(card), key: getProductCardKey(card) }))
        .sort((a, b) => b.popularity - a.popularity);

    ranked.forEach((item, rank) => {
        const storageKey = 'havan_stock_' + item.key;
        let stock;

        try {
            const saved = localStorage.getItem(storageKey);
            stock = saved ? parseInt(saved, 10) : null;
        } catch (_) {
            stock = null;
        }

        if (!stock || stock < 3 || stock > 12) {
            stock = getStockForRank(rank, ranked.length);
            try {
                localStorage.setItem(storageKey, String(stock));
            } catch (_) {}
        }

        const imageWrap = item.card.querySelector('.product-image');
        if (!imageWrap) return;

        const badge = document.createElement('span');
        badge.className = 'product-stock-badge' + (stock <= 5 ? ' product-stock-badge--low' : '');
        badge.textContent = `Restam ${stock} unidades`;
        imageWrap.appendChild(badge);
    });
}
