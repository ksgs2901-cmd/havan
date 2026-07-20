// ---- Resumo do pedido (via query string vinda do botão "Comprar agora") ----
const params = new URLSearchParams(window.location.search);
const productName = params.get('name') || 'Produto Havan';
const productPrice = parseFloat(params.get('price')) || 0;
const productImage = params.get('image') || 'banner-havan.png';
const productQty = parseInt(params.get('qty'), 10) || 1;

function resolveApiBase() {
    const { protocol, hostname, port, origin } = window.location;

    if (protocol === 'file:') {
        return 'http://localhost:3000';
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        if (!port || port === '3000') {
            return origin;
        }
        return `${protocol}//${hostname}:3000`;
    }

    return origin;
}

const API_BASE = resolveApiBase();
const API_ENDPOINTS = {
    health: ['/api/health', '/api/health.php'],
    create: ['/api/pix/create', '/api/pix/create.php'],
    status: (id) => [`/api/pix/status/${id}`, `/api/pix/status.php?id=${encodeURIComponent(id)}`]
};

async function fetchApi(paths, options = {}) {
    let lastError = null;

    for (const path of paths) {
        try {
            const response = await fetch(API_BASE + path, options);
            let data = {};

            try {
                const text = await response.text();
                data = text ? JSON.parse(text) : {};
            } catch {
                lastError = new Error('offline');
                continue;
            }

            if (response.ok) {
                return { response, data };
            }

            if (data.error && response.status >= 400 && response.status < 500) {
                throw new Error(data.error);
            }

            lastError = new Error(data.error || `Erro HTTP ${response.status}`);
        } catch (err) {
            if (err.message && err.message !== 'offline') {
                throw err;
            }
            lastError = err;
        }
    }

    throw lastError || new Error('Servidor indisponível. Clique duas vezes em iniciar-site.bat para abrir a loja.');
}

function formatBRL(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d)\,)/g, '.');
}

const summaryImg = document.getElementById('summaryImg');
const summaryName = document.getElementById('summaryName');
const summaryQty = document.getElementById('summaryQty');
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryTotal = document.getElementById('summaryTotal');
const checkoutFormError = document.getElementById('checkoutFormError');

if (summaryImg) {
    summaryImg.src = productImage;
    summaryImg.alt = productName;
    summaryImg.referrerPolicy = 'no-referrer';
    summaryImg.classList.add('checkout-summary-img');
    summaryImg.onerror = () => {
        summaryImg.onerror = null;
        summaryImg.removeAttribute('src');
        summaryImg.classList.add('checkout-summary-img--missing');
    };
}
if (summaryName) summaryName.textContent = productName;
if (summaryQty) summaryQty.textContent = 'Quantidade: ' + productQty;
const subtotal = productPrice * productQty;
if (summarySubtotal) summarySubtotal.textContent = formatBRL(subtotal);
if (summaryTotal) summaryTotal.textContent = formatBRL(subtotal);

function showFormError(message) {
    if (!checkoutFormError) return;
    checkoutFormError.textContent = message;
    checkoutFormError.hidden = !message;
}

function clearFormError() {
    showFormError('');
}

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

    cepInput.addEventListener('blur', async () => {
        const digits = cepInput.value.replace(/\D/g, '');
        if (digits.length !== 8) return;

        try {
            const response = await fetch('https://viacep.com.br/ws/' + digits + '/json/');
            const data = await response.json();
            if (data.erro) return;

            const endereco = document.getElementById('fEndereco');
            const bairro = document.getElementById('fBairro');
            const cidade = document.getElementById('fCidade');
            const estado = document.getElementById('fEstado');

            if (endereco && data.logradouro) endereco.value = data.logradouro;
            if (bairro && data.bairro) bairro.value = data.bairro;
            if (cidade && data.localidade) cidade.value = data.localidade;
            if (estado && data.uf) estado.value = data.uf;

            const numero = document.getElementById('fNumero');
            if (numero && !numero.value) numero.focus();
        } catch (err) {
            console.warn('Não foi possível buscar o CEP:', err);
        }
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

function validateCheckoutData() {
    if (window.location.protocol === 'file:') {
        return 'Clique duas vezes em iniciar-site.bat para abrir a loja corretamente.';
    }

    if (!subtotal || subtotal <= 0) {
        return 'Valor do pedido inválido. Volte à loja e clique em Comprar agora novamente.';
    }

    const shipping = getShippingData();
    const cpfDigits = shipping.cpf.replace(/\D/g, '');
    const phoneDigits = shipping.phone.replace(/\D/g, '');
    const cepDigits = shipping.cep.replace(/\D/g, '');

    if (cpfDigits.length !== 11) return 'Informe um CPF válido com 11 dígitos.';
    if (phoneDigits.length < 10) return 'Informe um telefone válido com DDD.';
    if (cepDigits.length !== 8) return 'Informe um CEP válido.';
    if (!shipping.estado) return 'Selecione o estado.';

    return '';
}

// ---- Etapa 1: formulário de entrega ----
const shippingForm = document.getElementById('shippingForm');
if (shippingForm) {
    shippingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormError();

        if (!shippingForm.checkValidity()) {
            shippingForm.reportValidity();
            return;
        }

        const validationError = validateCheckoutData();
        if (validationError) {
            showFormError(validationError);
            return;
        }

        const submitBtn = shippingForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Gerando Pix...';
        }

        try {
            await startPixPayment();
        } catch (err) {
            showFormError(err.message || 'Não foi possível gerar o pagamento Pix.');
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
        clearFormError();
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

async function parseJsonResponse(response, options = {}) {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        if (options.allowHtmlError) {
            throw new Error('offline');
        }
        throw new Error('Servidor indisponível. Clique duas vezes em iniciar-site.bat para abrir a loja.');
    }
}

async function createPixPayment() {
    const shipping = getShippingData();

    const { data } = await fetchApi(API_ENDPOINTS.create, {
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

    if (data.error) {
        throw new Error(data.error);
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
            const { data } = await fetchApi(API_ENDPOINTS.status(currentPaymentId));

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.status === 'approved') {
                confirmPixPayment(data.paymentId);
            } else if (data.status === 'cancelled') {
                stopPixPolling();
                showPixError('Pagamento cancelado ou expirado. Volte e gere um novo Pix.');
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

    goToStep(2);

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

async function checkServerOnLoad() {
    if (!checkoutFormError) return;

    try {
        await fetchApi(API_ENDPOINTS.health, { method: 'GET' });
        clearFormError();
    } catch {
        showFormError('Para usar o checkout, clique duas vezes em iniciar-site.bat (Windows) ou execute ./iniciar-site.sh');
    }
}

checkServerOnLoad();
