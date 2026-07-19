// ---- Resumo do pedido (via query string vinda do botão "Comprar agora") ----
const params = new URLSearchParams(window.location.search);
const productName = params.get('name') || 'Produto Havan';
const productPrice = parseFloat(params.get('price')) || 0;
const productImage = params.get('image') || 'banner-havan.png';
const productQty = parseInt(params.get('qty')) || 1;

function formatBRL(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d)\,)/g, '.');
}

const summaryImg = document.getElementById('summaryImg');
const summaryName = document.getElementById('summaryName');
const summaryQty = document.getElementById('summaryQty');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTotal = document.getElementById('summaryTotal');

if (summaryImg) summaryImg.src = productImage;
if (summaryName) summaryName.textContent = productName;
if (summaryQty) summaryQty.textContent = 'Quantidade: ' + productQty;
const subtotal = productPrice * productQty;
if (summarySubtotal) summarySubtotal.textContent = formatBRL(subtotal);
if (summaryTotal) summaryTotal.textContent = formatBRL(subtotal);

// ---- Máscaras dos campos ----
const cpfInput = document.getElementById('fCpf');
if (cpfInput) {
    cpfInput.addEventListener('input', () => {
        let v = cpfInput.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        cpfInput.value = v;
    });
}

const phoneInput = document.getElementById('fPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', () => {
        let v = phoneInput.value.replace(/\D/g, '').slice(0, 11);
        v = v.replace(/(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
        phoneInput.value = v;
    });
}

const cepInput = document.getElementById('fCep');
if (cepInput) {
    cepInput.addEventListener('input', () => {
        let v = cepInput.value.replace(/\D/g, '').slice(0, 8);
        v = v.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
        cepInput.value = v;
    });
}

// ---- Navegação entre as etapas ----
const steps = document.querySelectorAll('.checkout-step');
const panels = document.querySelectorAll('.checkout-panel');

function goToStep(n) {
    steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) <= n));
    panels.forEach(p => p.classList.toggle('active', Number(p.dataset.panel) === n));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- Etapa 1: formulário de entrega ----
const shippingForm = document.getElementById('shippingForm');
if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }
        goToStep(2);
        startPixSimulation();
    });
}

const backToShippingBtn = document.getElementById('backToShipping');
if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', () => goToStep(1));
}

// ---- Etapa 2: geração do Pix (simulado) ----
function generatePixCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let random = '';
    for (let i = 0; i < 32; i++) random += chars[Math.floor(Math.random() * chars.length)];
    return 'PIXSIMULACAO' + random;
}

function renderFakeQr(container) {
    if (!container) return;
    container.innerHTML = '';
    const size = 21;
    const grid = Array.from({ length: size }, () => new Array(size).fill(0));

    // Ruído aleatório para lembrar a "área de dados" de um QR (não é um código real)
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            grid[y][x] = Math.random() < 0.45 ? 1 : 0;
        }
    }

    // Quadrados de referência nos cantos, como em um QR de verdade
    function drawFinder(ox, oy) {
        for (let y = 0; y < 7; y++) {
            for (let x = 0; x < 7; x++) {
                const border = (x === 0 || x === 6 || y === 0 || y === 6);
                const innerFill = (x >= 2 && x <= 4 && y >= 2 && y <= 4);
                grid[oy + y][ox + x] = (border || innerFill) ? 1 : 0;
            }
        }
    }
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('span');
            if (grid[y][x]) cell.className = 'pix-qr-cell';
            container.appendChild(cell);
        }
    }
}

let pixTimeout = null;

function startPixSimulation() {
    const pixCodeInput = document.getElementById('pixCode');
    const pixQr = document.getElementById('pixQr');
    const pixStatus = document.getElementById('pixStatus');

    if (pixCodeInput) pixCodeInput.value = generatePixCode();
    renderFakeQr(pixQr);
    if (pixStatus) {
        pixStatus.classList.remove('confirmed');
        pixStatus.innerHTML = '<div class="pix-spinner"></div><span>Aguardando confirmação do pagamento...</span>';
    }

    if (pixTimeout) clearTimeout(pixTimeout);
    pixTimeout = setTimeout(() => {
        if (pixStatus) {
            pixStatus.classList.add('confirmed');
            pixStatus.innerHTML = '<span>✓ Pagamento identificado!</span>';
        }
        setTimeout(() => {
            const orderNumber = document.getElementById('orderNumber');
            if (orderNumber) {
                orderNumber.textContent = '#HV' + Math.floor(100000 + Math.random() * 900000);
            }
            goToStep(3);
        }, 1200);
    }, 6000);
}

const copyBtn = document.getElementById('pixCopyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const code = document.getElementById('pixCode').value;
        const originalText = copyBtn.textContent;
        const onCopied = () => {
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(onCopied).catch(() => {});
        } else {
            const tempInput = document.createElement('input');
            tempInput.value = code;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            onCopied();
        }
    });
}
