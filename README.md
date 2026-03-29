# EraserGravity: Website Presentation 🪐
![EraserGravity Overview](assets/hero.png) <!-- Assumes standard naming if a screenshot is generated, otherwise gracefully degrades -->

**EraserGravity** is a high-performance, single-page "scrollytelling" presentation web application. It was designed to visually and interactively pitch the concept of "Agentic AI for Automated Network-as-Code" combining the reasoning power of Antigravity AI with the visual determinism of Eraser.io.

> **Note**: This repository contains *only* the presentation website itself, not the backend agent/infrastructure logic. It is intended to be used directly in a browser as a modern alternative to traditional slide decks.

## ✨ Key Features
- **Scrollytelling UI**: Built on modern, dark-mode glassmorphism aesthetics (`#050505` background with `#00ffcc` hyper-cyan glowing accents).
- **Interactive 3D Background**: Utilizes `Three.js` for dynamic, interconnected node-physics particles that morph corresponding to scroll depth.
- **Scroll-Triggered Animations**: Powered by `GSAP` to orchestrate elegant fade-ins and scale animations as the audience scrolls. 
- **Offline PPTX Exporter**: Implements `PptxGenJS` to automatically compile and generate a fully-formatted 10-slide Microsoft PowerPoint (`.pptx`) version of the website content—calculated entirely client-side.
- **Zero Configuration**: No build-steps required (no Node modules, Vite, or Webpack).

## 🗂️ Presentation Sequence
The website strictly follows this narrative sequence:
1. **Hero**: Title Card
2. **The Problem**: Addressing static, decaying infrastructure diagrams.
3. **The Architecture**: The Agent Brain (Antigravity) + The Renderer (Eraser).
4. **Eraser.io Rendering Capabilities**: Showcasing Smart Elements, Rich Icons, and Bounding Groups.
5. **The Unlimited Bypass**: Extracting AI topology offline to bypass generation rate limits.
6. **Technical Installation**: IDE MCP Config, command line strings, and JSON binding payloads.
7. **Conclusion & Export**: Final messaging and local slide generation.

## 🚀 How to Run
Because it uses vanilla front-end technologies with CDN-hosted dependencies, running the site is frictionless:
1. Clone this repository or download the folder.
2. Open `index.html` in any modern web browser.
*(For optimal asset loading without CORS issues, you may use VS Code extensions like `Live Server`.)*

## 🛠️ Technology Stack
- **Structure**: Vanilla HTML5 
- **Styling**: Vanilla CSS3 (Custom Grid/Flexbox Layouts, Glassmorphism routines)
- **Logic**: Vanilla ES6 JavaScript
- **Libraries (via CDN)**:
   - [Three.js](https://threejs.org/) (WebGL 3D Engine)
   - [GSAP & ScrollTrigger](https://gsap.com/) (Web Animation Engine)
   - [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) (JavaScript to PPTX generator)

---
*Generated for the Antigravity Project Showcase.*
