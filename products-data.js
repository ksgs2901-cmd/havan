window.HAVAN_CATALOG = {
    'product.html': { old: 999.90, current: 249.90, installments: 10 },
    'product2.html': { old: 1799.90, current: 449.90, installments: 10 },
    'product3.html': { old: 3499.90, current: 699.90, installments: 10 },
    'product4.html': { old: 8999.90, current: 1799.90, installments: 12 },
    'product5.html': { old: 2999.90, current: 599.90, installments: 10 },
    'product6.html': { old: 2999.90, current: 499.90, installments: 12 },
    'product7.html': { old: 4999.90, current: 999.90, installments: 12 },
    'product8.html': { old: 2999.90, current: 499.90, installments: 12 },
    'product9.html': { old: 999.90, current: 199.90, installments: 10 },
    'product10.html': { old: 699.90, current: 149.90, installments: 10 },
    'product11.html': { old: 3999.90, current: 799.90, installments: 12 },
    'product12.html': { old: 3999.90, current: 799.90, installments: 12 },
    'product13.html': { old: 6999.90, current: 1399.90, installments: 12 },
    'product14.html': { old: 4499.90, current: 899.90, installments: 12 },
    'product15.html': { old: 3999.90, current: 799.90, installments: 12 },
    'product16.html': { old: 6999.90, current: 1399.90, installments: 12 },
    'product17.html': { old: 1199.90, current: 249.90, installments: 10 },
    'product18.html': { old: 1999.90, current: 399.90, installments: 12 },
    'product19.html': { old: 7499.90, current: 1499.90, installments: 12 },
    'product20.html': { old: 799.90, current: 169.90, installments: 10 },
    'product21.html': { old: 799.90, current: 169.90, installments: 10 },
    'product22.html': { old: 3499.90, current: 699.90, installments: 12 },
    'product23.html': { old: 4999.90, current: 999.90, installments: 12 },
    'product24.html': { old: 499.90, current: 99.90, installments: 10 },
};

window.HavanPrice = {
    format(value) {
        return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d)\,)/g, '.');
    },

    installment(value, times) {
        const part = value / times;
        return `${times}x de ${this.format(part)}`;
    },

    discount(old, current) {
        if (!old || old <= current) return 0;
        return Math.round((1 - current / old) * 100);
    },

    parse(text) {
        if (!text) return 0;
        const normalized = String(text).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
        const value = parseFloat(normalized);
        return Number.isFinite(value) ? value : 0;
    },

    getProductKey(pathname) {
        const file = (pathname || '').split('/').pop() || 'index.html';
        return file.includes('.html') ? file : `${file}.html`;
    },

    getEntry(pathname) {
        return window.HAVAN_CATALOG[this.getProductKey(pathname)] || null;
    },
};
