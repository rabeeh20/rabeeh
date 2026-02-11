/* ============================================================
   ELECTRONICS ENGINEER PORTFOLIO — Interactive Engine
   ============================================================ */

// ---- Circuit Board Canvas Animation ----
class CircuitCanvas {
    constructor() {
        this.canvas = document.getElementById('circuit-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Create grid nodes
        const spacing = 120;
        const cols = Math.ceil(this.canvas.width / spacing) + 1;
        const rows = Math.ceil(this.canvas.height / spacing) + 1;
        this.nodes = [];

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                // Add randomized offset for organic feel
                const x = i * spacing + (Math.random() - 0.5) * 40;
                const y = j * spacing + (Math.random() - 0.5) * 40;
                this.nodes.push({
                    x, y,
                    baseX: x,
                    baseY: y,
                    radius: Math.random() * 1.5 + 0.5,
                    pulse: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.005
                });
            }
        }

        // Create connections between nearby nodes
        this.connections = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < spacing * 1.5 && Math.random() > 0.5) {
                    this.connections.push({
                        from: i,
                        to: j,
                        opacity: Math.random() * 0.15 + 0.03
                    });
                }
            }
        }

        // Create moving particles (electrons)
        this.particles = [];
        for (let i = 0; i < 15; i++) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        if (this.connections.length === 0) return;
        const connIdx = Math.floor(Math.random() * this.connections.length);
        const conn = this.connections[connIdx];
        this.particles.push({
            connIdx,
            progress: 0,
            speed: Math.random() * 0.008 + 0.003,
            size: Math.random() * 2 + 1,
            color: Math.random() > 0.5 ? '#00f3ff' : '#bc13fe'
        });
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawNode(node) {
        const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
        const opacity = 0.2 + pulse * 0.3;

        // Mouse proximity glow
        const dx = this.mouse.x - node.x;
        const dy = this.mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - dist / 200);

        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, node.radius + mouseInfluence * 3, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 243, 255, ${opacity + mouseInfluence * 0.5})`;
        this.ctx.fill();

        if (mouseInfluence > 0.3) {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 243, 255, ${mouseInfluence * 0.15})`;
            this.ctx.fill();
        }
    }

    drawConnection(conn) {
        const from = this.nodes[conn.from];
        const to = this.nodes[conn.to];

        // Mouse proximity
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = this.mouse.x - midX;
        const dy = this.mouse.y - midY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = Math.max(0, 1 - dist / 250);

        this.ctx.beginPath();
        // Draw as right-angle traces (circuit board style)
        const midPointX = from.x + (to.x - from.x) * 0.5;
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(midPointX, from.y);
        this.ctx.lineTo(midPointX, to.y);
        this.ctx.lineTo(to.x, to.y);

        this.ctx.strokeStyle = `rgba(0, 243, 255, ${conn.opacity + mouseInfluence * 0.2})`;
        this.ctx.lineWidth = 0.5 + mouseInfluence;
        this.ctx.stroke();
    }

    drawParticle(particle) {
        const conn = this.connections[particle.connIdx];
        if (!conn) return;
        const from = this.nodes[conn.from];
        const to = this.nodes[conn.to];

        const midPointX = from.x + (to.x - from.x) * 0.5;
        let x, y;
        const p = particle.progress;

        // Follow the right-angle path
        if (p < 0.33) {
            const t = p / 0.33;
            x = from.x + (midPointX - from.x) * t;
            y = from.y;
        } else if (p < 0.66) {
            const t = (p - 0.33) / 0.33;
            x = midPointX;
            y = from.y + (to.y - from.y) * t;
        } else {
            const t = (p - 0.66) / 0.34;
            x = midPointX + (to.x - midPointX) * t;
            y = to.y;
        }

        // Glow
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size + 3, 0, Math.PI * 2);
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size + 3);
        gradient.addColorStop(0, particle.color + '80');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Core
        this.ctx.beginPath();
        this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw connections
        this.connections.forEach(conn => this.drawConnection(conn));

        // Update and draw nodes
        this.nodes.forEach(node => {
            node.pulse += node.speed;
            this.drawNode(node);
        });

        // Update and draw particles
        this.particles.forEach((particle, idx) => {
            particle.progress += particle.speed;
            if (particle.progress >= 1) {
                // Respawn on a random connection
                const connIdx = Math.floor(Math.random() * this.connections.length);
                particle.connIdx = connIdx;
                particle.progress = 0;
                particle.speed = Math.random() * 0.008 + 0.003;
            }
            this.drawParticle(particle);
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ---- Navbar Scroll Effect ----
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        // Scrolled state
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active section tracking
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    });

    // Smooth scroll on nav click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ---- Scroll Reveal Animation ----
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.project-card, .skill-bar-card, .info-block, .terminal-window, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ---- Skill Bars Animation ----
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const skillPercents = document.querySelectorAll('.skill-percent');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth + '%';
                bar.classList.add('active');

                // Animate percentage counter
                const card = bar.closest('.skill-bar-card');
                const percentEl = card.querySelector('.skill-percent');
                const target = parseInt(percentEl.getAttribute('data-target'));

                animateCounter(percentEl, 0, target, 1500);

                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => observer.observe(bar));
}

