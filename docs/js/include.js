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

    const openMailClient = (name, email, message) => {
      const subject = encodeURIComponent("Contact from portfolio — " + name);
      const body = encodeURIComponent(
        "Name: " + name + "\nEmail: " + email + "\n\n" + message
      );
      window.open(`mailto:${fallbackMail}?subject=${subject}&body=${body}`);
      setMessage("Opening mail client...", true);
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

      const endpoint = (form.getAttribute("data-endpoint") || "").trim();
      const isFormSubmit = endpoint.includes("formsubmit.co");

      // If no endpoint configured, always fallback to mail client
      if (!endpoint) {
        openMailClient(name, email, message);
        return;
      }

      const sendFormData = async () => {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        formData.append("message", message);
        return fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });
      };

      // POST to endpoint: JSON first (Formspree), FormData for FormSubmit or 415 fallback
      try {
        let res;
        if (isFormSubmit) {
          res = await sendFormData();
        } else {
          const payload = { name, email, message };
          res = await fetch(endpoint, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok && res.status === 415) {
            res = await sendFormData();
          }
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
          // Fall back to mail client on failure
          openMailClient(name, email, message);
          setMessage(errMsg + " Falling back to your mail client...", false);
        }
      } catch (err) {
        console.error("Form submission error", err);
        openMailClient(name, email, message);
        setMessage(
          "Network error — opening your mail client as fallback.",
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
