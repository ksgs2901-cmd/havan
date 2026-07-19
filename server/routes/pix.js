const express = require('express');
const { randomUUID } = require('crypto');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const router = express.Router();

function getPaymentClient() {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) return null;

    const client = new MercadoPagoConfig({ accessToken: token });
    return new Payment(client);
}

router.post('/create', async (req, res) => {
    const paymentClient = getPaymentClient();
    if (!paymentClient) {
        return res.status(503).json({
            error: 'PIX API não configurada. Defina MERCADOPAGO_ACCESS_TOKEN no arquivo .env'
        });
    }

    const { amount, description, email, cpf, name } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor do pedido inválido' });
    }

    if (!email) {
        return res.status(400).json({ error: 'E-mail do pagador é obrigatório' });
    }

    const cpfDigits = cpf ? String(cpf).replace(/\D/g, '') : '';

    try {
        const result = await paymentClient.create({
            body: {
                transaction_amount: Number(amount),
                description: description || 'Pedido Havan',
                payment_method_id: 'pix',
                payer: {
                    email,
                    first_name: name?.split(' ')[0] || 'Cliente',
                    last_name: name?.split(' ').slice(1).join(' ') || 'Havan',
                    identification: cpfDigits.length === 11
                        ? { type: 'CPF', number: cpfDigits }
                        : undefined
                }
            },
            requestOptions: { idempotencyKey: randomUUID() }
        });

        const transactionData = result.point_of_interaction?.transaction_data;

        res.json({
            paymentId: result.id,
            status: result.status,
            qrCode: transactionData?.qr_code || '',
            qrCodeBase64: transactionData?.qr_code_base64 || '',
            ticketUrl: transactionData?.ticket_url || null
        });
    } catch (err) {
        console.error('Erro ao criar pagamento PIX:', err);
        const message = err?.cause?.[0]?.description || err?.message || 'Erro ao criar pagamento PIX';
        res.status(500).json({ error: message });
    }
});

router.get('/status/:paymentId', async (req, res) => {
    const paymentClient = getPaymentClient();
    if (!paymentClient) {
        return res.status(503).json({ error: 'PIX API não configurada' });
    }

    const paymentId = req.params.paymentId;
    if (!paymentId) {
        return res.status(400).json({ error: 'ID do pagamento é obrigatório' });
    }

    try {
        const result = await paymentClient.get({ id: paymentId });

        res.json({
            paymentId: result.id,
            status: result.status,
            statusDetail: result.status_detail
        });
    } catch (err) {
        console.error('Erro ao consultar pagamento PIX:', err);
        const message = err?.cause?.[0]?.description || err?.message || 'Erro ao consultar pagamento';
        res.status(500).json({ error: message });
    }
});

module.exports = router;
