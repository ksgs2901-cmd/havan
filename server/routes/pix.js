const express = require('express');
const { createPixSale, getPixStatus } = require('../lib/blackcat');

const router = express.Router();

router.post('/create', async (req, res) => {
    try {
        const result = await createPixSale(req.body);
        res.json(result);
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
        const result = await getPixStatus(paymentId);
        res.json(result);
    } catch (err) {
        console.error('Erro ao consultar pagamento PIX:', err);
        res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao consultar pagamento' });
    }
});

module.exports = router;
