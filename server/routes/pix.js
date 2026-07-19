const express = require('express');
const { randomUUID } = require('crypto');
const QRCode = require('qrcode');

const router = express.Router();

const BLACKCAT_API_URL = 'https://api.blackcatoficial.com/api';

function getApiKey() {
    return process.env.BLACKCAT_SECRET_KEY || process.env.BLACKCAT_API_KEY || '';
}

function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function toCents(amount) {
    return Math.round(Number(amount) * 100);
}

function normalizeQrBase64(value) {
    if (!value) return '';
    const raw = String(value);
    if (raw.startsWith('data:image')) {
        return raw.split(',')[1] || '';
    }
    if (/^[A-Za-z0-9+/=]+$/.test(raw) && raw.length > 200) {
        return raw;
    }
    return '';
}

async function buildQrBase64(pixCode, paymentData) {
    const fromApi = normalizeQrBase64(paymentData.qrCodeBase64);
    if (fromApi) return fromApi;

    const code = pixCode || paymentData.copyPaste || paymentData.qrCode;
    if (!code) return '';

    return QRCode.toDataURL(code, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
    }).then((dataUrl) => dataUrl.split(',')[1] || '');
}

async function blackcatRequest(path, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
        const error = new Error('PIX API não configurada. Defina BLACKCAT_SECRET_KEY no arquivo .env');
        error.statusCode = 503;
        throw error;
    }

    const response = await fetch(`${BLACKCAT_API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey,
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
        const message = data.message || data.error || `Erro na API BlackCat (${response.status})`;
        const error = new Error(message);
        error.statusCode = response.status >= 400 && response.status < 600 ? response.status : 500;
        throw error;
    }

    return data;
}

router.post('/create', async (req, res) => {
    const {
        amount,
        description,
        productName,
        productQty,
        email,
        cpf,
        name,
        phone,
        shipping
    } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor do pedido inválido' });
    }

    if (!email) {
        return res.status(400).json({ error: 'E-mail do pagador é obrigatório' });
    }

    if (!name) {
        return res.status(400).json({ error: 'Nome do pagador é obrigatório' });
    }

    const cpfDigits = onlyDigits(cpf);
    if (cpfDigits.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
    }

    const phoneDigits = onlyDigits(phone);
    if (phoneDigits.length < 10) {
        return res.status(400).json({ error: 'Telefone inválido' });
    }

    const qty = Number(productQty) || 1;
    const amountCents = toCents(amount);
    const unitPriceCents = Math.round(amountCents / qty);
    const itemTitle = productName || description || 'Pedido Havan';

    const payload = {
        amount: amountCents,
        currency: 'BRL',
        paymentMethod: 'pix',
        items: [
            {
                title: itemTitle,
                unitPrice: unitPriceCents,
                quantity: qty,
                tangible: true
            }
        ],
        customer: {
            name,
            email,
            phone: phoneDigits,
            document: {
                number: cpfDigits,
                type: 'cpf'
            }
        },
        pix: {
            expiresInDays: 1
        },
        externalRef: `HV-${randomUUID()}`
    };

    if (shipping) {
        const zipCode = onlyDigits(shipping.cep);
        const state = String(shipping.estado || '').trim().toUpperCase();

        if (!shipping.endereco || !shipping.numero || !shipping.bairro || !shipping.cidade || !state || zipCode.length !== 8) {
            return res.status(400).json({ error: 'Dados de entrega incompletos' });
        }

        payload.shipping = {
            name,
            street: shipping.endereco,
            number: String(shipping.numero),
            complement: shipping.complemento || undefined,
            neighborhood: shipping.bairro,
            city: shipping.cidade,
            state,
            zipCode
        };
    }

    try {
        const result = await blackcatRequest('/sales/create-sale', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const sale = result.data || {};
        const paymentData = sale.paymentData || {};
        const pixCode = paymentData.copyPaste || paymentData.qrCode || '';
        const qrCodeBase64 = await buildQrBase64(pixCode, paymentData);

        res.json({
            paymentId: sale.transactionId,
            status: mapBlackcatStatus(sale.status),
            rawStatus: sale.status,
            qrCode: pixCode,
            qrCodeBase64,
            invoiceUrl: sale.invoiceUrl || null,
            expiresAt: paymentData.expiresAt || null
        });
    } catch (err) {
        console.error('Erro ao criar pagamento PIX:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao criar pagamento PIX' });
    }
});

router.get('/status/:paymentId', async (req, res) => {
    const paymentId = req.params.paymentId;
    if (!paymentId) {
        return res.status(400).json({ error: 'ID do pagamento é obrigatório' });
    }

    try {
        const result = await blackcatRequest(`/sales/${encodeURIComponent(paymentId)}/status`, {
            method: 'GET'
        });

        const sale = result.data || {};

        res.json({
            paymentId: sale.transactionId || paymentId,
            status: mapBlackcatStatus(sale.status),
            rawStatus: sale.status,
            statusDetail: sale.status
        });
    } catch (err) {
        console.error('Erro ao consultar pagamento PIX:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao consultar pagamento' });
    }
});

function mapBlackcatStatus(status) {
    const normalized = String(status || '').toUpperCase();

    if (normalized === 'PAID') return 'approved';
    if (normalized === 'CANCELLED' || normalized === 'REFUNDED') return 'cancelled';
    return 'pending';
}

module.exports = router;
