// ===== Scroll Animation Observer =====
function initScrollAnimations() {
  const revealElements = document.querySelectorAll(".card, .hero-card");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px",
    }
  );

  revealElements.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

// ===== Animated Counter =====
function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16);
  const counter = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.floor(target) + "+";
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(current) + "+";
    }
  }, 16);
}

// ===== Stats Section Enhancement =====
function enhanceStatsSection() {
  const statNumbers = document.querySelectorAll(".stat-number");
  const statsContainer = document.querySelector(".stats-container");

  if (statsContainer) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target._counterStarted) {
            entry.target._counterStarted = true;
            statNumbers.forEach((el) => {
              const targetValue = parseInt(el.textContent);
              animateCounter(el, targetValue);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(statsContainer);
  }
}

// ===== Dynamic Glow Effect =====
function addGlowEffect() {
  const glovElements = document.querySelectorAll(".highlight, .stat-number");

  glovElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      el.classList.add("deep-glow");
    });
    el.addEventListener("mouseleave", () => {
      el.classList.remove("deep-glow");
    });
  });
}

// ===== Dynamic Glow Effect on cursor movement =====
function cursorGlowEffect() {
  document.addEventListener("mousemove", (e) => {
    const buttons = document.querySelectorAll(".btn");
    buttons.forEach((btn) => {
      const rect = btn.getBoundingClientRect();
      const distance = Math.hypot(
        e.clientX - (rect.left + rect.width / 2),
        e.clientY - (rect.top + rect.height / 2)
      );

      if (distance < 100) {
        btn.style.boxShadow = `0 0 ${40 - distance / 2}px rgba(8, 247, 163, ${
          0.4 - distance / 250
        })`;
      }
    });
  });
}

// ===== Dynamic Gallery Builder =====
function buildDynamicGallery() {
  const container = document.getElementById("gallery-grid");
  if (!container) return;

  // الصور المميزة مع عناوين وأوصاف احترافية
  const featuredImages = [
    {
      src: "images/photo_2025-11-30_18-01-53.jpg",
      title: "🏛️ صرح الدولة العظيم",
      description: "رمز القوة والسيادة - عظمة لا تُضاهى",
    },
    {
      src: "images/photo_2025-11-30_18-01-56.jpg",
      title: "⚔️ حارس الوطن",
      description: "الشجاعة المتجسدة - فخر الأمة ودرعها الحصين",
    },
    {
      src: "images/photo_2025-11-30_18-03-12.jpg",
      title: "🦅 نسر السماء",
      description: "عيون ترصد المجد - حامي حمى الديار",
    },
    {
      src: "images/photo_2025-11-30_18-03-16.jpg",
      title: "🎖️ بطل الأبطال",
      description: "أسطورة حية - يُروى عنه في كل مكان",
    },
    {
      src: "images/photo_2025-11-30_18-03-18.jpg",
      title: "🏆 قائد المجد",
      description: "من صنع التاريخ بيديه - ملهم الأجيال",
    },
    {
      src: "images/photo_2025-11-30_18-03-20.jpg",
      title: "👑 تاج الفخر",
      description: "إرث الأجداد العظام - مجد لا ينتهي",
    },
    {
      src: "images/photo_2025-11-30_18-03-23.jpg",
      title: "🌟 نجم الأمة",
      description: "إشراقة أمل - ضياء يُنير الدرب",
    },
    {
      src: "images/photo_2025-11-30_18-03-26.jpg",
      title: "🔱 رمز العزة",
      description: "شموخ لا يُحنى - كبرياء الوطن",
    },
    {
      src: "images/photo_2025-11-30_18-03-28.jpg",
      title: "⭐ أيقونة الشرف",
      description: "مَن كتب اسمه بحروف من ذهب في سجل الخالدين",
    },
  ];

  const imageFilenames = [
    "akram.gif",
    "akram55.gif",
    "animated1.gif",
    "animated13.gif",
    "animated29.gif",
    "army.gif",
    "cia.gif",
    "gangs.gif",
    "health.gif",
    "heros.gif",
    "Menu.gif",
    "Ministry of Justice.gif",
    "mod.gif",
    "Server.gif",
    "swat1.gif",
    "verifed.gif",
  ];

  // دمج الصور المميزة مع الصور الأخرى
  const regularImages = imageFilenames.map((name) => ({
    src: "images/" + name,
    title: name.replace(/\.[^.]+$/, ""),
    description: "",
  }));

  const allImages = [...featuredImages, ...regularImages];

  if (window.lightbox) {
    window.lightbox.setImages(
      allImages.map((img) => ({ src: img.src, alt: img.title }))
    );
  }

  container.innerHTML = "";

  console.log(
    "Loading gallery with",
    featuredImages.length,
    "featured images and",
    regularImages.length,
    "regular images"
  );

  // إضافة الصور المميزة أولاً بتصميم خاص
  featuredImages.forEach((img, idx) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item featured-item";
    figure.style.cursor = "pointer";
    figure.innerHTML = `
      <div class="featured-badge">⭐ مميز</div>
      <img src="${img.src}" alt="${img.title}" loading="lazy" />
      <figcaption>
        <strong>${img.title}</strong>
        <span class="img-description">${img.description}</span>
      </figcaption>
    `;
    figure.addEventListener("click", () => {
      if (window.lightbox) window.lightbox.open(idx);
    });
    container.appendChild(figure);
  });

  // إضافة الصور العادية
  regularImages.forEach((img, idx) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";
    figure.style.cursor = "pointer";
    figure.innerHTML = `
      <img src="${img.src}" alt="${img.title}" loading="lazy" />
      <figcaption>${img.title}</figcaption>
    `;
    figure.addEventListener("click", () => {
      if (window.lightbox) window.lightbox.open(featuredImages.length + idx);
    });
    container.appendChild(figure);
  });
}

