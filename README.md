# FacePay UPI — Point, Scan & Pay with a Face

A browser-based FacePay UPI demonstration that uses the device camera and face-api.js to recognize a registered face and launch a UPI payment intent in supported mobile payment apps.

## Tech Stack

- HTML5 / CSS3 / JavaScript
- @vladmandic/face-api
- SSD MobileNet face detection
- 68-point face landmarks
- Face recognition descriptors
- Browser Camera API (`getUserMedia`)
- UPI deep links for supported payment apps

## Run locally

Use a local HTTPS server or localhost. Do not open `index.html` directly with `file://` because browser camera access and model/image loading can fail.

For example, with Python:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

Allow camera access when prompted.

## Deploy with Netlify

This repository is configured as a static site with `netlify.toml`.

1. Upload the project to GitHub.
2. In Netlify, choose **Add new project → Import an existing project**.
3. Select the GitHub repository.
4. Build command: leave blank.
5. Publish directory: `.`
6. Deploy.
7. Open the generated HTTPS URL on a phone and allow camera permission.

## Important

This is a demonstration/prototype. Face images and the UPI ID are currently stored in client-side files, so they are publicly accessible in a deployed static site. Do not use this architecture for real financial authentication or production payments. A production system should move identity/payment data to a secure backend and use an authorized payment/UPI integration.
