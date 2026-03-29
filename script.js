// --- CUSTOM CURSOR ---
const cursorRing = document.querySelector('.cursor-ring');
const cursorDot = document.querySelector('.cursor-dot');

document.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';

    // Add slight lag to the ring for smoothness
    setTimeout(() => {
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top = e.clientY + 'px';
    }, 50);
});

document.addEventListener('mousedown', () => {
    cursorRing.style.transform = 'translate(-50%, -50%) scale(0.8)';
    cursorRing.style.backgroundColor = 'rgba(0, 255, 204, 0.1)';
});

document.addEventListener('mouseup', () => {
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorRing.style.backgroundColor = 'transparent';
});

// Hover effect for interactive elements
const interactiveEls = document.querySelectorAll('button, a');
interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
        cursorRing.style.borderColor = '#fff';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '40px';
        cursorRing.style.height = '40px';
        cursorRing.style.borderColor = 'var(--accent)';
    });
});


// --- THREE.JS BACKGROUND ---
const initThreeJS = () => {
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Particles
    const particlesCount = 100;
    const positions = new Float32Array(particlesCount * 3);
    const velocities = [];

    for (let i = 0; i < particlesCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 150;     // x
        positions[i + 1] = (Math.random() - 0.5) * 150;   // y
        positions[i + 2] = (Math.random() - 0.5) * 100;   // z

        velocities.push({
            x: (Math.random() - 0.5) * 0.05,
            y: (Math.random() - 0.5) * 0.05,
            z: (Math.random() - 0.5) * 0.05
        });
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        size: 0.5,
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffcc,
        transparent: true,
        opacity: 0.15
    });

    // We'll update lines dynamically in the animation loop
    let linesMesh;

    // Section-specific 3D Objects
    const sectionObjects = [];
    const geometries = [
        new THREE.IcosahedronGeometry(10, 0),         // Sec 1
        new THREE.TorusGeometry(8, 2, 16, 50),        // Sec 2
        new THREE.OctahedronGeometry(10, 0),          // Sec 3
        new THREE.TetrahedronGeometry(10, 0),         // Sec 4
        new THREE.TorusKnotGeometry(6, 1.5, 64, 8),   // Sec 5
        new THREE.SphereGeometry(8, 16, 16),          // Sec 6
        new THREE.DodecahedronGeometry(10, 0)         // Sec 7
    ];

    const objMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffcc,
        wireframe: true,
        transparent: true,
        opacity: 0
    });

    geometries.forEach((geo, i) => {
        const mesh = new THREE.Mesh(geo, objMaterial.clone());
        const side = i % 2 === 0 ? 1 : -1;
        mesh.position.set(side * 28, -20, 0);
        mesh.scale.set(0.01, 0.01, 0.01);
        scene.add(mesh);
        sectionObjects.push(mesh);
    });
    window.sectionObjects = sectionObjects;

    const animate = () => {
        requestAnimationFrame(animate);

        const positions = particles.geometry.attributes.position.array;

        // Update positions based on velocity
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            positions[i3] += velocities[i].x;
            positions[i3 + 1] += velocities[i].y;
            positions[i3 + 2] += velocities[i].z;

            // Bounds check
            if (Math.abs(positions[i3]) > 75) velocities[i].x *= -1;
            if (Math.abs(positions[i3 + 1]) > 75) velocities[i].y *= -1;
            if (Math.abs(positions[i3 + 2]) > 50) velocities[i].z *= -1;
        }

        particles.geometry.attributes.position.needsUpdate = true;

        // Rotate entire scene slightly
        scene.rotation.y += 0.0005;
        scene.rotation.x += 0.0002;

        // Rotate section objects
        if (window.sectionObjects) {
            window.sectionObjects.forEach(obj => {
                obj.rotation.x += 0.005;
                obj.rotation.y += 0.005;
            });
        }

        // Interconnect nodes that are close
        if (linesMesh) scene.remove(linesMesh);

        const linePositions = [];
        for (let i = 0; i < particlesCount; i++) {
            for (let j = i + 1; j < particlesCount; j++) {
                const i3 = i * 3;
                const j3 = j * 3;

                const dx = positions[i3] - positions[j3];
                const dy = positions[i3 + 1] - positions[j3 + 1];
                const dz = positions[i3 + 2] - positions[j3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 15) {
                    linePositions.push(
                        positions[i3], positions[i3 + 1], positions[i3 + 2],
                        positions[j3], positions[j3 + 1], positions[j3 + 2]
                    );
                }
            }
        }

        if (linePositions.length > 0) {
            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            linesMesh = new THREE.LineSegments(lineGeo, lineMaterial);
            scene.add(linesMesh);
        }

        renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

