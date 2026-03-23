"use strict";

const sections = Array.from(document.querySelectorAll(".section"));
const sidebarLinks = Array.from(document.querySelectorAll(".sidebar-nav .nav-link"));
const mobileLinks = Array.from(document.querySelectorAll(".mobile-nav .nav-link"));
const allAnchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
const hamburger = document.querySelector(".hamburger");
const mobileNav = document.querySelector(".mobile-nav");
const certificateCards = Array.from(document.querySelectorAll(".certificate-card"));
const certificateLightbox = document.querySelector(".certificate-lightbox");
const certificateTitle = document.querySelector("#certificate-lightbox-title");
const certificateFrame = document.querySelector(".certificate-lightbox__frame");
const certificateDownload = document.querySelector(".certificate-lightbox__download");
let previousBodyOverflow = "";

function closeMobileMenu() {
  if (!hamburger || !mobileNav) {
    return;
  }

  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  mobileNav.classList.remove("open");
  document.body.style.overflow = "";
}

function openMobileMenu() {
  if (!hamburger || !mobileNav) {
    return;
  }

  hamburger.classList.add("open");
  hamburger.setAttribute("aria-expanded", "true");
  mobileNav.classList.add("open");
  document.body.style.overflow = "hidden";
}

function lockBodyScroll() {
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow;
}

function syncActiveNav(sectionId) {
  sidebarLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sectionId);
  });
}

function getScrollActivationOffset() {
  const mobileHeader = document.querySelector(".mobile-header");
  const hasMobileHeader = mobileHeader && getComputedStyle(mobileHeader).display !== "none";
  return hasMobileHeader ? mobileHeader.offsetHeight + 36 : 120;
}

function updateActiveSection() {
  if (!sections.length) {
    return;
  }

  const activationLine = window.scrollY + getScrollActivationOffset();
  let activeSection = sections[0];

  sections.forEach((section) => {
    if (section.offsetTop <= activationLine) {
      activeSection = section;
    }
  });

  syncActiveNav(activeSection.id);
}

allAnchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const mobileHeader = document.querySelector(".mobile-header");
    const hasMobileHeader = mobileHeader && getComputedStyle(mobileHeader).display !== "none";
    const offset = hasMobileHeader ? mobileHeader.offsetHeight + 12 : 24;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({
      top,
      behavior: "smooth"
    });

    closeMobileMenu();
  });
});

if (hamburger) {
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    if (expanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });
}

mobileLinks.forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
    closeCertificateLightbox();
  }
});

document.addEventListener("click", (event) => {
  if (!mobileNav || !hamburger || !mobileNav.classList.contains("open")) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node)) {
    return;
  }

  if (!mobileNav.contains(target) && !hamburger.contains(target)) {
    closeMobileMenu();
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -80px 0px"
  }
);

sections.forEach((section) => {
  if (!section.classList.contains("visible")) {
    revealObserver.observe(section);
  }
});

window.addEventListener("scroll", updateActiveSection, { passive: true });
window.addEventListener("resize", updateActiveSection);
updateActiveSection();

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const firstAction = card.querySelector(".project-links a");
    if (!firstAction) {
      return;
    }

    event.preventDefault();
    firstAction.click();
  });
});

function openCertificateLightbox(title, file) {
  if (!certificateLightbox || !certificateTitle || !certificateFrame || !certificateDownload) {
    return;
  }

  certificateTitle.textContent = title;
  certificateFrame.src = `${file}#view=FitH`;
  certificateDownload.href = file;
  certificateDownload.setAttribute("download", file.split("/").pop() || "certificate.pdf");
  certificateLightbox.hidden = false;
  certificateLightbox.setAttribute("aria-hidden", "false");
  lockBodyScroll();
}

function closeCertificateLightbox() {
  if (!certificateLightbox || !certificateFrame) {
    return;
  }

  if (certificateLightbox.hidden) {
    return;
  }

  certificateLightbox.hidden = true;
  certificateLightbox.setAttribute("aria-hidden", "true");
  certificateFrame.src = "";
  unlockBodyScroll();
}

certificateCards.forEach((card) => {
  card.addEventListener("click", () => {
    const title = card.dataset.certificateTitle;
    const file = card.dataset.certificateFile;

    if (!title || !file) {
      return;
    }

    openCertificateLightbox(title, file);
  });
});

if (certificateLightbox) {
  certificateLightbox.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    if (target.hasAttribute("data-lightbox-close")) {
      closeCertificateLightbox();
    }
  });
}
