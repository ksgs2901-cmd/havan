const { getApiKey } = require('../../server/lib/blackcat');

module.exports = (_req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
        ok: true,
        pixConfigured: Boolean(getApiKey())
    });
};
