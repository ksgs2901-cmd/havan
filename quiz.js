const quizQuestions = [
    {
        question: 'Com que frequência você compra na Havan?',
        options: ['Esta é minha primeira compra', 'Algumas vezes por ano', 'Pelo menos uma vez por mês', 'Sou cliente frequente'],
    },
    {
        question: 'Qual categoria de produtos você mais procura na Havan?',
        options: ['Eletrodomésticos', 'Decoração', 'Cama, Mesa e Banho', 'Utilidades Domésticas', 'Ferramentas', 'Brinquedos'],
    },
    {
        question: 'Como você avalia sua última experiência de compra?',
        options: ['⭐⭐⭐⭐⭐ Excelente', '⭐⭐⭐⭐ Boa', '⭐⭐⭐ Regular', '⭐⭐ Ruim', '⭐ Muito Ruim'],
    },
    {
        question: 'O que mais influencia sua decisão de compra?',
        options: ['Preço', 'Promoções', 'Qualidade', 'Variedade de produtos', 'Atendimento'],
    },
    {
        question: 'Em qual faixa etária você se enquadra?',
        options: ['18–24 anos', '25–34 anos', '35–44 anos', '45–54 anos', '55 anos ou mais'],
    },
];

const prizePool = [
    { code: 'HAVAN10', label: '10% OFF', desc: '10% de desconto em qualquer compra' },
    { code: 'HAVAN15', label: '15% OFF', desc: '15% de desconto em qualquer compra' },
    { code: 'HAVAN20', label: '20% OFF', desc: '20% de desconto em qualquer compra' },
    { code: 'HAVANFRETE', label: 'Frete Grátis', desc: 'Frete grátis em qualquer compra' },
];

const introScreen = document.querySelector('[data-screen="intro"]');
const questionScreen = document.querySelector('[data-screen="question"]');
const resultScreen = document.querySelector('[data-screen="result"]');
const startBtn = document.querySelector('.quiz-start-btn');
const progressFill = document.querySelector('.quiz-progress-fill');
const stepCurrentEl = document.querySelector('.quiz-step-current');
const stepTotalEl = document.querySelector('.quiz-step-total');
const questionEl = document.querySelector('.quiz-question');
const optionsEl = document.querySelector('.quiz-options');

let currentQuestion = 0;

function showScreen(screen) {
    [introScreen, questionScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function renderQuestion() {
    const q = quizQuestions[currentQuestion];
    progressFill.style.width = `${(currentQuestion / quizQuestions.length) * 100}%`;
    stepCurrentEl.textContent = currentQuestion + 1;
    stepTotalEl.textContent = quizQuestions.length;
    questionEl.textContent = q.question;

    optionsEl.innerHTML = '';
    q.options.forEach(option => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => selectAnswer(option));
        optionsEl.appendChild(btn);
    });
}

function selectAnswer(option) {
    const isLast = currentQuestion === quizQuestions.length - 1;
    if (isLast) {
        finishQuiz();
        return;
    }
    currentQuestion++;
    renderQuestion();
}

function finishQuiz() {
    progressFill.style.width = '100%';
    const prize = prizePool[Math.floor(Math.random() * prizePool.length)];

    try {
        localStorage.setItem('havan_coupon', JSON.stringify({ code: prize.code, label: prize.label, ts: Date.now() }));
    } catch (e) {
        // localStorage indisponível (modo privado etc.) - segue sem salvar
    }

    showScreen(resultScreen);
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        currentQuestion = 0;
        renderQuestion();
        showScreen(questionScreen);
    });
}