// ===== Toggle Background Button =====
let bgToggleEnabled = true;
const bgToggleBtn = document.getElementById("toggle-bg-btn");
if (bgToggleBtn) {
  bgToggleBtn.addEventListener("click", () => {
    bgToggleEnabled = !bgToggleEnabled;
    bgToggleBtn.classList.toggle("off", !bgToggleEnabled);
    bgToggleBtn.textContent = bgToggleEnabled ? "🔆" : "🔅";
    if (document.body._bgStarted) {
      document.body._bgStarted = false;
      const existingCanvas = document.querySelector(".bg-anim-canvas");
      if (existingCanvas) existingCanvas.remove();
      if (bgToggleEnabled) {
        try {
          startFullscreenBackground();
        } catch (e) {
          /* ignore */
        }
      }
    }
  });
}

// تحديث سنة الفوتر تلقائياً
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Call on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    buildDynamicGallery();
  } catch (e) {
    /* ignore */
  }
});

// =============================
// وضع الهاكر الوهمي (محدث: تأثير كتابة شبيه GeekTyper)
// =============================

const terminal = document.getElementById("terminal-body");
const hotkeysOverlay = document.getElementById("hotkeys-overlay");
const closeHotkeysBtn = document.getElementById("close-hotkeys");
const toggleModeBtn = document.getElementById("toggle-hacker-mode") || null;

let hackerModeEnabled = true;
let typingInProgress = false;

const fakeSnippets = [
  ">>> INIT_SESSION :: OK",
  ">> SCAN_PORTS 21,22,80,443 :: COMPLETE",
  "[LOG] Establishing encrypted tunnel to node 7...",
  "[OK] Connection established (simulation mode).",
  "[TOKEN] MAS0N_",
  "SELECT * FROM secrets WHERE level >= 7;",
  "for (symbol in MASONIC_SYMBOLS) { render(symbol); }",
  "matrix.stream({ speed: 'fast', color: '#08F7A3' });",
  "echo '# FAKE HACKING MODE ENABLED'",
  "[ALERT] Ghost process detected... ignoring (simulation).",
  "const KEY = generateKey(4096); // mock key",
  "Uploading fake payload to hologram://grand_lodge",
  "[TASK] Rendering triangles, eyes, and hidden geometry...",
  "chmod +x run_fake_ritual.sh",
  "node hacker_sim.js --env=simulation",
  'curl -X POST https://api.fake/mason -d \'{"status":"awake"}\'',
  "while(true){ print('001101010'); } // infinite illusion",
  "TRACE: 127.0.0.1 -> 127.0.0.1 (you are the target 😄)",
  "# NOTE: كل ما تكتب أكثر، يطلع وهم أكثر",
];

