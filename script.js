"use strict";
 
// ── DOM refs ──────────────────────────────────────────────────────────────────
const sections         = Array.from(document.querySelectorAll(".section"));
const sidebarLinks     = Array.from(document.querySelectorAll(".sidebar-nav .nav-link"));
const mobileLinks      = Array.from(document.querySelectorAll(".mobile-nav .nav-link"));
const allAnchorLinks   = Array.from(document.querySelectorAll('a[href^="#"]'));
const hamburger        = document.querySelector(".hamburger");
const mobileNav        = document.querySelector(".mobile-nav");
const certificateCards = Array.from(document.querySelectorAll(".certificate-card"));
const certLightbox     = document.querySelector(".certificate-lightbox");
const certTitle        = document.querySelector("#certificate-lightbox-title");
const certFrame        = document.querySelector(".certificate-lightbox__frame");
const certDownload     = document.querySelector(".certificate-lightbox__download");
 
let prevBodyOverflow  = "";
let lightboxTriggerEl = null;
 
// ── Mobile menu ───────────────────────────────────────────────────────────────
function closeMobileMenu() {
  if (!hamburger || !mobileNav) return;
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  mobileNav.classList.remove("open");
  document.body.style.overflow = "";
}
function openMobileMenu() {
  if (!hamburger || !mobileNav) return;
  hamburger.classList.add("open");
  hamburger.setAttribute("aria-expanded", "true");
  mobileNav.classList.add("open");
  document.body.style.overflow = "hidden";
}
 
// ── Scroll lock ───────────────────────────────────────────────────────────────
function lockBodyScroll()   { prevBodyOverflow = document.body.style.overflow; document.body.style.overflow = "hidden"; }
function unlockBodyScroll() { document.body.style.overflow = prevBodyOverflow; }
 
// ── Active nav ────────────────────────────────────────────────────────────────
function syncActiveNav(id) {
  sidebarLinks.forEach(l => l.classList.toggle("active", l.dataset.section === id));
}
function getOffset() {
  const mh = document.querySelector(".mobile-header");
  return mh && getComputedStyle(mh).display !== "none" ? mh.offsetHeight + 36 : 120;
}
function updateActiveSection() {
  if (!sections.length) return;
  const line = window.scrollY + getOffset();
  let active = sections[0];
  sections.forEach(s => { if (s.offsetTop <= line) active = s; });
  syncActiveNav(active.id);
}
 
// ── Smooth scroll ─────────────────────────────────────────────────────────────
allAnchorLinks.forEach(link => {
  link.addEventListener("click", e => {
    const id = link.getAttribute("href");
    if (!id || id === "#") return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const mh = document.querySelector(".mobile-header");
    const offset = mh && getComputedStyle(mh).display !== "none" ? mh.offsetHeight + 12 : 24;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    closeMobileMenu();
  });
});
 
if (hamburger) {
  hamburger.addEventListener("click", () => {
    hamburger.getAttribute("aria-expanded") === "true" ? closeMobileMenu() : openMobileMenu();
  });
}
mobileLinks.forEach(l => l.addEventListener("click", closeMobileMenu));
 
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeMobileMenu(); closeCertLightbox(); }
});
document.addEventListener("click", e => {
  if (!mobileNav?.classList.contains("open")) return;
  if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) closeMobileMenu();
});
 
// ── Section reveal ────────────────────────────────────────────────────────────
const revealObs = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
  { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
);
sections.forEach(s => { if (!s.classList.contains("visible")) revealObs.observe(s); });
 
window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("resize", updateActiveSection);
updateActiveSection();
 
// ── Project keyboard nav ──────────────────────────────────────────────────────
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const a = card.querySelector(".project-links a");
    if (a) { e.preventDefault(); a.click(); }
  });
});
 
// ═══════════════════════════════════════════════════════════════════════════════
// IMPROVEMENT 1 — Typed hero animation
// ═══════════════════════════════════════════════════════════════════════════════
 
const PHRASES = [
  "desktop, web, and AI-assisted products.",
  "native utilities that people rely on.",
  "full-stack apps with clean interaction.",
  "systems that solve specific problems well.",
];
 
