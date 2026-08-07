# SkenLLP Website

Official website of SkenLLP.

## About
This repository contains the source code for the SkenLLP corporate website.

## Technologies Used
- HTML
- CSS
- JavaScript

## Running locally (important for the PDF catalogue viewer)
Do **not** open `index.html` by double-clicking it (`file:///...`). Browsers block
PDF.js from reading local files that way, so the catalogue PDFs will fail with a
"Failed to load PDF" error. Serve the folder over HTTP instead:

```bash
# Option 1 — Python (already installed on most systems)
python3 -m http.server 8080

# Option 2 — Node
npx serve .
```

Then open `http://localhost:8080` in your browser. On the live domain
(skenllp.com) this is a non-issue since it's already served over HTTPS.

## License
© SkenLLP. All Rights Reserved.
