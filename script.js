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
    window.scene = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    window.camera = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    window.renderer = renderer;
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

exportBtn.addEventListener('click', async () => {
    // Change button state
    exportBtn.innerText = "Capturing...";
    exportBtn.style.opacity = "0.8";
    exportBtn.disabled = true;

    try {
        // Force internal GSAP elements to be completely visible simultaneously
        gsap.set('.stagger-el', { autoAlpha: 1, y: 0, overwrite: 'auto' });

        // Hide custom cursor during capture so user doesn't have to move it away
        const cursors = document.querySelectorAll('.cursor-dot, .cursor-ring');
        cursors.forEach(c => c.style.display = 'none');

        // Fix unreadable h1 text (html2canvas bugs out on background-clip: text)
        // Add deep text-shadows to push the text off the bright 3D backdrop geometries
        const headings = document.querySelectorAll('h1, h2');
        headings.forEach(h => {
            h.dataset.origBg = h.style.background || '';
            h.dataset.origClip = h.style.webkitBackgroundClip || '';
            h.dataset.origFill = h.style.webkitTextFillColor || '';
            h.dataset.origColor = h.style.color || '';
            h.dataset.origShadow = h.style.textShadow || '';
            
            h.style.background = 'none';
            h.style.webkitBackgroundClip = 'initial';
            h.style.webkitTextFillColor = 'initial';
            h.style.color = '#ffffff';
            h.style.textShadow = '0px 10px 40px rgba(0, 0, 0, 1), 0px 4px 10px rgba(0, 0, 0, 0.8)';
        });

        // Initialize PptxGenJS
        let pres = new PptxGenJS();
        pres.layout = 'LAYOUT_16x9';

        const sections = document.querySelectorAll('section');

        // Loop through each section, scroll to it, and capture the viewport
        for (let i = 0; i < sections.length; i++) {
            const sec = sections[i];
            
            // Align viewport exactly to the top of the section
            sec.scrollIntoView({ behavior: 'instant', block: 'start' });
            
            // Wait for scroll layout to shift and browser paint 
            await new Promise(r => setTimeout(r, 500));

            // Force WebGL to flush current scene to buffer so html2canvas can read it
            if (window.renderer && window.scene && window.camera) {
                window.renderer.render(window.scene, window.camera);
            }

            // Capture full bounds to guarantee zero cutoff at the bottom edges
            const rect = sec.getBoundingClientRect();
            const targetY = window.scrollY + rect.top;
            const captureHeight = rect.height > window.innerHeight ? rect.height : window.innerHeight;

            const canvasData = await html2canvas(document.body, {
                x: window.scrollX,
                y: targetY,
                width: window.innerWidth,
                height: captureHeight,
                scale: 2, 
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#050505',
            });

            let slide = pres.addSlide();
            slide.background = { color: '050505' };
            
            // Apply explicit full-stretch bounding mapped to the exact PPT layout
            // This prevents tall sections from being aggressively cropped off at the bottom,
            // while stretching slightly horizontal so it never "shrinks" into a tiny letterbox.
            slide.addImage({ 
                data: canvasData.toDataURL("image/png"), 
                x: 0, 
                y: 0, 
                w: '100%', 
                h: '100%' 
            });
        }

        exportBtn.innerText = "Saving PPTX...";
        await pres.writeFile({ fileName: "EraserGravity_Presentation.pptx" });
        
        exportBtn.innerText = "Downloaded!";
        exportBtn.style.opacity = "1";

    } catch (err) {
        console.error(err);
        exportBtn.innerText = "Error (See Console)";
        exportBtn.style.background = "#ff5f56";
    } finally {
        setTimeout(() => {
            // Restore context 
            window.scrollTo(0, 0);

            // Restore cursors
            document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(c => c.style.display = 'block');
            
            // Restore h1 styling
            document.querySelectorAll('h1, h2').forEach(h => {
                h.style.background = h.dataset.origBg;
                h.style.webkitBackgroundClip = h.dataset.origClip;
                h.style.webkitTextFillColor = h.dataset.origFill;
                h.style.color = h.dataset.origColor;
                h.style.textShadow = h.dataset.origShadow;
            });

            exportBtn.innerText = "Download PPTX";
            exportBtn.disabled = false;
        }, 3000);
    }
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
