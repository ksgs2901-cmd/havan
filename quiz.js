const quizQuestions = [
    {
        category: 'Sua relação com a Havan',
        question: 'Com que frequência você compra na Havan?',
        hint: 'Queremos entender o seu perfil de cliente.',
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
        options: [
            { text: 'Excelente', icon: '⭐⭐⭐⭐⭐' },
            { text: 'Boa', icon: '⭐⭐⭐⭐' },
            { text: 'Regular', icon: '⭐⭐⭐' },
            { text: 'Ruim', icon: '⭐⭐' },
            { text: 'Muito ruim', icon: '⭐' },
        ],
    },
    {
        category: 'Momento da compra',
        question: 'O que mais pesa na sua decisão de compra?',
        hint: 'Escolha o fator que mais influencia você.',
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
        options: [
            { text: '18 a 24 anos', icon: '1' },
            { text: '25 a 34 anos', icon: '2' },
            { text: '35 a 44 anos', icon: '3' },
            { text: '45 a 54 anos', icon: '4' },
            { text: '55 anos ou mais', icon: '5' },
        ],
    },
];

const prizePool = [
    { code: 'HAVAN10', label: '10% OFF', desc: '10% de desconto no produto escolhido' },
    { code: 'HAVAN15', label: '15% OFF', desc: '15% de desconto no produto escolhido' },
    { code: 'HAVAN20', label: '20% OFF', desc: '20% de desconto no produto escolhido' },
    { code: 'HAVANFRETE', label: 'Frete Grátis', desc: 'Frete grátis no produto escolhido' },
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
const prizeValueEl = document.getElementById('quizPrizeValue');
const prizeDescEl = document.getElementById('quizPrizeDesc');
const prizeCodeEl = document.getElementById('quizPrizeCode');

let currentQuestion = 0;
let isTransitioning = false;

function showScreen(screen) {
    [introScreen, questionScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    renderProgressDots();

    if (!optionsEl) return;
    optionsEl.innerHTML = '';
    optionsEl.hidden = false;

    q.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `
            <span class="quiz-option-icon" aria-hidden="true">${option.icon}</span>
            <span class="quiz-option-text">${option.text}</span>
            <span class="quiz-option-arrow" aria-hidden="true">›</span>
        `;
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
    if (progressFill) progressFill.style.width = '100%';
    if (stepPercentEl) stepPercentEl.textContent = '100%';
    if (analyzingEl) analyzingEl.hidden = false;

    setTimeout(finishQuiz, 1400);
}

function finishQuiz() {
    const prize = prizePool[Math.floor(Math.random() * prizePool.length)];

    try {
        localStorage.setItem('havan_coupon', JSON.stringify({ code: prize.code, label: prize.label, ts: Date.now() }));
        localStorage.setItem('havan_prize_pending', '1');
    } catch (e) {
        // localStorage indisponível
    }

    if (prizeValueEl) prizeValueEl.textContent = prize.label;
    if (prizeDescEl) prizeDescEl.textContent = prize.desc;
    if (prizeCodeEl) prizeCodeEl.textContent = 'Código: ' + prize.code;

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
