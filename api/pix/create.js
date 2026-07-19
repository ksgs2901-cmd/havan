const { createPixSale } = require('../../server/lib/blackcat');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const result = await createPixSale(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.statusCode || 500).json({ error: err.message || 'Erro ao criar pagamento PIX' });
    }
};
