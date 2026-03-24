(function () {
  "use strict";
 
  // ── ⚙️  YOUR EMAILJS CREDENTIALS — fill these in ────────────────────────
  const EMAILJS_PUBLIC_KEY  = "reZqf35ggECQPh-V4";   // from Account → API Keys
  const EMAILJS_SERVICE_ID  = "service_hxa07oc";   // from Email Services
  const EMAILJS_TEMPLATE_ID = "template_ttzieef";  // from Email Templates
  // ──────────────────────────────────────────────────────────────────────────
 
  // Bail gracefully if credentials haven't been set yet
  if (
    EMAILJS_PUBLIC_KEY  === "YOUR_PUBLIC_KEY" ||
    EMAILJS_SERVICE_ID  === "YOUR_SERVICE_ID" ||
    EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
  ) {
    console.warn("EmailJS: fill in your credentials in the script block.");
  } else {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
 
  // ── DOM refs ──────────────────────────────────────────────────────────────
  const form      = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const toast     = document.getElementById("form-toast");
 
  if (!form) return;
 
  // ── Validation helpers ────────────────────────────────────────────────────
  const validators = {
    "cf-name":    (v) => v.trim().length >= 2  ? "" : "Please enter your name.",
    "cf-email":   (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email address.",
    "cf-subject": (v) => v.trim().length >= 3  ? "" : "Subject is too short.",
    "cf-message": (v) => v.trim().length >= 20 ? "" : "Message must be at least 20 characters.",
  };
 
  function validateField(input) {
    const error   = validators[input.id]?.(input.value) ?? "";
    const errEl   = input.closest(".form-field")?.querySelector(".form-error");
    if (errEl) errEl.textContent = error;
    input.classList.toggle("invalid", !!error);
    return !error;
  }
 
  function validateAll() {
    return [...form.querySelectorAll(".form-input, .form-textarea")]
      .map(validateField)
      .every(Boolean);
  }
 
  // Validate on blur for inline feedback
  form.querySelectorAll(".form-input, .form-textarea").forEach((el) => {
    el.addEventListener("blur", () => validateField(el));
    el.addEventListener("input", () => {
      if (el.classList.contains("invalid")) validateField(el);
    });
  });
 
  // ── Toast helper ──────────────────────────────────────────────────────────
  function showToast(type, message) {
    toast.hidden = false;
    toast.className = `form-toast ${type}`;
    toast.querySelector(".form-toast__icon").textContent  = type === "success" ? "✓" : "✕";
    toast.querySelector(".form-toast__msg").textContent   = message;
 
    // Auto-hide after 6 s
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.hidden = true; }, 6000);
  }
 
  // ── Submit ────────────────────────────────────────────────────────────────
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    toast.hidden = true;
 
    if (!validateAll()) {
      form.querySelector(".invalid")?.focus();
      return;
    }
 
    // Check credentials are configured
    if (EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
      showToast("error", "EmailJS credentials not set — check the script block.");
      return;
    }
 
    // Sending state
    submitBtn.disabled = true;
    submitBtn.classList.add("sending");
    submitBtn.querySelector(".form-submit__label").textContent = "Sending";
 
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form);
 
      showToast("success", "Message sent! I'll get back to you soon.");
      form.reset();
      // Clear any residual validation styles
      form.querySelectorAll(".form-input, .form-textarea").forEach(el => {
        el.classList.remove("invalid");
      });
      form.querySelectorAll(".form-error").forEach(el => el.textContent = "");
 
    } catch (err) {
      console.error("EmailJS error:", err);
      showToast("error", "Something went wrong. Please try emailing me directly.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove("sending");
      submitBtn.querySelector(".form-submit__label").textContent = "Send Message";
    }
  });
})();
