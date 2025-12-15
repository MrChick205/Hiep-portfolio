document.addEventListener("DOMContentLoaded", async () => {
  // Include partials
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url);
      if (res.ok) el.innerHTML = await res.text();
      else
        el.innerHTML = `<!-- include failed: ${res.status} ${res.statusText} -->`;
    } catch (e) {
      el.innerHTML = "<!-- include error -->";
    }
  }

  // Set year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form handling
  const form = document.getElementById("contactForm");
  if (form) {
    const msgEl = form.querySelector(".form-message");
    const fallbackMail = form.getAttribute("data-mailto") || "you@example.com";

    const setMessage = (text, ok = true) => {
      if (msgEl) {
        msgEl.textContent = text;
        msgEl.className = "form-message " + (ok ? "ok" : "error");
      } else {
        alert(text);
      }
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = ((form.name && form.name.value) || "").trim();
      const email = ((form.email && form.email.value) || "").trim();
      const message = ((form.message && form.message.value) || "").trim();

      if (!name || !email || !message) {
        setMessage("Please complete all fields before sending.", false);
        return;
      }

      const endpoint = form.getAttribute("data-endpoint") || "";

      // Fallback to mailto if endpoint not set or still the placeholder
      if (!endpoint || endpoint.includes("your-form-id")) {
        const subject = encodeURIComponent("Contact from portfolio — " + name);
        const body = encodeURIComponent(
          "Name: " + name + "\nEmail: " + email + "\n\n" + message
        );
        window.location.href = `mailto:${fallbackMail}?subject=${subject}&body=${body}`;
        return;
      }

      // POST to endpoint: try JSON (preferred by Formspree), fallback to form data
      try {
        const payload = { name, email, message };
        let res = await fetch(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok && res.status === 415) {
          const formData = new FormData();
          formData.append("name", name);
          formData.append("email", email);
          formData.append("message", message);
          res = await fetch(endpoint, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          });
        }

        const ctype = res.headers.get("content-type") || "";
        let body = null;
        if (ctype.includes("application/json"))
          body = await res.json().catch(() => null);
        else body = await res.text().catch(() => null);

        if (res.ok) {
          form.reset();
          setMessage("Message sent — thank you!", true);
          console.info("Form sent", { endpoint, status: res.status, body });
        } else {
          console.warn("Form submission failed", {
            endpoint,
            status: res.status,
            body,
          });
          const errMsg =
            body && body.error
              ? body.error
              : `Sending failed (status ${res.status}).`;
          setMessage(
            errMsg + " Please try again or use the mailto fallback.",
            false
          );
        }
      } catch (err) {
        console.error("Form submission error", err);
        setMessage(
          "Network error — could not send message. Check console for details.",
          false
        );
      }
    });
  }

  // Reveal-on-scroll animations using IntersectionObserver
  const revealEls = document.querySelectorAll(".reveal-on-scroll");
  if ("IntersectionObserver" in window && revealEls.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    revealEls.forEach((el) => obs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }
});
