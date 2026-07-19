const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pixRoutes = require('./routes/pix');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
    const { getApiKey } = require('./lib/blackcat');
    res.json({
        ok: true,
        pixConfigured: Boolean(getApiKey())
    });
});

app.use('/api/pix', pixRoutes);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    const hasKey = Boolean(process.env.BLACKCAT_SECRET_KEY || process.env.BLACKCAT_API_KEY);
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(hasKey
        ? 'PIX API: BlackCat configurada'
        : 'PIX API: defina BLACKCAT_SECRET_KEY no arquivo .env');
});
