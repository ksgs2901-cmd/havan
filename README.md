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

### Deploy online (permanente)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ksgs2901-cmd/havan)

1. Clique no botão acima
2. Crie conta gratuita no Render (se não tiver)
3. Adicione a variável `BLACKCAT_SECRET_KEY` com sua chave secreta
4. Clique em **Deploy** — em ~2 min o site fica no ar com URL `*.onrender.com`

## 📁 Estrutura de Arquivos

```
havan-clone/
├── index.html          # Página principal
├── checkout.html       # Checkout com Pix
├── checkout.js         # Lógica do checkout e integração Pix
├── styles.css          # Estilos CSS completos
├── script.js           # JavaScript para interatividade
├── server/             # Backend Node.js (API Pix BlackCat)
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
- BlackCat API (pagamentos Pix)
- Google Fonts (Nunito)

## 📱 Responsividade

O site é responsivo e se adapta a diferentes tamanhos de tela, incluindo:
- Desktop
- Tablet
- Mobile

## ⚠️ Nota

Este é um projeto educativo/clone. Todas as imagens e links apontam para o site original da Havan. Este projeto não tem fins comerciais.



