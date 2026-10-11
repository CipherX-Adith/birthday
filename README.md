# 🎂 Happy Birthday, Bestie! 🎉

An interactive, aesthetic, and memorable birthday celebration web experience designed with smooth animations, custom sound effects, interactive mini-games, and heartfelt surprises.

---

## ✨ Features

- 🏹 **Interactive Bow & Arrow Landing**: Pull back the bow and aim at the floating heart balloon to trigger an explosion of celebratory confetti and reveal the surprise page.
- 🎵 **Background Music & Collapsible Speaker Widget**:
  - Plays the celebratory *"Happy Birthday"* song (`sub_clair-happy-birthday-592177.mp3`).
  - **Minimalist Hover-Expand Pill**: By default, only the round speaker icon (`🔊`) is shown to preserve clean aesthetics. Hovering with the cursor smoothly expands it to reveal animated equalizer waves and track information.
  - **Instant Silence Toggle**: One-click mute/unmute to silence or resume music anytime.
- 💌 **A Letter Written in the Stars**: Interactive constellation night-sky section that assembles shimmering stars into a heartfelt note.
- 📸 **Polaroid Memory Collage**: Elegant photo grid displaying favorite memories with realistic tilts and hover effects.
- 🎂 **Interactive Birthday Cake**: Make a wish and blow out the flickering candle flames by tapping the button.
- 🎁 **Secret Gift Chamber**: A 3D-styled gift box with opening lid animation that unveils a private hidden message.
- 📱 **Mobile & Desktop Responsive**: Beautifully tuned for all screen sizes and touch devices.

---

## 🚀 Live Demo / Quick Start

Simply open `index.html` in any modern web browser or serve it with any local static server:

```bash
# Using Node.js (npx)
npx serve .

# Or using Python 3
python -m http.server 3000
```

Then visit `http://localhost:3000` in your browser.

---

## 📁 Project Structure

```text
├── index.html                           # Landing page & main experience container
├── bestie.html                          # The surprise birthday showcase & story sections
├── style.css                            # Complete CSS design system & animations
├── script.js                            # Interactive canvas, physics, sound & transitions
├── sub_clair-happy-birthday-592177.mp3  # Background birthday song
├── photos/                              # Folder for custom memory photos
│   ├── gallery1.jpg - gallery6.jpg      # Custom photos (falls back to placeholder)
│   └── README.md
├── assets/                              # Vector graphics and fallback assets
└── .gitignore                           # Git ignore rules
```

---

## 🎨 Customization

1. **Add Custom Photos**:
   Place your images in the `photos/` folder named `gallery1.jpg`, `gallery2.jpg`, etc.
2. **Change the Music**:
   Replace `sub_clair-happy-birthday-592177.mp3` or update the `<source>` tag in `index.html`.
3. **Personalize the Wishes**:
   Edit the messages and names in `bestie.html` and `script.js` to tailor it to your best friend!

---

## 🛠️ Built With

- **HTML5** & **Canvas API** (for physics and particles)
- **Vanilla CSS3** (Glassmorphism, 3D Transforms, Responsive Grid)
- **Vanilla JavaScript** (Modular interactive controls)
- **Font Awesome 6** & **Google Fonts** (*Playfair Display*, *Sacramento*, *DM Sans*, *Cormorant Garamond*)

---

Made with ❤️ to celebrate an unforgettable birthday!