// نحتفظ بآخر 120 سطر لتمكين التمرير
function setTerminalText(linesArr) {
  if (!terminal) return;
  terminal.textContent = linesArr.join("\n");
  terminal.scrollTop = terminal.scrollHeight;
}

function appendToTerminal(line) {
  if (!terminal) return;
  const current = terminal.textContent || "";
  let lines = current === "" ? [] : current.split("\n");
  // انقسام الأسطر إن احتوى السطر على \n داخلي
  const newLines = line.split("\n");
  lines = lines.concat(newLines);
  if (lines.length > 120) {
    lines = lines.slice(lines.length - 120);
  }
  setTerminalText(lines);
}

// تأثير الكتابة حرفياً
function typeSnippet(snippet, speed = 24) {
  if (!terminal) return Promise.resolve();
  typingInProgress = true;
  return new Promise((resolve) => {
    let i = 0;
    let buffer = "";
    const interval = setInterval(() => {
      buffer += snippet.charAt(i);
      // نعرض السطر المؤقت في آخر السطر
      const current = terminal.textContent || "";
      const lines = current === "" ? [] : current.split("\n");
      lines[lines.length - 1] =
        (lines[lines.length - 1] || "") + snippet.charAt(i);
      setTerminalText(lines);
      i++;
      if (i >= snippet.length) {
        clearInterval(interval);
        appendToTerminal("");
        typingInProgress = false;
        resolve();
      }
    }, speed);
  });
}

// مقدمة بسيطة تُعرض عند فتح الصفحة
if (terminal) {
  const introLines = [
    "[BOOT] Loading fake_hacker_console.exe ...",
    "[INFO] This is a visual simulation only.",
    "[TIP] اضغط أي زر في الكيبورد لعرض الأكواد الوهمية.",
    "[TIP] Tab = قائمة الاختصارات | Esc = مسح | Ctrl+K = تشغيل/إيقاف | Ctrl+F = ملء الشاشة.",
  ];

  let idx = 0;
  function playIntro() {
    if (idx >= introLines.length) return;
    appendToTerminal(introLines[idx]);
    idx++;
    setTimeout(playIntro, 600);
  }
  playIntro();
}

// ===== Matrix background effect for hero =====
function startMatrixInHero() {
  const heroMedia = document.querySelector(".hero-media");
  if (!heroMedia) return;

  // avoid starting twice
  if (heroMedia._matrixStarted) return;
  heroMedia._matrixStarted = true;

  const canvas = document.createElement("canvas");
  canvas.className = "matrix-canvas";
  heroMedia.prepend(canvas);
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = heroMedia.clientWidth;
    canvas.height = heroMedia.clientHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize) + 1;
  const drops = new Array(columns)
    .fill(0)
    .map(() => Math.floor(Math.random() * 20));
  const chars = "01█▓▒░▮▯";

  function draw() {
    if (!ctx) return;
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#08f7a3";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillText(text, x, y);

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    requestAnimationFrame(draw);
  }

  draw();

  // decorative floating symbols
  const floatWrap = document.createElement("div");
  floatWrap.className = "floating-symbols";
  heroMedia.appendChild(floatWrap);
  const symbols = ["⊙", "△", "☷", "✦", "✪", "●", "◆"];
  for (let i = 0; i < 10; i++) {
    const sp = document.createElement("span");
    sp.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sp.style.left = Math.random() * 90 + "%";
    sp.style.top = Math.random() * 80 + "%";
    sp.style.animationDuration = 3 + Math.random() * 6 + "s";
    sp.style.opacity = 0.6 * Math.random();
    floatWrap.appendChild(sp);
  }
}

