// --- 0. PRELOADER ---
window.addEventListener('load', function () {
    setTimeout(function () {
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.innerText = '> spatial matrix compiled. entering core.';
        setTimeout(function () {
            const preloader = document.getElementById('preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                setTimeout(() => preloader.style.display = 'none', 800);
            }
        }, 800);
    }, 1000);
    
    const dateEl = document.getElementById('term-date');
    if(dateEl) dateEl.innerText = new Date().toString().split(' ').slice(0, 5).join(' ');
});

// --- 1. SYSTEM TERMINAL (HERO) ---
class SystemTerminal {
    constructor() {
        this.logsContainer = document.getElementById('terminal-logs');
        this.logQueue = [];
        this.isProcessing = false;
        this.maxLogs = 10; 
        
        setTimeout(() => this.pushLog('SYS', 'Booting RK_OS kernel v4.2...'), 1800);
        setTimeout(() => this.pushLog('NET', 'Establishing secure wss:// connection...'), 2400);
        setTimeout(() => this.pushLog('SYS', 'Mounting volume /user/ritesh/portfolio... OK'), 3000);
    }

    pushLog(type, message) {
        if(!this.logsContainer) return;
        const now = new Date();
        const timeStr = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
        
        this.logQueue.push({ type, message, timeStr });
        if (!this.isProcessing) this.processQueue();
    }

    async processQueue() {
        this.isProcessing = true;
        while (this.logQueue.length > 0) {
            const log = this.logQueue.shift();
            this.renderLog(log);
            await new Promise(r => setTimeout(r, 200)); 
        }
        this.isProcessing = false;
    }

    renderLog(log) {
        const typeClass = `log-${log.type.toLowerCase()}`;
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerHTML = `
            <span class="log-time">${log.timeStr}</span>
            <span class="${typeClass}">[${log.type}]</span>
            <span class="log-msg">${log.message}</span>
        `;
        this.logsContainer.appendChild(div);

        const termBody = document.getElementById('terminal-body');
        termBody.scrollTop = termBody.scrollHeight;

        if(this.logsContainer.children.length > this.maxLogs) {
            this.logsContainer.removeChild(this.logsContainer.firstChild);
        }
    }
}
const sysTerminal = new SystemTerminal();

document.querySelectorAll('.interactive').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        document.body.classList.add('cursor-hover');
        const action = e.currentTarget.getAttribute('data-action');
        if(action) sysTerminal.pushLog('USER', `Target locked: <span class="text-neon-cyan font-bold">${action}</span>`);
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
    el.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        if(action) sysTerminal.pushLog('SYS', `Executing protocol: <span class="text-neon-pink font-bold">${action}</span>`);
    });
});

// --- 2. ADVANCED LERP CURSOR & SPOTLIGHT ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let dotX = mouseX, dotY = mouseY;
let outlineX = mouseX, outlineY = mouseY;

window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX; 
    mouseY = e.clientY;
    
    // Spotlight for premium glass cards
    document.querySelectorAll('.glass-premium').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; 
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

function animateCursor() {
    // Lerp formulation for buttery smooth feeling
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    outlineX += (mouseX - outlineX) * 0.12;
    outlineY += (mouseY - outlineY) * 0.12;

    if (cursorDot && cursorOutline) {
        cursorDot.style.transform = `translate(${dotX - 2}px, ${dotY - 2}px)`; 
        cursorOutline.style.transform = `translate(${outlineX - 18}px, ${outlineY - 18}px)`; 
    }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// --- 3. NEURAL CANVAS BACKGROUND ---
const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isDarkMode = document.documentElement.classList.contains('dark');
let particleColor = isDarkMode ? 'rgba(0, 229, 255,' : 'rgba(2, 132, 199,';

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color + '0.8)';
        ctx.fill();
    }
    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        // Subtle cursor avoidance/attraction
        let dx = mouseX - this.x;
        let dy = mouseY - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            this.x -= dx * 0.01;
            this.y -= dy * 0.01;
        }

        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function initCanvas() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 12000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1) - 0.5;
        let directionY = (Math.random() * 1) - 0.5;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, particleColor));
    }
}

function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance / 20000);
                ctx.strokeStyle = particleColor + opacityValue + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

function animateCanvas() {
    requestAnimationFrame(animateCanvas);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

window.addEventListener('resize', () => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    initCanvas();
});

initCanvas();
animateCanvas();

// --- 4. EASTER EGG TERMINAL ---
const easterTerminal = document.getElementById('easter-terminal');
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('term-output');

