// ==========================================
// INTERNOCTO - PROFESSIONAL CHAOS PORTFOLIO
// Main JavaScript with Three.js 3D Model Integration
// ==========================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ==========================================
// GLOBAL VARIABLES
// ==========================================
let scene, camera, renderer, controls;
let octopusModel;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let scrollY = 0;

// Chaos Messages Configuration
const CHAOS_MESSAGES = [
    { scroll: 0, text: "Loading Chaos..." },
    { scroll: 100, text: "Eight Arms, Zero Clue" },
    { scroll: 300, text: "Deploying Bugs..." },
    { scroll: 500, text: "Coffee Levels Critical" },
    { scroll: 700, text: "Deleting Production DB..." },
    { scroll: 900, text: "Oops. Ctrl+Z not working." },
    { scroll: 1200, text: "Professional Chaos Engineer" }
];

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    init3DScene();
    initScrollAnimations();
    initNavigation();
    initFormHandling();
    initParallaxEffects();
    initSkillBars();

    // Initial message
    updateChaosMessage(0);
});

// ==========================================
// 3D SCENE SETUP
// ==========================================
function init3DScene() {
    const container = document.getElementById('canvas3d-fullscreen');

    if (!container) return;

    // Scene
    scene = new THREE.Scene();
    // Fog for depth - Darker for contrast
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    // Camera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 8);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: container,
        alpha: true,
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // ==========================================
    // LIGHTING (NEUTRAL STUDIO SETUP)
    // ==========================================

    // Ambient Light - Soft white base
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Main Key Light - White, from top-right
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    // Fill Light - Softer, from left
    const fillLight = new THREE.DirectionalLight(0xeef2ff, 1);
    fillLight.position.set(-5, 0, 5);
    scene.add(fillLight);

    // Rim Light - Subtle cool blue for edge definition (premium look)
    const rimLight = new THREE.SpotLight(0x4455ff, 2);
    rimLight.position.set(0, 5, -10);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    // Load GLB Model
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
        'Astronaut Octopus Model.glb',
        (gltf) => {
            octopusModel = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(octopusModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.5 / maxDim; // Reduced scale for better fit

            octopusModel.scale.set(scale, scale, scale);
            octopusModel.position.sub(center.multiplyScalar(scale));

            // Move down slightly for better visual centering
            octopusModel.position.y = -0.8;

            // Initial rotation setup (matches the "4 +" from your request)
            octopusModel.rotation.y = 4;

            scene.add(octopusModel);

            // Update message once loaded
            const msgEl = document.getElementById('chaos-text');
            if (msgEl) {
                msgEl.textContent = "Ready for Disaster";
                msgEl.classList.add('visible');
            }

            console.log('🐙 InternocTO loaded successfully!');
        },
        undefined,
        (error) => {
            console.error('Error loading model:', error);
        }
    );

    // Mouse move for parallax
    document.addEventListener('mousemove', onMouseMove);

    // Window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// ==========================================
// ANIMATION LOOP
// ==========================================
function animate() {
    requestAnimationFrame(animate);

    const container = document.getElementById('hero-3d');
    const spacer = document.getElementById('scroll-spacer');

    if (octopusModel && spacer && container) {
        const time = Date.now() * 0.001;

        // 1. Calculate Scroll Offset relative to the Spacer
        const maxScroll = spacer.offsetHeight;
        const scrollOffset = Math.max(0, Math.min(1, scrollY / maxScroll));

        // FAIL-SAFE: Hide the 3D container when we scroll past the spacer
        // We use a small buffer (0.99) to ensure it fades out smoothly at the end
        if (scrollY > maxScroll - 100) {
            container.style.opacity = '0';
        } else {
            container.style.opacity = '1';
        }

        // Update Chaos Messages based on progress
        updateChaosMessage(scrollOffset);

        // 2. Target Rotations (Based on your formula)
        // rotation.y = 4 + scroll.offset * Math.PI * 2
        const targetRotY = 4 + (scrollOffset * Math.PI * 2);

        // rotation.x = scroll.offset * Math.PI * 0.2
        const targetRotX = scrollOffset * Math.PI * 0.2;

        // 3. Float Effect (Based on Float component logic)
        const floatSpeed = 2;
        const floatIntensity = 0.1;
        const rotationIntensity = 0.05;

        const floatY = Math.sin(time * floatSpeed) * floatIntensity;
        const floatRotX = Math.cos(time * floatSpeed) * rotationIntensity;
        const floatRotZ = Math.sin(time * floatSpeed) * rotationIntensity;

        // 4. Apply with Damping
        const damping = 0.05;

        octopusModel.rotation.y += (targetRotY - octopusModel.rotation.y) * damping;

        // Combine scroll tilt + float wobble for X
        const finalTargetX = targetRotX + floatRotX;
        octopusModel.rotation.x += (finalTargetX - octopusModel.rotation.x) * damping;

        // Apply float wobble to Z
        octopusModel.rotation.z += (floatRotZ - octopusModel.rotation.z) * damping;

        // Apply float position (centered at -0.8)
        const baseY = -0.8;
        const targetY = baseY + floatY;
        octopusModel.position.y += (targetY - octopusModel.position.y) * damping;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// ==========================================
// EVENT HANDLERS
// ==========================================
function onMouseMove(event) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    const container = document.getElementById('canvas3d-fullscreen');
    if (!container || !camera || !renderer) return;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// ==========================================
// SCROLL ANIMATIONS & CHAOS MESSAGES
// ==========================================
function initScrollAnimations() {
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
        updateNavOnScroll();
        revealOnScroll();
        // Chaos message update is now in animate loop for smoother sync
    });
}

function updateChaosMessage(progress) {
    const msgEl = document.getElementById('chaos-text');
    if (!msgEl) return;

    // Map 0-1 progress to message index
    // CHAOS_MESSAGES has 7 items
    const index = Math.min(
        Math.floor(progress * CHAOS_MESSAGES.length),
        CHAOS_MESSAGES.length - 1
    );

    const newMessage = CHAOS_MESSAGES[index].text;

    if (msgEl.textContent !== newMessage) {
        msgEl.classList.remove('visible');
        setTimeout(() => {
            msgEl.textContent = newMessage;
            msgEl.classList.add('visible');
        }, 200);
    }
}

function updateNavOnScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    if (scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}

function revealOnScroll() {
    const elements = document.querySelectorAll('.about-card, .skill-card, .project-card, .timeline-item');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('fade-in', 'visible');
        }
    });
}

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Update active nav on scroll
    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollY >= sectionTop - 300) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Scroll button
    const scrollBtn = document.getElementById('scroll-btn');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// ==========================================