// start matrix on pages that have hero
// ===== Fullscreen background particles + big-name effect (top-level) =====
function startFullscreenBackground() {
  if (document.body._bgStarted) return;
  document.body._bgStarted = true;

  const canvas = document.createElement("canvas");
  canvas.className = "bg-anim-canvas";
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext("2d");

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  function resizeCanvas() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const isMobile =
    window.innerWidth <= 760 ||
    ("ontouchstart" in window && navigator.maxTouchPoints > 0);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const count = reducedMotion
    ? 20
    : isMobile
    ? Math.min(
        80,
        Math.floor((window.innerWidth * window.innerHeight) / 160000)
      )
    : Math.min(
        140,
        Math.floor((window.innerWidth * window.innerHeight) / 80000)
      );

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
      vy: (Math.random() - 0.5) * (isMobile ? 0.4 : 0.6),
      r: 0.8 + Math.random() * (isMobile ? 1.4 : 2.4),
      alpha: 0.15 + Math.random() * 0.5,
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "rgba(3,10,8,0.06)");
    g.addColorStop(1, "rgba(0,0,0,0.18)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;
      if (p.y < -20) p.y = window.innerHeight + 20;
      if (p.y > window.innerHeight + 20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = "rgba(8,247,163," + p.alpha + ")";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const alpha = 0.15 * (1 - d2 / 12000);
          ctx.strokeStyle = "rgba(8,247,163," + alpha + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  let lastNameAt = 0;
  function drawBigName(now) {
    if (reducedMotion || isMobile) return;
    if (!ctx) return;
    const showEvery = 4500 + Math.random() * 5000;
    if (now - lastNameAt < showEvery) return;
    lastNameAt = now;
    const duration = 1400;
    const start = performance.now();
    function step(t) {
      const p = Math.min(1, (t - start) / duration);
      const text = "منضمة اكرم";
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2.2;
      const maxSize = Math.min(window.innerWidth / 6, 120);
      const size = maxSize * (0.9 + 0.3 * Math.sin(p * Math.PI));
      ctx.font = `700 ${size}px system-ui, Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(8,247,163,${0.05 + 0.6 * (1 - p)})`;
      ctx.fillText(text, centerX - 3 * (1 - p), centerY + 2 * (1 - p));
      ctx.fillStyle = `rgba(0,224,255,${0.06 + 0.5 * (1 - p)})`;
      ctx.fillText(text, centerX + 2 * p, centerY - 2 * p);
      ctx.fillStyle = `rgba(255,255,255,${0.02 + 0.35 * (1 - p)})`;
      ctx.fillText(text, centerX, centerY);
      ctx.restore();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let rafId;
  function loop(now) {
    drawParticles();
    if (Math.random() < (isMobile ? 0.002 : 0.008)) drawBigName(now);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(rafId);
  });
}

// Lazy start: start background only when hero is visible, and respect reduced-motion/mobile
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.getElementById("hero");
  if (!hero) {
    try {
      if (bgToggleEnabled) startFullscreenBackground();
    } catch (e) {
      /* ignore */
    }
    return;
  }
  try {
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (bgToggleEnabled) startFullscreenBackground();
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.12 }
    );
    io.observe(hero);
    setTimeout(() => {
      if (!document.body._bgStarted && bgToggleEnabled)
        startFullscreenBackground();
    }, 6000);
  } catch (e) {
    try {
      if (bgToggleEnabled) startFullscreenBackground();
    } catch (e) {
      /* ignore */
    }
  }
});
document.addEventListener("DOMContentLoaded", () => {
  startMatrixInHero();
});

// Call gallery builder on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    buildDynamicGallery();
  } catch (e) {
    /* ignore */
  }

  // Initialize advanced effects
  try {
    initScrollAnimations();
    enhanceStatsSection();
    addGlowEffect();
    cursorGlowEffect();
  } catch (e) {
    console.log("Advanced effects initialized");
  }
});

