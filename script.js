/* ==========================================================================
   Birthday Wishes — Main Script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLanding();         // full-canvas landing: bow (left) + balloon (right)
  initParticles();       // floating hearts / stars in bg
  initTypewriter();      // cycling bestie messages
  initEnvelope();        // click-to-open letter
  initAudio();           // music widget
  initCake();            // candle blowing
  initScrollAnimations();
  initNav();
});

// ==========================================================================
// 1.  LANDING — single full-screen canvas
//     Bow on the LEFT  (~20% across)
//     Balloon on the RIGHT (~75% across)
//     Everything in the same pixel space → no coordinate mismatch
// ==========================================================================
function initLanding() {
  const canvas = document.getElementById("landing-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // ── Size canvas to viewport ──────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); redraw(); });

  const W = () => canvas.width;
  const H = () => canvas.height;

  // ── Layout anchors (recomputed each frame so resize works) ───────────────
  function bowCenter()    { return { x: W() * 0.18, y: H() * 0.58 }; }
  function balloonCenter(){ return { x: W() * 0.74, y: H() * 0.28 }; }
  const BOW_HALF  = () => Math.min(H() * 0.14, 80);   // half-height of bow arms
  const BALL_R    = () => Math.min(W(), H()) * 0.085; // balloon radius
  const MAX_PULL  = 100;

  // ── State ────────────────────────────────────────────────────────────────
  let pullPt     = null;   // null = resting
  let isDragging = false;
  let arrowFlying= false;
  let arrowPos   = null;
  let arrowVel   = null;
  let balloonPop = false;
  let popScale   = 1;
  let popAlpha   = 1;
  let exited     = false;

  // Balloon bob offset (animated)
  let bobOffset  = 0;
  let bobDir     = 1;

  // ── Balloon float animation ──────────────────────────────────────────────
  function updateBob() {
    bobOffset += 0.28 * bobDir;
    if (Math.abs(bobOffset) > 12) bobDir *= -1;
  }

  // ── Draw background ──────────────────────────────────────────────────────
  function drawBackground() {
    const w = W(), h = H();
    // Warm cream → blush gradient
    const grad = ctx.createRadialGradient(w*0.6, h*0.3, 0, w*0.5, h*0.5, Math.max(w,h)*0.85);
    grad.addColorStop(0, "#FDE8E0");
    grad.addColorStop(0.5,"#FAD9D0");
    grad.addColorStop(1, "#F5C8C0");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle dot grid
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.fillStyle = "#c26060";
    const step = 38;
    for (let x = step; x < w; x += step) {
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // ── Draw eyebrow text ────────────────────────────────────────────────────
  function drawText() {
    const w = W(), h = H();
    ctx.save();
    ctx.font = `italic ${Math.max(16, w * 0.025)}px 'Dancing Script', cursive`;
    ctx.fillStyle = "rgba(160,70,70,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("a little something, for you ✨", w * 0.5, h * 0.08);

    ctx.font = `700 ${Math.max(10, w * 0.012)}px 'Nunito', sans-serif`;
    ctx.letterSpacing = "0.25em";
    ctx.fillStyle = "rgba(150,70,70,0.45)";
    ctx.fillText("PULL & RELEASE", w * 0.5, h * 0.94);
    ctx.restore();
  }

  // ── Draw balloon (heart shape on right) ──────────────────────────────────
  function drawBalloon(alpha = 1, scale = 1) {
    const bc = balloonCenter();
    const r  = BALL_R();
    const bx = bc.x;
    const by = bc.y + bobOffset;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(bx, by);
    ctx.scale(scale, scale);

    // Glow
    const glow = ctx.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 2);
    glow.addColorStop(0,   "rgba(240,100,140,0.35)");
    glow.addColorStop(0.5, "rgba(240,100,140,0.12)");
    glow.addColorStop(1,   "rgba(240,100,140,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Heart path
    ctx.beginPath();
    const d = r;
    ctx.moveTo(0, d * 0.35);
    ctx.bezierCurveTo(0, -d * 0.6, -d * 1.25, -d * 0.6, -d * 1.25, d * 0.25);
    ctx.bezierCurveTo(-d * 1.25, d * 0.9,  0, d * 1.5,  0, d * 1.75);
    ctx.bezierCurveTo(0, d * 1.5,  d * 1.25, d * 0.9, d * 1.25, d * 0.25);
    ctx.bezierCurveTo(d * 1.25, -d * 0.6, 0, -d * 0.6, 0, d * 0.35);
    ctx.closePath();

    // Gradient fill
    const fill = ctx.createRadialGradient(-d * 0.2, -d * 0.1, 0, 0, 0, d * 1.4);
    fill.addColorStop(0,   "#FF6BA8");
    fill.addColorStop(0.5, "#E8336E");
    fill.addColorStop(1,   "#C2185B");
    ctx.fillStyle = fill;
    ctx.fill();

    // Shine highlight
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-d * 0.42, -d * 0.3, d * 0.28, d * 0.18, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // String from bottom of heart down
    ctx.strokeStyle = "rgba(180,80,100,0.5)";
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, d * 1.75);
    ctx.lineTo(0, d * 1.75 + Math.min(H() * 0.12, 90));
    ctx.stroke();

    ctx.restore();
  }

  // ── Draw bow (on left side) ───────────────────────────────────────────────
  // bx,by = center of bow; pull = current pull distance; bend = flex
  function drawBow() {
    const bc   = bowCenter();
    const half = BOW_HALF();
    const bx   = bc.x;
    const by   = bc.y;
    const pull  = pullPt ? Math.hypot(pullPt.x - bc.x, pullPt.y - bc.y) : 0;
    const bend  = Math.min(pull / MAX_PULL, 1) * 22;

    // Bow arc — curves rightward from left wall
    ctx.save();
    ctx.strokeStyle = "#5c3317";
    ctx.lineWidth   = 4;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(bx, by - half);
    ctx.quadraticCurveTo(bx + 28 + bend, by, bx, by + half);
    ctx.stroke();

    // String: top tip → pull point → bottom tip
    const tipTop    = { x: bx, y: by - half };
    const tipBottom = { x: bx, y: by + half };
    const stringMid = pullPt || bc;

    ctx.strokeStyle = "#a07048";
    ctx.lineWidth   = 1.8;
    ctx.beginPath();
    ctx.moveTo(tipTop.x, tipTop.y);
    ctx.lineTo(stringMid.x, stringMid.y);
    ctx.lineTo(tipBottom.x, tipBottom.y);
    ctx.stroke();
    ctx.restore();

    // Draw arrow at rest or while pulled
    if (!arrowFlying) {
      const arrowTip  = pullPt || bc;
      const arrowTail = bc;
      drawArrowShape(arrowTip, arrowTail);
    }
  }

  // ── Arrow shape (tip → tail direction) ───────────────────────────────────
  function drawArrowShape(tip, tail) {
    const dx    = tail.x - tip.x;
    const dy    = tail.y - tip.y;
    const len   = Math.hypot(dx, dy);
    if (len < 1) return;
    const angle = Math.atan2(dy, dx);
    const shaftLen = Math.min(len + 60, 100);

    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.rotate(angle);

    // Shaft
    ctx.strokeStyle = "#7a4020";
    ctx.lineWidth   = 3;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(shaftLen, 0);
    ctx.stroke();

    // Arrowhead (points LEFT = toward target when flying rightward)
    ctx.fillStyle = "#d32f2f";
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-3, -6);
    ctx.lineTo(-3,  6);
    ctx.closePath();
    ctx.fill();

    // Feathers at tail
    ctx.strokeStyle = "#e57373";
    ctx.lineWidth   = 2;
    const tx = shaftLen;
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx - 12, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx - 12,  8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 4, 0); ctx.lineTo(tx - 16, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx - 4, 0); ctx.lineTo(tx - 16,  6); ctx.stroke();

    ctx.restore();
  }

  // ── Draw flying arrow ────────────────────────────────────────────────────
  function drawFlyingArrow() {
    if (!arrowPos || !arrowVel) return;
    const angle = Math.atan2(arrowVel.y, arrowVel.x);
    const shaftLen = 80;

    ctx.save();
    ctx.translate(arrowPos.x, arrowPos.y);
    ctx.rotate(angle);

    ctx.strokeStyle = "#7a4020";
    ctx.lineWidth   = 3;
    ctx.lineCap     = "round";
    ctx.beginPath();
    ctx.moveTo(-shaftLen, 0);
    ctx.lineTo(0, 0);
    ctx.stroke();

    ctx.fillStyle = "#d32f2f";
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(3, -6);
    ctx.lineTo(3,  6);
    ctx.closePath();
    ctx.fill();

    const tx = -shaftLen;
    ctx.strokeStyle = "#e57373";
    ctx.lineWidth   = 2;
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx + 12, -8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tx, 0); ctx.lineTo(tx + 12,  8); ctx.stroke();

    ctx.restore();
  }

  // ── Main render loop ──────────────────────────────────────────────────────
  function render() {
    if (exited) return;
    ctx.clearRect(0, 0, W(), H());

    updateBob();
    drawBackground();
    drawText();

    // Balloon — pop animation
    if (balloonPop) {
      popScale += 0.06;
      popAlpha -= 0.07;
      if (popAlpha <= 0) {
        // Balloon gone — trigger transition
        exited = true;
        triggerTransition();
        return;
      }
      drawBalloon(Math.max(0, popAlpha), popScale);
    } else {
      drawBalloon(1, 1);
    }

    drawBow();

    // Flying arrow
    if (arrowFlying && arrowPos && arrowVel) {
      arrowVel.y += 0.15;  // gravity
      arrowPos.x += arrowVel.x;
      arrowPos.y += arrowVel.y;
      drawFlyingArrow();

      // Hit-test: balloon center in canvas coords
      const bc = balloonCenter();
      const bx = bc.x, by = bc.y + bobOffset;
      const hitR = BALL_R() * 1.3;
      const dist = Math.hypot(arrowPos.x - bx, arrowPos.y - by);

      if (dist < hitR) {
        // POP!
        balloonPop  = true;
        arrowFlying = false;
        fireConfettiBurst(by, bx);
      }

      // Arrow left screen — reset
      if (arrowPos.x > W() + 80 || arrowPos.y > H() + 80 || arrowPos.y < -120) {
        arrowFlying = false;
        arrowPos    = null;
        arrowVel    = null;
        pullPt      = null;
      }
    }

    requestAnimationFrame(render);
  }

  function redraw() {
    if (!exited) render();
  }

  render();

  // ── Pointer input ─────────────────────────────────────────────────────────
  function getXY(e) {
    const src = e.touches ? e.touches[0] : e;
    const r   = canvas.getBoundingClientRect();
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  }

  function clamp(pt) {
    const bc   = bowCenter();
    const dx   = pt.x - bc.x;
    const dy   = pt.y - bc.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= MAX_PULL) return pt;
    return { x: bc.x + dx/dist * MAX_PULL, y: bc.y + dy/dist * MAX_PULL };
  }

  canvas.addEventListener("mousedown",  e => { if (!arrowFlying && !balloonPop) { isDragging = true; pullPt = clamp(getXY(e)); } });
  canvas.addEventListener("touchstart", e => { if (!arrowFlying && !balloonPop) { isDragging = true; pullPt = clamp(getXY(e)); } }, { passive: true });

  window.addEventListener("mousemove", e => { if (isDragging) pullPt = clamp(getXY(e)); });
  window.addEventListener("touchmove", e => { if (isDragging) pullPt = clamp(getXY(e)); }, { passive: true });

  window.addEventListener("mouseup",  release);
  window.addEventListener("touchend", release);

  function release() {
    if (!isDragging) return;
    isDragging = false;
    if (!pullPt) return;

    const bc   = bowCenter();
    const pull = Math.hypot(pullPt.x - bc.x, pullPt.y - bc.y);

    if (pull < 14) { pullPt = null; return; } // barely pulled

    // Arrow launches in OPPOSITE direction of pull
    const speed = (pull / MAX_PULL) * 20 + 8;
    const dx    = bc.x - pullPt.x;
    const dy    = bc.y - pullPt.y;
    const len   = Math.hypot(dx, dy);
    arrowVel    = { x: dx/len * speed, y: dy/len * speed };
    arrowPos    = { x: bc.x, y: bc.y };
    arrowFlying = true;
    pullPt      = null;
  }
}

// ==========================================================================
// 2.  TRANSITION — fade canvas out, reveal demo wrapper
// ==========================================================================
function triggerTransition() {
  const canvas = document.getElementById("landing-canvas");

  // Fade out the landing canvas with CSS
  canvas.style.transition = "opacity 0.9s ease";
  canvas.style.opacity    = "0";

  setTimeout(() => {
    canvas.style.display = "none";
    
    const particles = document.getElementById("particles-canvas");
    if (particles) {
      particles.style.display = "none";
    }

    // Reveal demo wrapper
    const demoWrapper = document.getElementById("demo-wrapper");
    if (demoWrapper) {
      demoWrapper.classList.remove("hidden");
    }
  }, 900);
}

// ==========================================================================
// 3.  BACKGROUND PARTICLES (hearts / stars floating up)
// ==========================================================================
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const sz = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
  sz();
  window.addEventListener("resize", sz);

  const COLORS = ["#FF6BA8","#FFD700","#FFB6C1","#FF8C42","#7EC8E3","#FFF176","#FF6B6B"];

  const particles = Array.from({ length: 40 }, () => mkParticle(true));

  function mkParticle(init) {
    return {
      x:     Math.random() * canvas.width,
      y:     init ? Math.random() * canvas.height : canvas.height + 20,
      type:  Math.random() < 0.5 ? "heart" : "star",
      size:  Math.random() * 10 + 5,
      vx:    Math.random() * 0.6 - 0.3,
      vy:    -(Math.random() * 0.9 + 0.4),
      alpha: init ? Math.random() * 0.5 + 0.1 : 0.01,
      rot:   Math.random() * 360,
      rotV:  Math.random() * 1.4 - 0.7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x   += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.alpha < 0.6 && p.y > canvas.height - 80) p.alpha += 0.008;
      if (p.y < 80) p.alpha -= 0.01;
      if (p.y < -15 || p.alpha <= 0) { particles[i] = mkParticle(false); return; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle   = p.color;

      if (p.type === "heart") {
        const d = p.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(0, d * 0.35);
        ctx.bezierCurveTo(0, -d*0.5, -d*1.2, -d*0.5, -d*1.2, d*0.25);
        ctx.bezierCurveTo(-d*1.2, d*0.9, 0, d*1.5, 0, d*1.7);
        ctx.bezierCurveTo(0, d*1.5, d*1.2, d*0.9, d*1.2, d*0.25);
        ctx.bezierCurveTo(d*1.2, -d*0.5, 0, -d*0.5, 0, d*0.35);
        ctx.closePath();
        ctx.fill();
      } else {
        for (let j = 0; j < 4; j++) {
          ctx.save();
          ctx.rotate((j * Math.PI) / 2);
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.9);
          ctx.quadraticCurveTo(0, 0, p.size * 0.9, 0);
          ctx.quadraticCurveTo(0, 0, 0, -p.size * 0.9);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    });
    requestAnimationFrame(loop);
  })();
}

// ==========================================================================
// 4.  CONFETTI BURST
// ==========================================================================
function fireConfettiBurst(originY, originX) {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const ox  = originX ?? canvas.width  * 0.5;
  const oy  = originY ?? canvas.height * 0.3;

  const cols  = ["#FF6BA8","#FFD700","#00D4AA","#FF6B6B","#7EC8E3","#FFF176","#FF8C42","#fff"];
  const bits  = Array.from({ length: 140 }, () => ({
    x:     ox + (Math.random() - 0.5) * 50,
    y:     oy,
    vx:    Math.random() * 16 - 8,
    vy:    -(Math.random() * 16 + 6),
    size:  Math.random() * 9 + 3,
    color: cols[Math.floor(Math.random() * cols.length)],
    rot:   Math.random() * 360,
    rotV:  Math.random() * 8 - 4,
    alpha: 1
  }));

  (function burst() {
    let alive = false;
    bits.forEach(b => {
      if (b.alpha <= 0) return;
      b.vx *= 0.97; b.vy += 0.28; b.vy *= 0.97;
      b.x += b.vx; b.y += b.vy; b.rot += b.rotV;
      b.alpha -= 0.013;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot * Math.PI / 180);
      ctx.globalAlpha = Math.max(0, b.alpha);
      ctx.fillStyle   = b.color;
      ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size * 0.55);
      ctx.restore();
      alive = true;
    });
    if (alive) requestAnimationFrame(burst);
  })();
}

// ==========================================================================
// 5.  TYPEWRITER
// ==========================================================================
function initTypewriter() {
  const el = document.getElementById("tw");
  if (!el) return;

  const msgs = [
    "because you deserve the whole world! 🌍",
    "the funniest person I know... hands down 😂",
    "my partner in crime since day one 🤝",
    "thank you for always being there 💛",
    "you absolute legend, happy birthday! 🎉"
  ];

  let mi = 0, ci = 0, del = false;

  function tick() {
    const m = msgs[mi];
    if (!del) {
      el.textContent = m.slice(0, ++ci);
      if (ci === m.length) { del = true; setTimeout(tick, 2600); return; }
    } else {
      el.textContent = m.slice(0, --ci);
      if (ci === 0) { del = false; mi = (mi + 1) % msgs.length; setTimeout(tick, 400); return; }
    }
    setTimeout(tick, del ? 46 : 88 + Math.random() * 38);
  }
  tick();
}

// ==========================================================================
// 6.  ENVELOPE
// ==========================================================================
function initEnvelope() {
  const env = document.getElementById("envelope");
  env?.addEventListener("click", () => env.classList.toggle("open"));
}

// ==========================================================================
// 7.  AUDIO
// ==========================================================================
function initAudio() {
  const btn   = document.getElementById("btn-audio");
  const audio = document.getElementById("bg-audio");
  if (!btn || !audio) return;

  const disc   = document.getElementById("disc");
  const status = btn.querySelector(".t-status");

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      btn.classList.add("is-playing");
      disc?.classList.add("spinning");
      if (status) status.textContent = "Playing";
    } else {
      audio.pause();
      btn.classList.remove("is-playing");
      disc?.classList.remove("spinning");
      if (status) status.textContent = "Paused";
    }
  });
}

// ==========================================================================
// 8.  CAKE
// ==========================================================================
function initCake() {
  const btn  = document.getElementById("btn-blow");
  const msg  = document.getElementById("wish-msg");
  if (!btn) return;

  btn.addEventListener("click", () => {
    document.querySelectorAll(".flame").forEach(f => f.classList.add("out"));
    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";
    setTimeout(() => {
      btn.classList.add("hidden");
      msg?.classList.remove("hidden");
    }, 400);
    const sec = document.getElementById("celebrate");
    fireConfettiBurst(
      sec ? sec.getBoundingClientRect().top + 120 : innerHeight * 0.5,
      innerWidth * 0.5
    );
  });
}

// ==========================================================================
// 9.  SCROLL ANIMATIONS
// ==========================================================================
let _obs = null;
function initScrollAnimations() {
  const els = document.querySelectorAll(".anim:not(.in)");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }

  if (_obs) _obs.disconnect();
  _obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); _obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => _obs.observe(e));
}

// ==========================================================================
// 10. NAV
// ==========================================================================
function initNav() {
  const secs  = document.querySelectorAll("section[id]");
  const links = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    const y = scrollY + 140;
    secs.forEach(s => {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === `#${s.id}`));
      }
    });
  }, { passive: true });

  links.forEach(l => l.addEventListener("click", e => {
    e.preventDefault();
    document.querySelector(l.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  }));
}

// ==========================================================================
// GLOBALS
// ==========================================================================
window.openBox = el => {
  const lb  = document.getElementById("lightbox");
  const img = document.getElementById("lb-img");
  const cap = document.getElementById("lb-cap");
  lb.style.display = "flex";
  img.src          = el.querySelector("img").src;
  cap.textContent  = el.querySelector(".photo-label")?.textContent || "";
};
window.closeLightbox = () => { document.getElementById("lightbox").style.display = "none"; };