// PARALLAX EFFECTS
// ==========================================
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Parallax for floating shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ==========================================
// SKILL BARS ANIMATION
// ==========================================
function initSkillBars() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillFills = entry.target.querySelectorAll('.skill-fill');
                skillFills.forEach(fill => {
                    const width = fill.getAttribute('data-width');
                    setTimeout(() => {
                        fill.style.width = width + '%';
                    }, 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        const skillFills = document.querySelectorAll('.skill-fill');
        skillFills.forEach(fill => {
            fill.style.width = '0%';
        });
        observer.observe(skillsSection);
    }
}

// ==========================================
// FORM HANDLING
// ==========================================
function initFormHandling() {
    const form = document.getElementById('contact-form');
    const hireBtn = document.getElementById('hire-btn');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const name = formData.get('name');
            showNotification(`Thanks ${name}! 🐙 InternocTO will get back to you soon!`);
            form.reset();
        });
    }

    if (hireBtn) {
        hireBtn.addEventListener('click', () => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                contactSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #FF6600 0%, #FF8833 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(255, 102, 0, 0.4);
        z-index: 10000;
        font-weight: 600;
        max-width: 400px;
        animation: slideIn 0.5s ease-out;
    `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 500);
    }, 5000);
}

// ==========================================
// EASTER EGGS
// ==========================================
let clickCount = 0;
const logo = document.querySelector('.logo');

if (logo) {
    logo.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 5) {
            showNotification('🐙 You found the secret! InternocTO approves!');
            if (octopusModel) {
                // Spin effect
                const originalY = octopusModel.rotation.y;
                const spinInterval = setInterval(() => {
                    octopusModel.rotation.y += 0.5;
                }, 16);
                setTimeout(() => {
                    clearInterval(spinInterval);
                    octopusModel.rotation.y = originalY;
                }, 1000);
            }
            clickCount = 0;
        }
    });
}

console.log('%c🐙 Welcome to InternocTO\'s Portfolio!', 'color: #FF6600; font-size: 24px; font-weight: bold;');
