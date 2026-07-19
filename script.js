// Localização aproximada por IP (recurso visível de "Enviar para", como em qualquer e-commerce)
const locationPlaceholders = document.querySelectorAll('.location-placeholder');
const locationLoadingEls = document.querySelectorAll('.location-loading');

if (locationPlaceholders.length || locationLoadingEls.length) {
    fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
            if (data && data.success !== false && data.city) {
                const label = data.region_code ? `${data.city} - ${data.region_code}` : data.city;
                locationPlaceholders.forEach(el => { el.textContent = label; });
                locationLoadingEls.forEach(el => { el.textContent = label; });
            }
        })
        .catch(() => {
            // Falha silenciosa: mantém "Digite o CEP" / "Carregando" como estavam
        });
}

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const prevButton = document.querySelector('.carousel-prev');
const nextButton = document.querySelector('.carousel-next');
const totalSlides = slides.length;

function showSlide(index) {
    // Move carousel
    const carousel = document.querySelector('.carousel-slides');
    if (!carousel) return;

    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Add active class to current slide and dot
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (dots[index]) {
        dots[index].classList.add('active');
    }

    carousel.style.transform = `translateX(-${index * 100}%)`;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
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
        const priceText = priceEl ? priceEl.textContent.replace('R$', '').trim() : '0';
        const price = parseFloat(priceText.replace(/\./g, '').replace(',', '.')) || 0;
        const image = imgEl ? imgEl.src : '';
        const qty = qtyEl ? qtyEl.value : '1';

        const params = new URLSearchParams({ name, price, image, qty });
        window.location.href = 'checkout.html?' + params.toString();
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
});