function toggleHotkeysOverlay(forceState) {
  if (!hotkeysOverlay) return;
  if (typeof forceState === "boolean") {
    hotkeysOverlay.classList.toggle("active", forceState);
  } else {
    hotkeysOverlay.classList.toggle("active");
  }
}

function updateToggleButtonText() {
  if (!toggleModeBtn) return;
  toggleModeBtn.textContent = hackerModeEnabled
    ? "إيقاف وضع الهاكر مؤقتاً"
    : "تشغيل وضع الهاكر من جديد";
}

if (closeHotkeysBtn) {
  closeHotkeysBtn.addEventListener("click", () => toggleHotkeysOverlay(false));
}

if (toggleModeBtn) {
  toggleModeBtn.addEventListener("click", () => {
    hackerModeEnabled = !hackerModeEnabled;
    updateToggleButtonText();
  });
}

updateToggleButtonText();

// تبديل وضع ملء الشاشة للتيرمنال (Ctrl+F)
function toggleFullscreenMode(force) {
  const is = document.body.classList.toggle(
    "fullscreen-mode",
    typeof force === "undefined"
      ? !document.body.classList.contains("fullscreen-mode")
      : force
  );
  // لإعطاء تركيز للتيرمنال
  if (is) {
    // أضف صنف لعنصر الأب إذا أردنا
    document.documentElement.scrollTop = 0;
  }
  return is;
}

// مستمع عام للكيبورد
document.addEventListener("keydown", async (e) => {
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  // Tab ➜ هوتكيز
  if (e.key === "Tab") {
    e.preventDefault();
    toggleHotkeysOverlay();
    return;
  }

  // Esc ➜ مسح
  if (e.key === "Escape") {
    e.preventDefault();
    if (terminal) terminal.textContent = "";
    return;
  }

  // Ctrl+K ➜ تفعيل/إيقاف
  if (e.ctrlKey && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    hackerModeEnabled = !hackerModeEnabled;
    updateToggleButtonText();
    return;
  }

  // Ctrl+F ➜ ملء الشاشة
  if (e.ctrlKey && (e.key === "f" || e.key === "F")) {
    e.preventDefault();
    toggleFullscreenMode();
    return;
  }

  if (!hackerModeEnabled) return;

  // تجاهل المفاتيح الطويلة ما عدا Enter وSpace
  if (e.key.length > 1 && e.key !== "Enter" && e.key !== " ") return;

  e.preventDefault();

  // اختيار مقطع عشوائي
  const snippetBase =
    fakeSnippets[Math.floor(Math.random() * fakeSnippets.length)];
  const snippet =
    snippetBase.includes("MAS0N_") || snippetBase === "[TOKEN] MAS0N_"
      ? snippetBase + Math.floor(Math.random() * 9999)
      : snippetBase;

  // إذا لم يكن هناك كتابة جارية، نضيف سطر فارغ حتى يكتب عليه المؤثر
  if (
    terminal &&
    (terminal.textContent === "" || terminal.textContent.endsWith("\n"))
  ) {
    appendToTerminal("");
  }

  // اكتب القطعة حرفياً ثم نضيف سطر جديد
  if (!typingInProgress) {
    await typeSnippet(snippet + "\n", 22 + Math.floor(Math.random() * 40));
  }
});

// ===== Profile Widget =====
const API_URL = "https://akram-organization-production.up.railway.app/api";

function loadUserProfile() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("user_id");

  // إذا كان المستخدم مسجل دخول
  if (token && username && userId) {
    fetchUserData(userId, token);
  } else {
    // معلومات اختبارية للعرض عندما تكون غير مسجل دخول
    const testUser = {
      username: "admin",
      full_name: "مسؤول النظام",
      email: "admin@example.com",
      bio: "مسؤول النظام الرئيسي للمنصة",
      created_at: new Date().toISOString(),
      profile_image: null,
    };
    // عرض معلومات الاختبار
    displayUserProfile(testUser);
  }
}

