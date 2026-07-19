# Clone Havan

Clone completo e idêntico do site da Havan (https://www.havan.com.br/)

## 📋 Descrição

Este projeto é uma réplica fiel do site da Havan, incluindo:

- ✅ Header completo com logo, busca, menu, conta do usuário e carrinho
- ✅ Banner carrossel principal
- ✅ Seção de categorias com ícones
- ✅ Seção "Ofertas Imperdíveis pra Você!" com produtos
- ✅ Seção "Oferta Boa por Tempo Limitado!" com produtos
- ✅ Rodapé completo com links e informações
- ✅ Design idêntico com cores, fontes e estilos do original
- ✅ Funcionalidades interativas (carrossel, menu mobile, etc)

## 🎨 Características do Design

- **Cores principais:**
  - Azul primário: `#0c3bdd`
  - Texto: `#334156`
  - Fundo: `#ffffff`
  - Badge de desconto: `#dc2626`

- **Tipografia:**
  - Fonte: Nunito (Google Fonts)

## 🚀 Como usar

### Apenas o site (estático)

1. Abra o arquivo `index.html` em um navegador web
2. Ou use um servidor local:
   ```bash
   # Com Python
   python -m http.server 8000
   
   # Com Node.js (http-server)
   npx http-server
   ```

### Checkout com Pix real (Mercado Pago)

O pagamento Pix exige um backend para proteger as credenciais da API.

1. Crie uma aplicação no [Painel de Desenvolvedores do Mercado Pago](https://www.mercadopago.com.br/developers/panel/app) e copie o **Access Token**.
2. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   # Edite .env e cole seu MERCADOPAGO_ACCESS_TOKEN
   ```
3. Instale as dependências e inicie o servidor:
   ```bash
   cd server
   npm install
   npm start
   ```
4. Acesse `http://localhost:3000`, escolha um produto, clique em **Comprar agora** e finalize o checkout com Pix.

O servidor serve os arquivos estáticos e expõe:

- `POST /api/pix/create` — gera cobrança Pix (QR Code + copia e cola)
- `GET /api/pix/status/:paymentId` — consulta status do pagamento

**Importante:** cadastre uma chave Pix na conta Mercado Pago vendedora. Em ambiente de teste, use [usuários de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-accounts).

## 📁 Estrutura de Arquivos

```
havan-clone/
├── index.html          # Página principal
├── checkout.html       # Checkout com Pix
├── checkout.js         # Lógica do checkout e integração Pix
├── styles.css          # Estilos CSS completos
├── script.js           # JavaScript para interatividade
├── server/             # Backend Node.js (API Pix Mercado Pago)
│   ├── index.js
│   ├── routes/pix.js
│   └── package.json
├── .env.example        # Exemplo de variáveis de ambiente
└── README.md           # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Node.js + Express (API Pix)
- Mercado Pago SDK (pagamentos Pix)
- Google Fonts (Nunito)

## 📱 Responsividade

O site é responsivo e se adapta a diferentes tamanhos de tela, incluindo:
- Desktop
- Tablet
- Mobile

## ⚠️ Nota

Este é um projeto educativo/clone. Todas as imagens e links apontam para o site original da Havan. Este projeto não tem fins comerciais.



