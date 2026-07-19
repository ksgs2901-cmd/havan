// ---- Resumo do pedido (via query string vinda do botão "Comprar agora") ----
const params = new URLSearchParams(window.location.search);
const productName = params.get('name') || 'Produto Havan';
const productPrice = parseFloat(params.get('price')) || 0;
const productImage = params.get('image') || 'banner-havan.png';
const productQty = parseInt(params.get('qty')) || 1;

const API_BASE = window.location.origin;

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

function getShippingData() {
    return {
        name: document.getElementById('fName')?.value?.trim() || '',
        cpf: document.getElementById('fCpf')?.value || '',
        email: document.getElementById('fEmail')?.value?.trim() || '',
        phone: document.getElementById('fPhone')?.value || '',
        cep: document.getElementById('fCep')?.value || '',
        numero: document.getElementById('fNumero')?.value || '',
        endereco: document.getElementById('fEndereco')?.value || '',
        bairro: document.getElementById('fBairro')?.value || '',
        cidade: document.getElementById('fCidade')?.value || '',
        estado: document.getElementById('fEstado')?.value || ''
    };
}

// ---- Etapa 1: formulário de entrega ----
const shippingForm = document.getElementById('shippingForm');
if (shippingForm) {
    shippingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }

        const submitBtn = shippingForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Gerando Pix...';
        }

        try {
            goToStep(2);
            await startPixPayment();
        } catch (err) {
            goToStep(1);
            showPixError(err.message || 'Não foi possível gerar o pagamento Pix.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
}

const backToShippingBtn = document.getElementById('backToShipping');
if (backToShippingBtn) {
    backToShippingBtn.addEventListener('click', () => {
        stopPixPolling();
        goToStep(1);
    });
}

// ---- Etapa 2: pagamento Pix via API ----
let pixPollInterval = null;
let currentPaymentId = null;

function showPixError(message) {
    const pixStatus = document.getElementById('pixStatus');
    if (!pixStatus) return;

    pixStatus.classList.remove('confirmed');
    pixStatus.classList.add('error');
    pixStatus.innerHTML = '<span>⚠ ' + message + '</span>';
}

function showPixWaiting() {
    const pixStatus = document.getElementById('pixStatus');
    if (!pixStatus) return;

    pixStatus.classList.remove('confirmed', 'error');
    pixStatus.innerHTML = '<div class="pix-spinner"></div><span>Aguardando confirmação do pagamento...</span>';
}

function renderPixQr(container, qrCodeBase64) {
    if (!container) return;

    container.innerHTML = '';
    container.classList.add('pix-qr--image');

    if (qrCodeBase64) {
        const img = document.createElement('img');
        img.src = 'data:image/png;base64,' + qrCodeBase64;
        img.alt = 'QR Code Pix';
        img.width = 200;
        img.height = 200;
        container.appendChild(img);
        return;
    }

    container.classList.remove('pix-qr--image');
    container.innerHTML = '<p class="pix-qr-fallback">QR Code indisponível. Use o código copia e cola abaixo.</p>';
}

async function createPixPayment() {
    const shipping = getShippingData();

    const response = await fetch(API_BASE + '/api/pix/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: subtotal,
            description: productName + ' (x' + productQty + ')',
            productName,
            productQty,
            email: shipping.email,
            cpf: shipping.cpf,
            name: shipping.name,
            phone: shipping.phone,
            shipping: {
                cep: shipping.cep,
                numero: shipping.numero,
                endereco: shipping.endereco,
                bairro: shipping.bairro,
                cidade: shipping.cidade,
                estado: shipping.estado,
                complemento: document.getElementById('fComplemento')?.value || ''
            }
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar pagamento Pix');
    }

    return data;
}

function stopPixPolling() {
    if (pixPollInterval) {
        clearInterval(pixPollInterval);
        pixPollInterval = null;
    }
    currentPaymentId = null;
}

function confirmPixPayment(paymentId) {
    stopPixPolling();

    const pixStatus = document.getElementById('pixStatus');
    if (pixStatus) {
        pixStatus.classList.remove('error');
        pixStatus.classList.add('confirmed');
        pixStatus.innerHTML = '<span>✓ Pagamento identificado!</span>';
    }

    setTimeout(() => {
        const orderNumber = document.getElementById('orderNumber');
        if (orderNumber) {
            orderNumber.textContent = '#HV' + String(paymentId).slice(-6).padStart(6, '0');
        }
        goToStep(3);
    }, 1200);
}

function startPixPolling(paymentId) {
    stopPixPolling();
    currentPaymentId = paymentId;

    const poll = async () => {
        if (!currentPaymentId) return;

        try {
            const response = await fetch(API_BASE + '/api/pix/status/' + currentPaymentId);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao consultar pagamento');
            }

            if (data.status === 'approved') {
                confirmPixPayment(data.paymentId);
            } else if (data.status === 'cancelled') {
                stopPixPolling();
                showPixError('Pagamento cancelado ou expirado. Gere um novo Pix para tentar novamente.');
            }
        } catch (err) {
            console.error('Erro ao consultar status do Pix:', err);
        }
    };

    poll();
    pixPollInterval = setInterval(poll, 5000);
}

async function startPixPayment() {
    const pixCodeInput = document.getElementById('pixCode');
    const pixQr = document.getElementById('pixQr');

    showPixWaiting();

    if (pixCodeInput) pixCodeInput.value = '';
    if (pixQr) {
        pixQr.innerHTML = '<div class="pix-spinner"></div>';
        pixQr.classList.remove('pix-qr--image');
    }

    const payment = await createPixPayment();

    if (pixCodeInput) pixCodeInput.value = payment.qrCode || '';
    renderPixQr(pixQr, payment.qrCodeBase64);

    if (payment.status === 'approved') {
        confirmPixPayment(payment.paymentId);
        return;
    }

    startPixPolling(payment.paymentId);
}

const copyBtn = document.getElementById('pixCopyBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const code = document.getElementById('pixCode').value;
        if (!code) return;

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
