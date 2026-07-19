const { getPixStatus } = require('../../server/lib/blackcat');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const paymentId = req.query.id || req.query.paymentId;
    if (!paymentId) {
        return res.status(400).json({ error: 'ID do pagamento é obrigatório' });
    }

    try {
        const result = await getPixStatus(paymentId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao consultar pagamento' });
    }
};
