# ⏳ Your Life in Numbers

A viral web app that shows in real time how much you've lived: seconds, heartbeats,
breaths, full moons seen, your age on other planets and much more.

Designed to be **shared on Facebook / TikTok / WhatsApp**, **free to host**, and able to
handle **thousands of concurrent users** (it's a static site served from a CDN).

---

## ✅ Features

- 100% browser-side: **no server, no database, no AI keys**.
- Real-time calculations with live ticking counters.
- Personalized shareable links (your name shows up in the result).
- Advertising slots **ready** for Google AdSense.
- Privacy page included (required by AdSense).
- Mobile-first.

---

## 🔌 How to connect your services

You only need to edit **one file**: [`config.js`](config.js).

### 1. Google AdSense (to earn money)
> ⚠️ First you need an AdSense account **approved** by Google. Approval requires the
> site to already be online and to have a Privacy page (already included).

Once you have the codes, in `config.js`:
```js
adsense: {
  enabled: true,                       // <-- turn on
  publisherId: "ca-pub-1234567890",    // <-- your publisher ID
  autoAds: true                        // Google places the ads automatically
}
```

### 2. Google Analytics (optional — to see your visits)
```js
analytics: {
  enabled: true,
  measurementId: "G-ABCDEFGHIJ"        // <-- your ID
}
```

---

## 🚀 How to put it online (free)

Recommended option: **GitHub Pages** or **Cloudflare Pages**.
1. Upload these files to a GitHub repository.
2. Enable GitHub Pages (Settings → Pages → branch `main`).
3. Your site will be online at `https://yourname.github.io/repo-name/`.

> Want your own domain like `yourlife.com`? It can be connected later (~$10/year).

---

## 🧪 Try it locally

Just open `index.html` with a double click, or start a local server:
```bash
python -m http.server 8000
```
then go to `http://localhost:8000`.

---

## 📁 Project files

| File | What it does |
|------|--------------|
| `index.html` | The main page |
| `style.css` | Styling and layout |
| `script.js` | All the calculations and counters |
| `config.js` | **The only file you edit** (AdSense / Analytics) |
| `privacy.html` | Privacy policy (required by AdSense) |