function initTyped() {
  const heading = document.querySelector("#hero-heading");
  if (!heading) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Static fallback for reduced motion
    const typedEl = heading.querySelector(".typed-phrase");
    if (typedEl) typedEl.textContent = PHRASES[0];
    return;
  }
 
  const typedEl  = heading.querySelector(".typed-phrase");
  const cursorEl = heading.querySelector(".typed-cursor");
  if (!typedEl || !cursorEl) return;
 
  let pi = 0, ci = 0, deleting = false;
 
  function tick() {
    const phrase = PHRASES[pi];
    if (!deleting) {
      ci++;
      typedEl.textContent = phrase.slice(0, ci);
      if (ci === phrase.length) {
        deleting = true;
        cursorEl.classList.add("typed-cursor--paused");
        setTimeout(() => {
          cursorEl.classList.remove("typed-cursor--paused");
          setTimeout(tick, 180);
        }, 2200);
        return;
      }
      setTimeout(tick, 52);
    } else {
      ci--;
      typedEl.textContent = phrase.slice(0, ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % PHRASES.length;
        setTimeout(tick, 380);
        return;
      }
      setTimeout(tick, 22);
    }
  }
  setTimeout(tick, 800);
}
 
initTyped();
 
// ═══════════════════════════════════════════════════════════════════════════════
// IMPROVEMENT 2 — Count-up metrics
// ═══════════════════════════════════════════════════════════════════════════════
 
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
 
function animateCount(el, target, prefix, suffix, dur) {
  const start = performance.now();
  (function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = prefix + Math.round(easeOut(p) * target) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  })(start);
}
 
function initCountUp() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cards = document.querySelectorAll(".metric-card");
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const el  = entry.target.querySelector(".metric-value");
      if (!el) return;
      const raw = el.textContent.trim();
 
      const numM = raw.match(/^(\d+)(\+?)$/);
      if (numM) { animateCount(el, +numM[1], "", numM[2] || "", 1400); return; }
 
      const topM = raw.match(/^(Top\s+)(\d+)$/i);
      if (topM) { animateCount(el, +topM[2], topM[1], "", 1400); }
    });
  }, { threshold: 0.7 });
  cards.forEach(c => obs.observe(c));
}
 
initCountUp();
 
// ═══════════════════════════════════════════════════════════════════════════════
// IMPROVEMENT 3 — Lightbox with focus trap + focus restoration
// ═══════════════════════════════════════════════════════════════════════════════
 
function getFocusable(container) {
  return Array.from(container.querySelectorAll(
    'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"]),iframe'
  )).filter(el => !el.hasAttribute("hidden") && el.offsetParent !== null);
}
 
function trapFocus(e) {
  if (!certLightbox || certLightbox.hidden) return;
  const dialog = certLightbox.querySelector(".certificate-lightbox__dialog");
  if (!dialog || e.key !== "Tab") return;
  const focusable = getFocusable(dialog);
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
 
function openCertLightbox(title, file, trigger) {
  if (!certLightbox || !certTitle || !certFrame || !certDownload) return;
  lightboxTriggerEl = trigger || null;
  certTitle.textContent = title;
  certFrame.src         = `${file}#view=FitH`;
  certDownload.href     = file;
  certDownload.setAttribute("download", file.split("/").pop() || "certificate.pdf");
  certLightbox.hidden = false;
  certLightbox.setAttribute("aria-hidden", "false");
  lockBodyScroll();
  // Move focus into dialog
  const closeBtn = certLightbox.querySelector(".certificate-lightbox__close");
  requestAnimationFrame(() => closeBtn?.focus());
  document.addEventListener("keydown", trapFocus);
}
 
function closeCertLightbox() {
  if (!certLightbox?.hidden === false || certLightbox?.hidden) return;
  certLightbox.hidden = true;
  certLightbox.setAttribute("aria-hidden", "true");
  certFrame.src = "";
  unlockBodyScroll();
  document.removeEventListener("keydown", trapFocus);
  lightboxTriggerEl?.focus();
  lightboxTriggerEl = null;
}
 
certificateCards.forEach(card => {
  const open = () => {
    const t = card.dataset.certificateTitle, f = card.dataset.certificateFile;
    if (t && f) openCertLightbox(t, f, card);
  };
  card.addEventListener("click", open);
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  });
});
 
if (certLightbox) {
  certLightbox.addEventListener("click", e => {
    if (e.target instanceof Element && e.target.hasAttribute("data-lightbox-close")) closeCertLightbox();
  });
}