async function fetchUserData(userId, token) {
  try {
    const res = await fetch(`${API_URL}/user/profile`, {
      headers: { Authorization: token },
    });

    if (res.ok) {
      const user = await res.json();
      displayUserProfile(user);
    } else {
      // عند الفشل، عرض معلومات افتراضية
      const testUser = {
        username: "admin",
        full_name: "مسؤول النظام",
        email: "admin@example.com",
        bio: "مسؤول النظام الرئيسي للمنصة",
        created_at: new Date().toISOString(),
        profile_image: null,
      };
      displayUserProfile(testUser);
    }
  } catch (e) {
    console.error("Error loading profile:", e);
    // عند حدوث خطأ، عرض معلومات افتراضية
    const testUser = {
      username: "admin",
      full_name: "أكرم",
      email: "akram@example.com",
      bio: "مرحباً بك في النظام المتقدم",
      created_at: new Date().toISOString(),
      profile_image: null,
    };
    displayUserProfile(testUser);
  }
}

function displayUserProfile(user) {
  const profileContent = document.getElementById("profileContent");
  if (!profileContent) {
    console.error("profileContent element not found!");
    return;
  }

  const avatarEmoji = user.full_name ? user.full_name.charAt(0) : "👤";

  let profileHTML = `
    <div class="profile-header">
      <div class="profile-avatar">
        ${
          user.profile_image && user.profile_image.startsWith("data:")
            ? `<img src="${user.profile_image}" alt="${user.full_name}">`
            : avatarEmoji
        }
      </div>
      <div class="profile-name">${user.full_name || user.username}</div>
      <div class="profile-username">@${user.username}</div>
      <div class="profile-status">✓ نشط الآن</div>
    </div>

    <div class="profile-info">
      <div class="info-item">
        <div class="info-label">📧 البريد</div>
        <div class="info-value email">${user.email}</div>
      </div>

      <div class="info-item">
        <div class="info-label">📝 النبذة</div>
        <div class="info-value">${user.bio || "لا توجد نبذة"}</div>
      </div>

      <div class="info-item">
        <div class="info-label">📅 الانضمام</div>
        <div class="info-value">${new Date(user.created_at).toLocaleDateString(
          "ar-SA"
        )}</div>
      </div>
    </div>

    <div class="profile-actions">
      <button class="profile-action-btn" onclick="window.location.href='dashboard.html'">
        📊 لوحة
      </button>
      <button class="profile-action-btn logout" onclick="logoutUser()">
        ⚠️ خروج
      </button>
    </div>
  `;

  profileContent.innerHTML = profileHTML;
  console.log("Profile displayed:", user.username);
}

function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

// Toggle profile menu - Initialize when DOM is ready
function initProfileWidget() {
  const profileToggle = document.getElementById("profileToggle");
  const profileMenu = document.getElementById("profileMenu");
  const profileContent = document.getElementById("profileContent");

  console.log("🔍 Checking profile elements:");
  console.log("- profileToggle:", profileToggle ? "✅" : "❌");
  console.log("- profileMenu:", profileMenu ? "✅" : "❌");
  console.log("- profileContent:", profileContent ? "✅" : "❌");

  if (!profileToggle || !profileMenu) {
    console.warn("⚠️ Profile elements not found - will retry in 500ms");
    setTimeout(initProfileWidget, 500);
    return;
  }

  // زر الضغط لفتح/إغلاق القائمة
  profileToggle.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const isActive = profileMenu.classList.toggle("active");
    console.log("📋 Profile menu toggled:", isActive ? "OPEN ✅" : "CLOSED ❌");

    // إضافة حد أدنى من الارتفاع للعرض
    if (isActive) {
      profileMenu.style.maxHeight = "700px";
    }
  });

  // إغلاق القائمة عند الضغط خارجها
  document.addEventListener("click", function (e) {
    if (!profileMenu.contains(e.target) && !profileToggle.contains(e.target)) {
      profileMenu.classList.remove("active");
    }
  });

  console.log("✅ Profile widget initialized successfully!");
}

// Load profile on page load
function initializeProfile() {
  console.log("🚀 Initializing profile system...");
  loadUserProfile();
  setTimeout(initProfileWidget, 100);
}

