// ===== Cursor glow =====
const cursorGlow = document.createElement('div');
cursorGlow.classList.add('cursor-glow');
document.body.appendChild(cursorGlow);

let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorGlow.style.left = mouseX + 'px';
  cursorGlow.style.top = mouseY + 'px';
});

// ===== Floating particles with mouse interaction =====
const canvas = document.createElement('canvas');
canvas.id = 'particles';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const particles = [];
const PARTICLE_COUNT = 90;
const COLORS = [
  [124, 58, 237],
  [6, 182, 212],
  [236, 72, 153],
  [167, 139, 250],
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.35 + 0.05,
    color,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.01 + Math.random() * 0.02,
  });
}

const shootingStars = [];
function spawnShootingStar() {
  shootingStars.push({
    x: Math.random() * canvas.width,
    y: 0,
    vx: (Math.random() - 0.3) * 4,
    vy: 2 + Math.random() * 3,
    life: 1,
    decay: 0.01 + Math.random() * 0.01,
    length: 30 + Math.random() * 50,
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.005) spawnShootingStar();

  for (let s = shootingStars.length - 1; s >= 0; s--) {
    const star = shootingStars[s];
    star.x += star.vx;
    star.y += star.vy;
    star.life -= star.decay;
    if (star.life <= 0) { shootingStars.splice(s, 1); continue; }
    const gradient = ctx.createLinearGradient(
      star.x, star.y,
      star.x - star.vx * star.length / 3,
      star.y - star.vy * star.length / 3
    );
    gradient.addColorStop(0, `rgba(167, 139, 250, ${star.life * 0.6})`);
    gradient.addColorStop(1, `rgba(167, 139, 250, 0)`);
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(star.x - star.vx * star.length / 3, star.y - star.vy * star.length / 3);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  particles.forEach(p => {
    const dx = p.x - mouseX;
    const dy = p.y - (mouseY + window.scrollY);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150 && dist > 0) {
      const force = (150 - dist) / 150 * 0.5;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }
    p.vx *= 0.99;
    p.vy *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;
    p.pulse += p.pulseSpeed;
    const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentOpacity})`;
    ctx.fill();
    if (p.size > 1.5) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${currentOpacity * 0.1})`;
      ctx.fill();
    }
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        const alpha = 0.06 * (1 - dist / 130);
        const c = particles[i].color;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ===== Neural Network Canvas in Hero =====
const neuralCanvas = document.getElementById('neuralCanvas');
if (neuralCanvas) {
  const nCtx = neuralCanvas.getContext('2d');
  const hero = document.querySelector('.hero');

  function resizeNeural() {
    neuralCanvas.width = hero.offsetWidth;
    neuralCanvas.height = hero.offsetHeight;
  }
  resizeNeural();
  window.addEventListener('resize', resizeNeural);

  // Create neural network nodes in layers
  const layers = [5, 8, 10, 8, 5];
  const nodes = [];
  const totalLayers = layers.length;

  layers.forEach((count, layerIdx) => {
    const x = (neuralCanvas.width * 0.1) + (layerIdx / (totalLayers - 1)) * (neuralCanvas.width * 0.8);
    for (let i = 0; i < count; i++) {
      const y = (neuralCanvas.height * 0.15) + (i / (count - 1 || 1)) * (neuralCanvas.height * 0.7);
      nodes.push({
        x, y, layer: layerIdx,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        baseOpacity: 0.15 + Math.random() * 0.1,
      });
    }
  });

  // Data signals flowing through the network
  const signals = [];
  function spawnSignal() {
    // Pick a random connection
    const startLayer = Math.floor(Math.random() * (totalLayers - 1));
    const startNodes = nodes.filter(n => n.layer === startLayer);
    const endNodes = nodes.filter(n => n.layer === startLayer + 1);
    const from = startNodes[Math.floor(Math.random() * startNodes.length)];
    const to = endNodes[Math.floor(Math.random() * endNodes.length)];
    if (from && to) {
      signals.push({
        fromX: from.x, fromY: from.y,
        toX: to.x, toY: to.y,
        progress: 0,
        speed: 0.01 + Math.random() * 0.02,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  function drawNeural() {
    nCtx.clearRect(0, 0, neuralCanvas.width, neuralCanvas.height);

    // Draw connections between adjacent layers
    let layerStart = 0;
    for (let l = 0; l < totalLayers - 1; l++) {
      const currCount = layers[l];
      const nextCount = layers[l + 1];
      const nextStart = layerStart + currCount;
      for (let i = 0; i < currCount; i++) {
        for (let j = 0; j < nextCount; j++) {
          const a = nodes[layerStart + i];
          const b = nodes[nextStart + j];
          nCtx.beginPath();
          nCtx.moveTo(a.x, a.y);
          nCtx.lineTo(b.x, b.y);
          nCtx.strokeStyle = `rgba(124, 58, 237, 0.04)`;
          nCtx.lineWidth = 0.5;
          nCtx.stroke();
        }
      }
      layerStart += currCount;
    }

    // Draw nodes
    nodes.forEach(n => {
      n.pulse += n.pulseSpeed;
      const op = n.baseOpacity * (0.6 + 0.4 * Math.sin(n.pulse));
      nCtx.beginPath();
      nCtx.arc(n.x, n.y, 3, 0, Math.PI * 2);
      nCtx.fillStyle = `rgba(124, 58, 237, ${op})`;
      nCtx.fill();
      // Glow
      nCtx.beginPath();
      nCtx.arc(n.x, n.y, 8, 0, Math.PI * 2);
      nCtx.fillStyle = `rgba(124, 58, 237, ${op * 0.2})`;
      nCtx.fill();
    });

    // Spawn and draw signals
    if (Math.random() < 0.08) spawnSignal();

    for (let s = signals.length - 1; s >= 0; s--) {
      const sig = signals[s];
      sig.progress += sig.speed;
      if (sig.progress > 1) { signals.splice(s, 1); continue; }
      const x = sig.fromX + (sig.toX - sig.fromX) * sig.progress;
      const y = sig.fromY + (sig.toY - sig.fromY) * sig.progress;
      const c = sig.color;

      // Signal dot
      nCtx.beginPath();
      nCtx.arc(x, y, 2.5, 0, Math.PI * 2);
      nCtx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.8)`;
      nCtx.fill();

      // Signal glow
      nCtx.beginPath();
      nCtx.arc(x, y, 8, 0, Math.PI * 2);
      nCtx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.15)`;
      nCtx.fill();

      // Trail
      const trailX = sig.fromX + (sig.toX - sig.fromX) * Math.max(0, sig.progress - 0.15);
      const trailY = sig.fromY + (sig.toY - sig.fromY) * Math.max(0, sig.progress - 0.15);
      const trailGrad = nCtx.createLinearGradient(trailX, trailY, x, y);
      trailGrad.addColorStop(0, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0)`);
      trailGrad.addColorStop(1, `rgba(${c[0]}, ${c[1]}, ${c[2]}, 0.3)`);
      nCtx.beginPath();
      nCtx.moveTo(trailX, trailY);
      nCtx.lineTo(x, y);
      nCtx.strokeStyle = trailGrad;
      nCtx.lineWidth = 1.5;
      nCtx.stroke();
    }

    requestAnimationFrame(drawNeural);
  }
  drawNeural();
}


// ===== Floating AI keywords =====
const keywordsContainer = document.getElementById('floatingKeywords');
if (keywordsContainer) {
  const keywords = [
    'neural_network()', 'model.train()', 'torch.tensor', 'langchain.RAG',
    'def predict():', 'optimizer.step()', 'loss.backward()', 'embeddings',
    'transformer', 'attention_heads', 'vector_db.query()', 'tokenizer',
    'inference()', 'pipeline.fit()', 'gradient_descent', 'epoch += 1',
    'batch_size=32', 'learning_rate', 'softmax(logits)', 'conv2d',
    'lstm_cell', 'gru_layer', 'dropout(0.3)', 'activation="relu"',
    'import torch', 'from langchain', 'openai.chat()', 'chromadb',
    'async await', 'res.json()', 'docker build', 'go func()',
  ];

  function spawnKeyword() {
    const el = document.createElement('span');
    el.className = 'float-keyword';
    el.textContent = keywords[Math.floor(Math.random() * keywords.length)];
    el.style.left = (Math.random() * 90 + 5) + '%';
    el.style.animationDuration = (15 + Math.random() * 20) + 's';
    el.style.animationDelay = '0s';
    el.style.fontSize = (0.6 + Math.random() * 0.3) + 'rem';

    const colorRoll = Math.random();
    if (colorRoll < 0.4) el.style.color = 'rgba(255, 255, 255, 0.15)';
    else if (colorRoll < 0.7) el.style.color = 'rgba(255, 255, 255, 0.12)';
    else el.style.color = 'rgba(255, 255, 255, 0.10)';

    keywordsContainer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // Initial burst
  for (let i = 0; i < 12; i++) {
    setTimeout(() => spawnKeyword(), i * 800);
  }
  // Continuous spawn
  setInterval(spawnKeyword, 2500);
}

// ===== Role typewriter =====
const roleEl = document.getElementById('typewriterRole');
if (roleEl) {
  const roles = [
    'Lead AI Engineer',
    'AI Software Engineer',
    'Full-Stack Developer',
    'Backend Architect',
    'ML Researcher',
    'GenAI Builder',
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseTimer = 0;

  function typeRole() {
    const current = roles[roleIdx];

    if (!deleting) {
      roleEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        pauseTimer = 60;
        deleting = true;
      }
    } else {
      if (pauseTimer > 0) {
        pauseTimer--;
      } else {
        roleEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          roleIdx = (roleIdx + 1) % roles.length;
        }
      }
    }

    const speed = deleting && pauseTimer === 0 ? 30 : 70;
    setTimeout(typeRole, speed);
  }
  setTimeout(typeRole, 1200);
}

// ===== Skills terminal typing =====
const skillsTyped = document.getElementById('skillsTyped');
if (skillsTyped) {
  const cmd = 'cat skills.json --format=visual --animate';
  const skillsObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let i = 0;
      function typeSkillCmd() {
        if (i < cmd.length) {
          skillsTyped.textContent += cmd.charAt(i);
          i++;
          setTimeout(typeSkillCmd, 40);
        }
      }
      setTimeout(typeSkillCmd, 300);
      skillsObs.unobserve(entries[0].target);
    }
  }, { threshold: 0.2 });
  skillsObs.observe(document.getElementById('skills'));
}

// ===== Contact terminal typing =====
const contactTyped = document.getElementById('contactTyped');
if (contactTyped) {
  const cmd = './connect.sh --open-channels';
  const contactObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      let i = 0;
      function typeContactCmd() {
        if (i < cmd.length) {
          contactTyped.textContent += cmd.charAt(i);
          i++;
          setTimeout(typeContactCmd, 45);
        }
      }
      setTimeout(typeContactCmd, 400);
      contactObs.unobserve(entries[0].target);
    }
  }, { threshold: 0.2 });
  contactObs.observe(document.getElementById('contact'));
}

// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('.section, .hero');
const navAnchors = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
  const scrollPos = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < top + height) {
      navAnchors.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}
window.addEventListener('scroll', updateActiveLink);

// ===== Section reveal on scroll =====
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll('.section').forEach(section => {
  observer.observe(section);
});

// ===== Stat counter animation =====
function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
    const target = +counter.dataset.target;
    const duration = 1800;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      counter.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

const aboutSection = document.getElementById('about');
const counterObserver = new IntersectionObserver(
  entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      counterObserver.unobserve(aboutSection);
    }
  },
  { threshold: 0.3 }
);
counterObserver.observe(aboutSection);

// ===== Tilt effect on cards =====
document.querySelectorAll('.project-card, .stat-card, .skill-category').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) perspective(800px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ===== Typing effect for hero greeting =====
const greeting = document.querySelector('.hero-greeting');
if (greeting) {
  const text = greeting.textContent;
  greeting.textContent = '';
  greeting.style.opacity = '1';
  greeting.style.transform = 'none';
  greeting.style.animation = 'none';
  let i = 0;
  function typeChar() {
    if (i < text.length) {
      greeting.textContent += text.charAt(i);
      i++;
      setTimeout(typeChar, 80);
    }
  }
  setTimeout(typeChar, 400);
}

// ===== Parallax on scroll =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const heroHeight = hero.offsetHeight;
  if (scrollY < heroHeight) {
    const aurora = document.querySelector('.hero-aurora');
    const orb3 = document.querySelector('.hero-orb-3');
    const grid = document.querySelector('.hero-grid-pattern');
    if (aurora) aurora.style.transform = `translateY(${scrollY * 0.3}px)`;
    if (orb3) orb3.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.15}px))`;
    if (grid) grid.style.transform = `translateY(${scrollY * 0.1}px)`;
  }
});

// ===== Magnetic effect on buttons =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

