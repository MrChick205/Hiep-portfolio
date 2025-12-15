# Personal Portfolio — English

This folder contains an English version of the personal portfolio. It is split into partials so it's easy to edit each section.

How it works:

- Serve the site over HTTP (recommended). You can open `en/index.html` via Live Server or a local HTTP server. Opening the file with `file://` will NOT load partials.
- The page dynamically loads partials from `en/partials/*.html` using `en/js/include.js` (this uses `fetch`, so it requires an HTTP server).
- The English site now uses split CSS files under `en/css/` (`base.css`, `layout.css`, `components.css`, `utils.css`) so sections are easier to manage.

Form configuration:

- The contact form posts to Formspree if you replace the placeholder endpoint in `en/partials/contact.html` (the `data-endpoint` attribute on the form).
- Example: replace `https://formspree.io/f/your-form-id` with your real Formspree endpoint (sign up at https://formspree.io/ to get an ID).
- Optionally set `data-mailto` on the form to control the mailto fallback address (e.g. `data-mailto="you@yourdomain.com"`).
- If the endpoint still contains the placeholder, the form will fallback to opening the user's default mail client using `mailto:`.

Troubleshooting form failures:

1. Open browser DevTools → Console and Network.
2. Submit the form and check the Network request to your Formspree endpoint. Common issues:
   - CORS errors: check console for CORS messages; Formspree should allow AJAX from browsers but verify your endpoint.
   - 4xx/5xx responses: inspect response body (JSON) to see error details.
3. You can test the endpoint from terminal with curl:

```bash
curl -i -X POST https://formspree.io/f/<your-form-id> \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","message":"Hello"}'
```

4. If you see errors, try sending form-encoded data as a fallback (our JS does this automatically if JSON is rejected).
5. If nothing works, set a valid `data-mailto` on the form to ensure users can still contact you via their mail client.

Tips:

- If you use Live Server, start it from the project root (`Portfolio`) or from the `en/` folder; both will work now.
- To make the main site English, replace root `index.html` with `en/index.html`, or add a language switcher/redirect.

Change `en/partials/*` to edit specific sections.