// استدعاء التهيئة
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeProfile);
} else {
  initializeProfile();
}

// تحديث إضافي بعد تحميل الصفحة بالكامل
window.addEventListener("load", function () {
  console.log("📄 Page fully loaded - verifying profile widget");
  const profileMenu = document.getElementById("profileMenu");
  const profileContent = document.getElementById("profileContent");

  if (profileMenu && profileContent && !profileContent.innerHTML.trim()) {
    console.warn("⚠️ Profile content empty - reloading profile");
    loadUserProfile();
  }

  // تحريك الأرقام في قسم الإحصائيات
  animateStats();
});

// ===== Animate Stats Numbers =====
function animateStats() {
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute("data-target"));
        animateNumber(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach((stat) => observer.observe(stat));
}

function animateNumber(element, target) {
  const duration = 2000; // 2 seconds
  const start = 0;
  const increment = target / (duration / 16); // 60fps
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ===== Gallery Page Particles Background =====
function initParticles() {
  const particlesContainer = document.getElementById("particles-bg");
  if (!particlesContainer) return;

  const particleCount = 50;
  const colors = ["#08f7a3", "#00e0ff", "#00ffc8"];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";

    const size = Math.random() * 4 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      left: ${x}%;
      top: ${y}%;
      opacity: ${Math.random() * 0.5 + 0.2};
      animation: particleFloat ${duration}s ${delay}s infinite ease-in-out;
      box-shadow: 0 0 10px ${color};
    `;

    particlesContainer.appendChild(particle);
  }

  // Add CSS animation
  if (!document.getElementById("particle-animation")) {
    const style = document.createElement("style");
    style.id = "particle-animation";
    style.textContent = `
      @keyframes particleFloat {
        0%, 100% {
          transform: translate(0, 0);
        }
        25% {
          transform: translate(20px, -30px);
        }
        50% {
          transform: translate(-15px, -60px);
        }
        75% {
          transform: translate(25px, -30px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== Gallery Filters =====
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  const viewBtns = document.querySelectorAll(".view-btn");
  const galleryGrid = document.querySelector(".modern-gallery-grid");

  // Filter functionality
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.getAttribute("data-filter");
      console.log("Filter selected:", filter);
      // يمكن إضافة منطق الفلترة هنا
    });
  });

  // View toggle functionality
  if (viewBtns.length > 0 && galleryGrid) {
    viewBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        viewBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const view = btn.getAttribute("data-view");
        if (view === "list") {
          galleryGrid.style.gridTemplateColumns = "1fr";
        } else {
          galleryGrid.style.gridTemplateColumns =
            "repeat(auto-fill, minmax(250px, 1fr))";
        }
      });
    });
  }
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initParticles();
    initGalleryFilters();
    initPhotoUpload();
  });
} else {
  initParticles();
  initGalleryFilters();
  initPhotoUpload();
}

// ===== Photo Upload Functionality with LocalStorage =====
function initPhotoUpload() {
  const addPhotosBtn = document.getElementById("add-photos-btn");
  const photoUpload = document.getElementById("photo-upload");
  const emptyState = document.getElementById("empty-state-photos");
  const photosGrid = document.getElementById("photos-grid");

  if (!addPhotosBtn || !photoUpload) return;

  // تحميل الصور المحفوظة عند فتح الصفحة
  loadSavedPhotos();

  // عند الضغط على زر إضافة صور
  addPhotosBtn.addEventListener("click", () => {
    photoUpload.click();
  });

  // عند اختيار الصور
  photoUpload.addEventListener("change", (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    // إخفاء Empty State وإظهار Grid
    if (emptyState) emptyState.style.display = "none";
    if (photosGrid) photosGrid.style.display = "grid";

    // إضافة كل صورة إلى المعرض
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        addPhotoToGallery(file, photosGrid, index);
      }
    });

    // إعادة تعيين input
    photoUpload.value = "";
  });
}

