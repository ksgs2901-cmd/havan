(function () {
    const Price = window.HavanPrice;
    const catalog = window.HAVAN_CATALOG;
    if (!Price || !catalog) return;

    function renderPriceBlock(container, entry) {
        if (!container || !entry) return;

        const discount = Price.discount(entry.old, entry.current);
        container.innerHTML = `
            <span class="price-special-label">Preço exclusivo</span>
            ${discount > 0 ? `<span class="product-discount-badge">-${discount}%</span>` : ''}
            <span class="price-current">${Price.format(entry.current)}</span>
            <span class="price-old">${Price.format(entry.old)}</span>
            <span class="price-installment">${Price.installment(entry.current, entry.installments)} sem juros</span>
        `;
    }

    function applyIndexCards() {
        document.querySelectorAll('.products-grid .product-card').forEach((card) => {
            const link = card.querySelector('.product-name a, .product-image');
            if (!link) return;

            const href = link.getAttribute('href');
            const entry = catalog[href];
            if (!entry) return;

            renderPriceBlock(card.querySelector('.product-price'), entry);
        });
    }

    function applyProductPage() {
        const key = Price.getProductKey(window.location.pathname);
        const entry = catalog[key];
        if (!entry) return;

        const priceDetail = document.querySelector('.product-price-detail');
        const currentEl = document.querySelector('.price-current-detail');
        const installmentEl = document.querySelector('.price-installment-detail span');

        if (currentEl) currentEl.textContent = Price.format(entry.current);
        if (installmentEl) {
            installmentEl.textContent = `ou ${Price.installment(entry.current, entry.installments)} sem juros`;
        }

        if (priceDetail && !priceDetail.querySelector('.price-old-detail')) {
            const discount = Price.discount(entry.old, entry.current);
            const label = document.createElement('span');
            label.className = 'price-special-label';
            label.textContent = 'Preço exclusivo da campanha';

            const old = document.createElement('span');
            old.className = 'price-old-detail';
            old.textContent = Price.format(entry.old);

            const badge = document.createElement('span');
            badge.className = 'product-discount-badge product-discount-badge--detail';
            badge.textContent = `-${discount}%`;

            priceDetail.insertBefore(badge, currentEl);
            priceDetail.insertBefore(old, currentEl);
            priceDetail.insertBefore(label, priceDetail.firstChild);
        } else if (priceDetail) {
            const oldEl = priceDetail.querySelector('.price-old-detail');
            const badgeEl = priceDetail.querySelector('.product-discount-badge--detail');
            const discount = Price.discount(entry.old, entry.current);
            if (oldEl) oldEl.textContent = Price.format(entry.old);
            if (badgeEl) badgeEl.textContent = `-${discount}%`;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.querySelector('.products-grid')) applyIndexCards();
        if (document.querySelector('.product-price-detail')) applyProductPage();
    });
})();