initThreeJS();


// --- GSAP SCROLL ANIMATIONS ---
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('section').forEach((sec, i) => {
    const els = sec.querySelectorAll('.stagger-el');
    gsap.set(els, { autoAlpha: 0, y: 50 });

    const animateIn = () => {
        gsap.to(els, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", overwrite: "auto" });
        if (window.sectionObjects && window.sectionObjects[i]) {
            const obj = window.sectionObjects[i];
            gsap.to(obj.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.4)", overwrite: "auto" });
            gsap.to(obj.material, { opacity: 0.8, duration: 1, overwrite: "auto" });
            gsap.to(obj.position, { y: 0, duration: 1.5, ease: "power3.out", overwrite: "auto" });
        }
    };

    const animateOut = (direction) => {
        const yOffset = direction === 1 ? 20 : -20;
        gsap.to(els, { y: 50, autoAlpha: 0, duration: 0.5, overwrite: "auto" });
        if (window.sectionObjects && window.sectionObjects[i]) {
            const obj = window.sectionObjects[i];
            gsap.to(obj.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 0.8, ease: "power2.in", overwrite: "auto" });
            gsap.to(obj.material, { opacity: 0, duration: 0.5, overwrite: "auto" });
            gsap.to(obj.position, { y: yOffset, duration: 0.8, ease: "power2.in", overwrite: "auto" });
        }
    };

    ScrollTrigger.create({
        trigger: sec,
        start: "top 75%",
        end: "bottom 25%",
        onEnter: () => animateIn(),
        onLeave: () => animateOut(1),
        onEnterBack: () => animateIn(),
        onLeaveBack: () => animateOut(-1)
    });
});


// Demo section removed. Proceeding to Export logic.


// --- PPTX EXPORT LOGIC ---
const exportBtn = document.getElementById('exportBtn');

