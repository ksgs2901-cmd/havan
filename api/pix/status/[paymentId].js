const { getPixStatus } = require('../../../server/lib/blackcat');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const paymentId = req.query.paymentId;
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
