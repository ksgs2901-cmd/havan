const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pixRoutes = require('./routes/pix');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/pix', pixRoutes);
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    const hasToken = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(hasToken
        ? 'PIX API: Mercado Pago configurado'
        : 'PIX API: defina MERCADOPAGO_ACCESS_TOKEN no arquivo .env');
});