function animateCounter(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (end - start) * eased);
        element.textContent = current + '%';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ---- Contact Form ----
function initContactForm() {
    const form = document.getElementById('contact-form');
    const btn = document.getElementById('transmit-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simulate transmission
        const btnText = btn.querySelector('.btn-text');
        const originalText = btnText.textContent;

        btnText.textContent = '⚡ TRANSMITTING...';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';

        setTimeout(() => {
            btnText.textContent = '✓ TRANSMITTED';
            btn.style.background = 'linear-gradient(135deg, #00ff88, #00f3ff)';

            setTimeout(() => {
                btnText.textContent = originalText;
                btn.style.pointerEvents = '';
                btn.style.opacity = '';
                btn.style.background = '';
                form.reset();
            }, 2000);
        }, 1500);
    });
}

// ---- Project Details Modal ----
function initProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    const closeBtn = modal.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalTags = document.getElementById('modal-tags');
    const projectCards = document.querySelectorAll('.project-card');

    // Open Modal
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            const desc = card.querySelector('p').textContent;
            // Get tags from the card
            const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent);

            // Populate Modal
            modalTitle.textContent = title;
            modalDesc.textContent = desc;

            // Clear and add tags
            modalTags.innerHTML = '';
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.textContent = tag;
                modalTags.appendChild(span);
            });

            // Show Modal
            modal.style.display = 'flex';
            // Trigger reflow
            void modal.offsetWidth;
            modal.classList.add('show');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    // Events
    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
}

// ---- Parallax Floating Elements ----
function initParallax() {
    const elements = document.querySelectorAll('.float-element');

    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;

        elements.forEach((el, i) => {
            const speed = (i + 1) * 5;
            const offsetX = x * speed;
            const offsetY = y * speed;
            el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    });
}

// ---- Typewriter Effect for Terminal ----
function initTerminal() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    // Blinking cursor is CSS-animated
    // Optional: add typing effect to terminal lines
    const terminalLines = document.querySelectorAll('.terminal-line');
    terminalLines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateX(-10px)';
        line.style.transition = `all 0.4s ease ${i * 0.3 + 0.5}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                terminalLines.forEach(line => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateX(0)';
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const terminalWindow = document.querySelector('.terminal-window');
    if (terminalWindow) observer.observe(terminalWindow);
}

// ---- CTA Button Ripple Effect ----
function initCTAEffects() {
    const ctaBtn = document.getElementById('cta-btn');
    if (!ctaBtn) return;

    ctaBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// ---- Initialize Everything ----
document.addEventListener('DOMContentLoaded', () => {
    new CircuitCanvas();
    initNavbar();
    initScrollReveal();
    initSkillBars();
    initContactForm();
    initProjectModal();
    initParallax();
    initTerminal();
    initCTAEffects();

    console.log('%c⚡ SYSTEM ONLINE', 'color: #00f3ff; font-family: Orbitron; font-size: 20px; text-shadow: 0 0 10px #00f3ff;');
    console.log('%c Electronics Engineer Portfolio v1.0', 'color: #8899aa; font-size: 12px;');
});