window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        if (easterTerminal.classList.contains('active')) {
            easterTerminal.classList.remove('active');
        } else {
            easterTerminal.classList.add('active');
            setTimeout(() => termInput.focus(), 100);
        }
    }
    if (e.key === 'Escape' && easterTerminal.classList.contains('active')) {
        easterTerminal.classList.remove('active');
    }
});

if (termInput) {
    termInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            const cmd = this.value.trim().toLowerCase();
            this.value = '';

            termOutput.innerHTML += `\n<span style="color:rgb(var(--neon-pink))">root@ritesh-sys:~#</span> <span style="color:rgb(var(--color-text-main))">${cmd}</span>\n`;

            if (cmd === 'help') {
                termOutput.innerHTML += `AVAILABLE COMMANDS:\n- about: Display bio\n- skills: List tech stack\n- sudo rm -rf /: [RESTRICTED]\n- clear: Clear terminal\n- exit: Close terminal`;
            } else if (cmd === 'about') {
                termOutput.innerHTML += `Initiating bio retrieval...\n\n[!] Ritesh Kumar is a top-tier AI & ML Engineer based in Earth's sector.\nStatus: ONLINE AND READY FOR DEPLOYMENT.`;
            } else if (cmd === 'skills') {
                termOutput.innerHTML += `> Python, TensorFlow, PyTorch, SQL, Pandas, NLP, Data Structures, Web Dev, React, GSAP, C++`;
            } else if (cmd === 'clear') {
                termOutput.innerHTML = `LOGIN SUCCESSFUL.\nWELCOME TO THE RITESH.OS BACKDOOR.\n            TYPE 'help' FOR A LIST OF COMMANDS.\n            PRESS '~' OR 'ESC' TO EXIT.`;
            } else if (cmd === 'exit') {
                easterTerminal.classList.remove('active');
            } else if (cmd === 'sudo rm -rf /') {
                termOutput.innerHTML += `<span style="color:red">[ERROR] ACCESS DENIED. YOU ARE NOT THE SYSTEM ARCHITECT.</span>`;
            } else if (cmd !== '') {
                termOutput.innerHTML += `Command not recognized: ${cmd}`;
            }
            termOutput.scrollTop = termOutput.scrollHeight;
        }
    });
}

// --- 5. THEME TOGGLE LOGIC ---
const themeToggleBtnDesktop = document.getElementById('theme-toggle-desktop');
const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    sysTerminal.pushLog('WARN', `Theme override. Material set to: ${isDark ? 'DARK' : 'LIGHT'}`);
    
    // Update Canvas Particles
    particleColor = isDark ? 'rgba(0, 229, 255,' : 'rgba(2, 132, 199,';
    particlesArray.forEach(p => p.color = particleColor);
}

themeToggleBtnDesktop.addEventListener('click', toggleTheme);
themeToggleBtnMobile.addEventListener('click', toggleTheme);

if (localStorage.theme === 'light' || (!('theme' in localStorage) && !window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.remove('dark');
    particleColor = 'rgba(2, 132, 199,';
} else {
    document.documentElement.classList.add('dark');
    particleColor = 'rgba(0, 229, 255,';
}

// --- 6. EXTERNAL LIBRARIES & MARQUEE ---
if (window.AOS) AOS.init({ duration: 1200, once: true, offset: 80, easing: 'ease-out-cubic' });
if (window.Typed) {
    new Typed('#typed', {
        strings: ['Intelligent Pipelines.', 'Computer Vision Models.', 'Autonomous Agents.', 'Deep Neural Networks.', 'Next-Gen Architectures.'],
        typeSpeed: 50, backSpeed: 30, loop: true, cursorChar: '_'
    });
}

document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;
        if (window.gsap) gsap.to(this, { x: x*0.3, y: y*0.3, duration: 0.3, ease: "power2.out" });
    });
    btn.addEventListener('mouseleave', function () {
        if (window.gsap) gsap.to(this, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    });
});

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    const icon = mobileMenuBtn.querySelector('i');
    if(mobileMenu.classList.contains('hidden')) {
        icon.classList.replace('fa-times', 'fa-bars');
    } else {
        icon.classList.replace('fa-bars', 'fa-times');
    }
});

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
    });
});

if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const marquee = document.querySelector('.marquee-content');
    if (marquee) {
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            marquee.style.animationDuration = '12s'; 
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => { marquee.style.animationDuration = '35s'; }, 150);
        });
    }
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('senderName').value;
        const email = document.getElementById('senderEmail').value;
        const message = document.getElementById('senderMessage').value;
        const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:riteshkumarnew369@gmail.com?subject=${subject}&body=${body}`;
    });
}