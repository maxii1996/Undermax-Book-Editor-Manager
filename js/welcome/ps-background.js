
document.addEventListener('DOMContentLoaded', function() {
    initPlayStationBackground();

    setupMouseInteraction();
});


function initPlayStationBackground() {
    let wavesContainer = document.querySelector('.ps-waves-container');
    if (!wavesContainer) {
        wavesContainer = document.createElement('div');
        wavesContainer.className = 'ps-waves-container';
        document.querySelector('.welcome-body').prepend(wavesContainer);
        
        for (let i = 0; i < 4; i++) {
            const wave = document.createElement('div');
            wave.className = 'ps-wave';
            wavesContainer.appendChild(wave);
        }
    }
    
    let particlesContainer = document.querySelector('.ps-particles-container');
    if (!particlesContainer) {
        particlesContainer = document.createElement('div');
        particlesContainer.className = 'ps-particles-container';
        document.querySelector('.welcome-body').prepend(particlesContainer);
        
        createParticles(40);
    }
    
    let spotlight = document.querySelector('.ps-spotlight');
    if (!spotlight) {
        spotlight = document.createElement('div');
        spotlight.className = 'ps-spotlight';
        document.querySelector('.welcome-body').prepend(spotlight);
    }
}

/**
 * Create individual particle elements
 * @param {number} count - Number of particles to create
 */
function createParticles(count) {
    const container = document.querySelector('.ps-particles-container');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'ps-particle';
        
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        positionParticleRandomly(particle);
        
        particle.style.animationDuration = (Math.random() * 6 + 6) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        
        container.appendChild(particle);
    }
}

/**
 * Position a particle element randomly within the container
 * @param {HTMLElement} particle - The particle DOM element
 */
function positionParticleRandomly(particle) {
    const xPos = Math.random() * 100;
    const yPos = Math.random() * 100;
    
    particle.style.left = xPos + '%';
    particle.style.top = yPos + '%';
    
    const scale = Math.random() * 0.8 + 0.2;
    const brightness = Math.random() * 0.7 + 0.3;
    
    particle.style.transform = `scale(${scale})`;
    particle.style.opacity = brightness;
}

/**
 * Setup interactive mouse movement effects
 */
function setupMouseInteraction() {
    const welcomeBody = document.querySelector('.welcome-body');
    const spotlight = document.querySelector('.ps-spotlight');
    
    if (!welcomeBody || !spotlight) return;
    
    welcomeBody.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        const xPercent = mouseX / window.innerWidth * 100;
        const yPercent = mouseY / window.innerHeight * 100;
        
        requestAnimationFrame(() => {
            spotlight.style.background = `radial-gradient(
                circle at ${xPercent}% ${yPercent}%, 
                rgba(103, 58, 235, 0.15), 
                transparent 60%
            )`;
        });
        
        moveParticlesWithMouse(mouseX, mouseY);
    });
}

/**
 * Move particles slightly based on mouse position for parallax effect
 * @param {number} mouseX - Mouse X position
 * @param {number} mouseY - Mouse Y position
 */
function moveParticlesWithMouse(mouseX, mouseY) {
    const particles = document.querySelectorAll('.ps-particle');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const offsetX = (mouseX - centerX) / centerX * 20;
    const offsetY = (mouseY - centerY) / centerY * 20;
    
    particles.forEach((particle, index) => {
        if (index % 3 === 0) {
            const particleDepth = parseFloat(particle.style.opacity || 0.5);
            const moveFactorX = offsetX * particleDepth;
            const moveFactorY = offsetY * particleDepth;
            
            requestAnimationFrame(() => {
                particle.style.transform = `translate(${moveFactorX}px, ${moveFactorY}px) scale(${particle.dataset.scale || 1})`;
            });
        }
    });
}