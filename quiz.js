const quizQuestions = [
    {
        category: 'Sua relação com a Havan',
        question: 'Com que frequência você compra na Havan?',
        hint: 'Queremos entender o seu perfil de cliente.',
        image: 'https://www.havan.com.br/media/catalog/product/cache/820af7facfa7aca6eb3c138e3457dc8d/n/o/notebook-lenovo-celeron-n4500-4gb-128gb-ssd-15-6-w11_1196057.webp',
        options: [
            { text: 'Esta é minha primeira compra', icon: '🛍️' },
            { text: 'Algumas vezes por ano', icon: '📅' },
            { text: 'Pelo menos uma vez por mês', icon: '⭐' },
            { text: 'Sou cliente frequente', icon: '💙' },
        ],
    },
    {
        category: 'Preferências de compra',
        question: 'Qual departamento você mais procura na Havan?',
        hint: 'Selecione a categoria que mais combina com você.',
        image: 'https://www.havan.com.br/media/catalog/product/cache/820af7facfa7aca6eb3c138e3457dc8d/s/m/smartphone-motorola-edge-60-fusion-5g-256gb-8gb_1227039.jpg',
        options: [
            { text: 'Celulares e Eletrônicos', icon: '📱' },
            { text: 'Eletrodomésticos', icon: '🔌' },
            { text: 'Cama, Mesa e Banho', icon: '🛏️' },
            { text: 'Moda e Acessórios', icon: '👕' },
            { text: 'Utilidades e Ferramentas', icon: '🔧' },
            { text: 'Brinquedos e Lazer', icon: '🎮' },
        ],
    },
    {
        category: 'Experiência Havan',
        question: 'Como você avalia a experiência de comprar na Havan?',
        hint: 'Sua avaliação nos ajuda a melhorar cada detalhe.',
        image: null,
        options: [
            { text: 'Excelente', stars: 5 },
            { text: 'Boa', stars: 4 },
            { text: 'Regular', stars: 3 },
            { text: 'Ruim', stars: 2 },
            { text: 'Muito ruim', stars: 1 },
        ],
    },
    {
        category: 'Momento da compra',
        question: 'O que mais pesa na sua decisão de compra?',
        hint: 'Escolha o fator que mais influencia você.',
        image: 'https://www.havan.com.br/media/catalog/product/cache/820af7facfa7aca6eb3c138e3457dc8d/f/r/fritadeira-air-fryer-eletrica-wap-10-litros-12-em-1-barbecue_1288733_1.jpg',
        options: [
            { text: 'Preço e condição de pagamento', icon: '💰' },
            { text: 'Promoções e liquidações', icon: '🏷️' },
            { text: 'Qualidade do produto', icon: '✨' },
            { text: 'Variedade e praticidade', icon: '🏬' },
            { text: 'Atendimento e confiança', icon: '🤝' },
        ],
    },
    {
        category: 'Última pergunta',
        question: 'Qual é a sua faixa etária?',
        hint: 'Estamos quase lá — falta só esta resposta.',
        image: 'https://www.havan.com.br/media/catalog/product/cache/820af7facfa7aca6eb3c138e3457dc8d/c/o/console-playstation-5-sony-1tb-disk-bundle-astro-bot-e-gran-turismo-7_1215790.jpg',
        options: [
            { text: '18 a 24 anos', icon: '1' },
            { text: '25 a 34 anos', icon: '2' },
            { text: '35 a 44 anos', icon: '3' },
            { text: '45 a 54 anos', icon: '4' },
            { text: '55 anos ou mais', icon: '5' },
        ],
    },
];

const introScreen = document.querySelector('[data-screen="intro"]');
const questionScreen = document.querySelector('[data-screen="question"]');
const resultScreen = document.querySelector('[data-screen="result"]');
const startBtn = document.querySelector('.quiz-start-btn');
const progressFill = document.querySelector('.quiz-progress-fill');
const stepCurrentEl = document.querySelector('.quiz-step-current');
const stepTotalEl = document.querySelector('.quiz-step-total');
const stepPercentEl = document.querySelector('.quiz-step-percent');
const categoryEl = document.getElementById('quizQuestionCategory');
const questionEl = document.getElementById('quizQuestionText');
const hintEl = document.getElementById('quizQuestionHint');
const optionsEl = document.getElementById('quizOptions');
const progressDotsEl = document.getElementById('quizProgressDots');
const analyzingEl = document.getElementById('quizAnalyzing');
const questionVisualEl = document.getElementById('quizQuestionVisual');
const questionVisualImg = document.getElementById('quizQuestionVisualImg');
let currentQuestion = 0;
let isTransitioning = false;

