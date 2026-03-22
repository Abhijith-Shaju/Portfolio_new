/* ═══════════════════════════════════════════════════
   ABHIJITH SHAJU — PORTFOLIO
   script.js — interactions & scroll behaviour
═══════════════════════════════════════════════════ */

'use strict';

/* ── DOM References ──────────────────────────────── */
const sections      = document.querySelectorAll('.section');
const navLinks      = document.querySelectorAll('.sidebar-nav .nav-link');
const hamburger     = document.querySelector('.hamburger');
const mobileNav     = document.querySelector('.mobile-nav');
const mobileLinks   = document.querySelectorAll('.mobile-nav .nav-link');

/* ══════════════════════════════════════════════════
   1. SECTION REVEAL — Intersection Observer
══════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: '0px 0px -60px 0px'
  }
);

sections.forEach(section => revealObserver.observe(section));

/* ══════════════════════════════════════════════════
   2. ACTIVE NAV HIGHLIGHTING — scroll spy
══════════════════════════════════════════════════ */
const sectionIds = Array.from(sections).map(s => s.id);

function setActiveNav(id) {
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.section === id);
  });
}

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  {
    rootMargin: '-35% 0px -55% 0px',
    threshold: 0
  }
);

sections.forEach(section => spyObserver.observe(section));

/* ══════════════════════════════════════════════════
   3. SMOOTH SCROLL — all nav anchor links
══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;

    e.preventDefault();

    // Account for mobile header height if visible
    const mobileHeader = document.querySelector('.mobile-header');
    const offset = (mobileHeader && getComputedStyle(mobileHeader).display !== 'none')
      ? mobileHeader.offsetHeight + 8
      : 0;

    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });

    // Close mobile menu if open
    closeMobileMenu();
  });
});

/* ══════════════════════════════════════════════════
   4. MOBILE HAMBURGER MENU
══════════════════════════════════════════════════ */
function openMobileMenu() {
  hamburger.classList.add('open');
  mobileNav.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', () => {
  const isOpen = hamburger.classList.contains('open');
  isOpen ? closeMobileMenu() : openMobileMenu();
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    mobileNav?.classList.contains('open') &&
    !mobileNav.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobileMenu();
  }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobileMenu();
});

/* ══════════════════════════════════════════════════
   5. PROJECT CARDS — keyboard accessibility
══════════════════════════════════════════════════ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const link = card.querySelector('a');
      if (link) link.click();
    }
  });
});

/* ══════════════════════════════════════════════════
   6. CURSOR TRAIL EFFECT (desktop only)
══════════════════════════════════════════════════ */
(function initCursorTrail() {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

  const TRAIL_COUNT = 6;
  const trail = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: ${4 - i * 0.4}px;
      height: ${4 - i * 0.4}px;
      border-radius: 50%;
      background: rgba(208, 140, 96, ${0.5 - i * 0.07});
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s;
      opacity: 0;
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    trail.forEach(t => { t.el.style.opacity = '1'; });
  });

  document.addEventListener('mouseleave', () => {
    trail.forEach(t => { t.el.style.opacity = '0'; });
  });

  function animateTrail() {
    let prevX = mouseX, prevY = mouseY;

    trail.forEach((t, i) => {
      const lerp = 0.3 - i * 0.035;
      t.x += (prevX - t.x) * lerp;
      t.y += (prevY - t.y) * lerp;
      t.el.style.left = t.x + 'px';
      t.el.style.top  = t.y + 'px';
      prevX = t.x;
      prevY = t.y;
    });

    raf = requestAnimationFrame(animateTrail);
  }

  animateTrail();
})();

/* ══════════════════════════════════════════════════
   7. SKILL TAGS — staggered hover ripple on card
══════════════════════════════════════════════════ */
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const tags = card.querySelectorAll('.skill-tags li');
    tags.forEach((tag, i) => {
      tag.style.transitionDelay = `${i * 40}ms`;
    });
  });

  card.addEventListener('mouseleave', () => {
    const tags = card.querySelectorAll('.skill-tags li');
    tags.forEach(tag => { tag.style.transitionDelay = '0ms'; });
  });
});

/* ══════════════════════════════════════════════════
   8. HERO — typing cursor blink on load
══════════════════════════════════════════════════ */
(function heroEntrance() {
  const heroSection = document.querySelector('.hero-section');
  if (!heroSection) return;

  // Force hero visible immediately (no observer delay needed for first section)
  requestAnimationFrame(() => {
    heroSection.classList.add('visible');
  });
})();

/* ══════════════════════════════════════════════════
   9. SIDEBAR SCROLL PROGRESS INDICATOR
══════════════════════════════════════════════════ */
(function scrollProgress() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const bar = document.createElement('div');
  bar.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    width: 2px;
    height: 0%;
    background: linear-gradient(to bottom, transparent, var(--accent, #d08c60));
    transition: height 0.1s linear;
    pointer-events: none;
  `;
  sidebar.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.height = pct + '%';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════
   10. MOBILE NAV — close on link tap (belt & braces)
══════════════════════════════════════════════════ */
mobileLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});
