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

### Opção 1 — Um clique (recomendado)

**Windows:** clique duas vezes em `iniciar-site.bat`  
**Mac/Linux:** execute `./iniciar-site.sh`

O navegador abre automaticamente em `http://localhost:3000`. Mantenha a janela aberta enquanto usa a loja.

### Opção 2 — Hospedagem com PHP (Hostinger, Locaweb, etc.)

1. Envie todos os arquivos para a hospedagem
2. Copie `.env.example` para `.env` e configure `BLACKCAT_SECRET_KEY`
3. O checkout Pix funciona via `api/pix/*.php` automaticamente

### Opção 3 — Terminal

```bash
npm start
```

Acesse `http://localhost:3000`

**Importante:** não abra o `index.html` direto no navegador — o Pix precisa do servidor.

### Deploy na Vercel (recomendado)

Repositório: **https://github.com/ksgs2901-cmd/havan**

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **Add New → Project**
3. Importe o repositório `ksgs2901-cmd/havan`
4. Em **Environment Variables**, adicione (obrigatório):
   - `BLACKCAT_SECRET_KEY` = sua chave `sk_live_...`
   - `BLACKCAT_PUBLIC_KEY` = sua chave `pk_live_...` (opcional)
5. Clique em **Deploy**

> **Importante:** sem a variável `BLACKCAT_SECRET_KEY`, o checkout Pix não funciona.

### Deploy no Render (alternativa)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ksgs2901-cmd/havan)

1. Clique no botão acima
2. Adicione `BLACKCAT_SECRET_KEY` nas variáveis de ambiente
3. Deploy — URL em `https://havan-loja.onrender.com`

## 📁 Estrutura de Arquivos

```
havan-clone/
├── index.html          # Página principal
├── checkout.html       # Checkout com Pix
├── checkout.js         # Lógica do checkout e integração Pix
├── styles.css          # Estilos CSS completos
├── script.js           # JavaScript para interatividade
├── api/                # Serverless functions (Vercel)
│   ├── health.js
│   └── pix/
│       ├── create.js
│       └── status/[paymentId].js
├── vercel.json         # Configuração Vercel
└── README.md           # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- Node.js + Express (API Pix)
- BlackCat API (pagamentos Pix)
- Google Fonts (Nunito)

## 📱 Responsividade

O site é responsivo e se adapta a diferentes tamanhos de tela, incluindo:
- Desktop
- Tablet
- Mobile

## ⚠️ Nota

Este é um projeto educativo/clone. Todas as imagens e links apontam para o site original da Havan. Este projeto não tem fins comerciais.