function showScreen(screen) {
    [introScreen, questionScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderOptionVisual(option) {
    if (option.stars) {
        const filled = '★'.repeat(option.stars);
        const empty = '☆'.repeat(5 - option.stars);
        return `<span class="quiz-option-visual quiz-option-visual--stars" aria-hidden="true"><span class="quiz-option-stars">${filled}${empty}</span></span>`;
    }
    if (!option.icon) return '';
    const numeric = /^\d+$/.test(option.icon);
    return `<span class="quiz-option-icon${numeric ? ' quiz-option-icon--number' : ''}" aria-hidden="true">${option.icon}</span>`;
}

function renderProgressDots() {
    if (!progressDotsEl) return;
    progressDotsEl.innerHTML = '';
    quizQuestions.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'quiz-progress-dot';
        if (index < currentQuestion) dot.classList.add('completed');
        if (index === currentQuestion) dot.classList.add('active');
        progressDotsEl.appendChild(dot);
    });
}

function renderQuestion() {
    const q = quizQuestions[currentQuestion];
    const progress = Math.round((currentQuestion / quizQuestions.length) * 100);

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (stepCurrentEl) stepCurrentEl.textContent = currentQuestion + 1;
    if (stepTotalEl) stepTotalEl.textContent = quizQuestions.length;
    if (stepPercentEl) stepPercentEl.textContent = `${progress}%`;
    if (categoryEl) categoryEl.textContent = q.category;
    if (questionEl) questionEl.textContent = q.question;
    if (hintEl) hintEl.textContent = q.hint;

    if (questionVisualEl && questionVisualImg) {
        if (q.image) {
            questionVisualImg.src = q.image;
            questionVisualImg.alt = q.category;
            questionVisualEl.hidden = false;
        } else {
            questionVisualEl.hidden = true;
        }
    }

    renderProgressDots();

    if (!optionsEl) return;
    optionsEl.innerHTML = '';
    optionsEl.hidden = false;

    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn quiz-option-btn--card';
        if (option.stars) {
            btn.classList.add('quiz-option-btn--stars');
        } else {
            btn.classList.add('quiz-option-btn--icon');
        }
        btn.innerHTML = `
            ${renderOptionVisual(option)}
            <span class="quiz-option-text">${option.text}</span>
        `;
        if (q.options.length % 2 === 1 && index === q.options.length - 1) {
            btn.classList.add('quiz-option-btn--wide');
        }
        btn.addEventListener('click', () => selectAnswer(btn));
        optionsEl.appendChild(btn);
    });

    if (analyzingEl) analyzingEl.hidden = true;
}

function selectAnswer(button) {
    if (isTransitioning) return;
    isTransitioning = true;

    button.classList.add('selected');
    optionsEl.querySelectorAll('.quiz-option-btn').forEach((btn) => {
        if (btn !== button) btn.disabled = true;
    });

    const isLast = currentQuestion === quizQuestions.length - 1;

    setTimeout(() => {
        if (isLast) {
            showAnalyzingThenFinish();
            return;
        }
        currentQuestion++;
        renderQuestion();
        isTransitioning = false;
    }, 350);
}

function showAnalyzingThenFinish() {
    if (optionsEl) optionsEl.hidden = true;
    if (categoryEl) categoryEl.textContent = '';
    if (questionEl) questionEl.textContent = '';
    if (hintEl) hintEl.textContent = '';
    if (questionVisualEl) questionVisualEl.hidden = true;
    if (progressFill) progressFill.style.width = '100%';
    if (stepPercentEl) stepPercentEl.textContent = '100%';
    if (analyzingEl) analyzingEl.hidden = false;

    setTimeout(finishQuiz, 1400);
}

function finishQuiz() {
    try {
        localStorage.setItem('havan_quiz_completed', '1');
        localStorage.setItem('havan_prize_pending', '1');
        localStorage.removeItem('havan_coupon');
    } catch (e) {
        // localStorage indisponível
    }

    isTransitioning = false;
    showScreen(resultScreen);
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        currentQuestion = 0;
        isTransitioning = false;
        renderQuestion();
        showScreen(questionScreen);
    });
}

if (stepTotalEl) stepTotalEl.textContent = quizQuestions.length;
