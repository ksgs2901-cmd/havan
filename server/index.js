const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pixRoutes = require('./routes/pix');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function getClientIp(req) {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        return String(forwarded).split(',')[0].trim();
    }
    const realIp = req.headers['x-real-ip'];
    if (realIp) return String(realIp).trim();
    return req.socket?.remoteAddress || 'Desconhecido';
}

app.get('/api/health', (_req, res) => {
    const { getApiKey } = require('./lib/blackcat');
    res.json({
        ok: true,
        pixConfigured: Boolean(getApiKey())
    });
});

app.get('/api/ip', (req, res) => {
    res.json({ ip: getClientIp(req) });
});

app.use('/api/pix', pixRoutes);
app.use(express.static(path.join(__dirname, '..')));

app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Rota não encontrada' });
    }
    res.sendFile(path.join(__dirname, '..', req.path === '/' ? 'index.html' : req.path), (err) => {
        if (err) res.sendFile(path.join(__dirname, '..', 'index.html'));
    });
});

if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        const hasKey = Boolean(process.env.BLACKCAT_SECRET_KEY || process.env.BLACKCAT_API_KEY);
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(hasKey ? 'PIX API: BlackCat configurada' : 'PIX API: defina BLACKCAT_SECRET_KEY no .env');
    });
}

module.exports = app;