// تحميل الصور المحفوظة من localStorage
function loadSavedPhotos() {
  const savedPhotos = localStorage.getItem("galleryPhotos");
  if (!savedPhotos) return;

  const photos = JSON.parse(savedPhotos);
  const photosGrid = document.getElementById("photos-grid");
  const emptyState = document.getElementById("empty-state-photos");

  if (photos.length > 0 && photosGrid) {
    // إخفاء Empty State وإظهار Grid
    if (emptyState) emptyState.style.display = "none";
    photosGrid.style.display = "grid";

    // إضافة كل صورة محفوظة
    photos.forEach((photo, index) => {
      addSavedPhotoToGallery(photo, photosGrid, index);
    });
  }
}

// حفظ الصور في localStorage
function savePhotosToStorage() {
  const photosGrid = document.getElementById("photos-grid");
  if (!photosGrid) return;

  const photos = [];
  const figures = photosGrid.querySelectorAll("figure");

  figures.forEach((figure) => {
    const img = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    if (img && caption) {
      photos.push({
        src: img.src,
        name: caption.textContent,
      });
    }
  });

  localStorage.setItem("galleryPhotos", JSON.stringify(photos));
}

function addPhotoToGallery(file, container, index) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const figure = document.createElement("figure");
    figure.className = "photo-item";
    figure.style.animation = `fadeInScale 0.5s ease-out ${index * 0.1}s both`;

    const img = document.createElement("img");
    img.src = e.target.result;
    img.alt = file.name;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = file.name.replace(/\.[^/.]+$/, "");

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-photo-btn";
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.title = "حذف الصورة";
    deleteBtn.onclick = () => {
      figure.style.animation = "fadeOutScale 0.3s ease-out";
      setTimeout(() => {
        figure.remove();
        // حفظ التغييرات في localStorage
        savePhotosToStorage();
        // إذا لم يتبق صور، أظهر Empty State
        if (container.children.length === 0) {
          container.style.display = "none";
          if (document.getElementById("empty-state-photos")) {
            document.getElementById("empty-state-photos").style.display =
              "block";
          }
        }
      }, 300);
    };

    figure.appendChild(img);
    figure.appendChild(figcaption);
    figure.appendChild(deleteBtn);
    container.appendChild(figure);

    // حفظ الصورة في localStorage
    savePhotosToStorage();
  };

  reader.readAsDataURL(file);
}

// إضافة صورة محفوظة من localStorage
function addSavedPhotoToGallery(photo, container, index) {
  const figure = document.createElement("figure");
  figure.className = "photo-item";
  figure.style.animation = `fadeInScale 0.5s ease-out ${index * 0.1}s both`;

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.name;

  const figcaption = document.createElement("figcaption");
  figcaption.textContent = photo.name;

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-photo-btn";
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.title = "حذف الصورة";
  deleteBtn.onclick = () => {
    figure.style.animation = "fadeOutScale 0.3s ease-out";
    setTimeout(() => {
      figure.remove();
      // حفظ التغييرات في localStorage
      savePhotosToStorage();
      // إذا لم يتبق صور، أظهر Empty State
      if (container.children.length === 0) {
        container.style.display = "none";
        if (document.getElementById("empty-state-photos")) {
          document.getElementById("empty-state-photos").style.display = "block";
        }
      }
    }, 300);
  };

  figure.appendChild(img);
  figure.appendChild(figcaption);
  figure.appendChild(deleteBtn);
  container.appendChild(figure);
}

// إضافة CSS للأنيميشنات
const photoStyles = document.createElement("style");
photoStyles.textContent = `
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes fadeOutScale {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.8);
    }
  }

  .photo-item {
    position: relative;
  }

  .delete-photo-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(255, 68, 68, 0.9);
    border: 2px solid #ff4444;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .photo-item:hover .delete-photo-btn {
    opacity: 1;
  }

  .delete-photo-btn:hover {
    background: #ff4444;
    transform: scale(1.1);
    box-shadow: 0 5px 20px rgba(255, 68, 68, 0.5);
  }
`;
document.head.appendChild(photoStyles);