exportBtn.addEventListener('click', () => {
    // Change button state
    exportBtn.innerText = "Generating...";
    exportBtn.style.opacity = "0.8";

    // Initialize PptxGenJS
    let pres = new PptxGenJS();

    // Common styles
    const bgProps = { color: '0A0A0F' };
    const titleProps = { x: 0.5, y: 0.8, w: '90%', fontSize: 36, color: '00FFCC', bold: true, fontFace: 'Outfit' };
    const bodyProps = { x: 0.5, y: 1.8, w: '90%', fontSize: 18, color: 'FFFFFF', fontFace: 'Outfit', lineSpacing: 30 };

    // Function to create a standard slide
    const createSlide = (title, bodyText) => {
        let slide = pres.addSlide();
        slide.background = bgProps;
        slide.addText(title, titleProps);
        if (Array.isArray(bodyText)) {
            // List
            slide.addText(bodyText.map(t => ({ text: t })), { ...bodyProps, bullet: { type: 'number' } });
        } else {
            slide.addText(bodyText, bodyProps);
        }
        return slide;
    };

    // 10 Slides mapped from the 7 sections

    // Slide 1: Hero
    let slide1 = pres.addSlide();
    slide1.background = bgProps;
    slide1.addText("EraserGravity", { x: '10%', y: '35%', w: '80%', fontSize: 54, color: 'FFFFFF', bold: true, align: 'center', fontFace: 'Outfit' });
    slide1.addText("Agentic AI for Automated Network-as-Code", { x: '10%', y: '50%', w: '80%', fontSize: 24, color: '00FFCC', align: 'center', fontFace: 'Outfit' });
    slide1.addText("Raymundo De Borja III", { x: '10%', y: '65%', w: '80%', fontSize: 16, color: '666666', align: 'center', fontFace: 'Outfit' });

    // Slide 2: The Problem - Context
    createSlide("The Problem: Static Diagrams", "Modern infrastructure moves at the speed of code, yet our diagrams remain frozen in time. Manual drag-and-drop networking tools create a dangerous disconnect between live environments and documentation.");

    // Slide 3: The Problem - Impact
    createSlide("The Problem: Incident Resolution", "When visual intent and deployed reality drift apart, resolving incidents becomes an exercise in archaeology. We need architecture diagrams that are generated, not drawn.");

    // Slide 4: The Architecture - Overview
    createSlide("The Architecture", "A hybrid workflow designed for absolute precision and speed bridging intelligent context with deterministic rendering.");

    // Slide 5: The Architecture - Components
    let slide5 = createSlide("Architecture Components", "");
    slide5.addText("The Brain (Antigravity Agent)\nContext-aware LLM reasoning parsing user prompt topology into logical networks.", { x: 0.5, y: 1.8, w: '40%', fontSize: 16, color: 'FFFFFF', fontFace: 'Outfit' });
    slide5.addText("The Renderer (Eraser.io)\nTransforms raw, generated Domain Specific Language (DSL) into stunning architectural visualizations instantly.", { x: 5.0, y: 1.8, w: '45%', fontSize: 16, color: 'FFFFFF', fontFace: 'Outfit' });

    // Slide 6: Eraser.io Rendering Capabilities
    createSlide("Eraser.io Rendering Engine", [
        "Smart Elements: Automatically maps concepts to standard networking shapes.",
        "Rich Icons: Supports thousands of tech-stack icons directly embedded into nodes.",
        "Group Boundaries: Beautiful grouping bounding-boxes for subnets."
    ]);

    // Slide 7: The Unlimited Bypass
    createSlide("The Unlimited Bypass", "Eraser.io imposes a 5-credit limit for its native AI diagram generation.\n\nBy leveraging our local Agent's superior reasoning, we construct the Eraser DSL string entirely client-side. We then pass this pure code string to Eraser's standard rendering pipeline, completely bypassing the AI paywall. Infinite generation, zero cost.");

    // Slide 8: Technical Installation - Command
    createSlide("Technical Setup: MCP Integration", "Zero-friction setup. Plug the context engine straight into your environment using the CLI.\n\nCommand:\n$ npx skills add eraserlabs/eraser-io");

    // Slide 9: Technical Installation - Config
    createSlide("Technical Setup: Configuration", "mcp.json snippet:\n\n\"mcpServers\": {\n  \"eraser\": {\n    \"command\": \"npx\",\n    \"args\": [ \"-y\", \"@eraserlabs/mcp-server\" ]\n  }\n}");

    // Slide 10: Conclusion
    let slide10 = pres.addSlide();
    slide10.background = bgProps;
    slide10.addText("Conclusion", { ...titleProps, align: 'center' });
    slide10.addText("EraserGravity bridges the gap between infrastructure thought and visual reality. By merging agentic generation with deterministic rendering, architecture diagrams are no longer drawn—they are deployed.", { x: 1, y: 2, w: '80%', fontSize: 24, color: 'FFFFFF', align: 'center', fontFace: 'Outfit' });

    // Save the File
    pres.writeFile({ fileName: "EraserGravity_Presentation.pptx" }).then(() => {
        exportBtn.innerText = "Downloaded!";
        exportBtn.style.opacity = "1";
        setTimeout(() => {
            exportBtn.innerText = "Download PPTX";
        }, 3000);
    }).catch((err) => {
        console.error(err);
        exportBtn.innerText = "Error (See Console)";
        exportBtn.style.background = "#ff5f56";
    });
});

// --- COPY TO CLIPBOARD LOGIC ---
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const contentToCopy = btn.getAttribute('data-clipboard');
        navigator.clipboard.writeText(contentToCopy).then(() => {
            const originalText = btn.innerText;
            btn.innerText = 'Copied!';
            btn.style.background = 'var(--accent)';
            btn.style.color = '#000';

            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = 'rgba(255,255,255,0.1)';
                btn.style.color = 'var(--text-muted)';
            }, 2000);
        });
    });
});
