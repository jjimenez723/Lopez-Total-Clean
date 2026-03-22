// GSAP and THREE are globally available via CDN
gsap.registerPlugin(ScrollTrigger);

// ==========================================
// Unsplash API Integration
// ==========================================
// Vite will inject environment variables here if run via npm run dev
const UNSPLASH_API_KEY = import.meta.env?.VITE_UNSPLASH_API_KEY || '';

async function fetchUnsplashImages() {
  const imageElements = document.querySelectorAll('.service-card .img-container img');
  const queries = ['house%20cleaning', 'commercial%20cleaning', 'deep%20cleaning'];
  
  if (!UNSPLASH_API_KEY || UNSPLASH_API_KEY === 'YOUR_KEY_HERE') {
    console.warn("No Unsplash API Key found. Using placeholder images. Please add VITE_UNSPLASH_API_KEY to your .env file.");
    return;
  }

  try {
    const promises = queries.map(query => 
      fetch(`https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${UNSPLASH_API_KEY}`)
        .then(res => {
          if (!res.ok) throw new Error("Unsplash API Rate Limit or Invalid Key");
          return res.json();
        })
    );
    
    const results = await Promise.all(promises);
    
    imageElements.forEach((img, index) => {
      if (results[index] && results[index].urls) {
        // Add a smooth fade out/in effect when replacing image
        gsap.to(img, {
          opacity: 0, duration: 0.3, onComplete: () => {
            img.src = results[index].urls.regular;
            img.alt = results[index].alt_description || queries[index];
            gsap.to(img, {opacity: 1, duration: 0.5});
          }
        });
      }
    });
  } catch (error) {
    console.error("Error fetching images from Unsplash API:", error);
  }
}

// Call on load
fetchUnsplashImages();


// ==========================================
// Three.js Background Setup
// ==========================================
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f7fa);
scene.fog = new THREE.FogExp2(0xf5f7fa, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.z = 30;

// Creating a subtle floating particle system (dust/bubbles)
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 700;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 100;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Premium soft blue particles
const material = new THREE.PointsMaterial({
  size: 0.15,
  color: 0x0056b3,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

// Add some subtle floating spheres
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({
  color: 0xe6f0fa,
  transparent: true,
  opacity: 0.5
});

const spheres = [];
for (let i = 0; i < 5; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.x = (Math.random() - 0.5) * 40;
  sphere.position.y = (Math.random() - 0.5) * 40;
  sphere.position.z = (Math.random() - 0.5) * 40;
  
  // Random speeds
  sphere.userData = {
    xRot: Math.random() * 0.01,
    yRot: Math.random() * 0.01,
    ySpd: (Math.random() - 0.5) * 0.05
  };
  
  scene.add(sphere);
  spheres.push(sphere);
}

// Mouse interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX / window.innerWidth - 0.5;
  mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  particlesMesh.rotation.y = elapsedTime * 0.05 + (mouseX * 0.1);
  particlesMesh.rotation.x = elapsedTime * 0.02 + (mouseY * 0.1);

  spheres.forEach(sphere => {
    sphere.rotation.x += sphere.userData.xRot;
    sphere.rotation.y += sphere.userData.yRot;
    sphere.position.y += Math.sin(elapsedTime) * 0.01;
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// ENHANCED GSAP Animations
// ==========================================

// Initial Intro Animation
const tl = gsap.timeline();

// Staggered reveal for Navbar
tl.from('.navbar .logo-container', { x: -50, opacity: 0, duration: 1, ease: 'power3.out' })
  .from('.navbar .nav-links a', { y: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }, "-=0.5")
  .from('.hero-title', { y: 50, opacity: 0, scale: 0.9, duration: 1.2, ease: 'expo.out' }, "-=0.3")
  .from('.hero-subtitle', { y: 30, opacity: 0, duration: 1, ease: 'power2.out' }, "-=0.8")
  .from('.hero-btn', { y: 20, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, "-=0.5")
  .from(particlesMesh.position, { y: -30, duration: 2, ease: 'power2.out' }, "-=1.5");

// Enhanced Scroll Animations
gsap.utils.toArray('.service-card').forEach((card, i) => {
  const img = card.querySelector('img');
  
  // Card Entrance
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    y: 80,
    rotationX: 15,
    opacity: 0,
    duration: 1,
    delay: i * 0.15,
    ease: 'power3.out'
  });

  // Image Parallax Effect
  gsap.to(img, {
    scrollTrigger: {
      trigger: card,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1
    },
    y: () => 20,
    scale: 1.15,
    ease: 'none'
  });
});

gsap.from('.section-header h2', {
  scrollTrigger: {
    trigger: '.services',
    start: 'top 80%'
  },
  y: 40,
  opacity: 0,
  duration: 1,
  ease: 'back.out(1.5)'
});

gsap.from('.about-content', {
  scrollTrigger: {
    trigger: '.about',
    start: 'top 75%'
  },
  scale: 0.5,
  rotationY: 15,
  opacity: 0,
  duration: 1.2,
  ease: 'elastic.out(1, 0.5)'
});

gsap.from('.cta h2', {
  scrollTrigger: { trigger: '.cta', start: 'top 85%' },
  y: 50, opacity: 0, duration: 1, ease: 'power3.out'
});
gsap.from('.cta-btn', {
  scrollTrigger: { trigger: '.cta', start: 'top 80%' },
  scale: 0.8, opacity: 0, duration: 0.6, ease: 'back.out(2)', delay: 0.3
});

// Parallax for ThreeJS canvas based on scroll
ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    camera.position.y = -(self.progress * 25);
    particlesMesh.rotation.z = self.progress * 0.5;
  }
});

// ==========================================
// Booking Form Handling
// ==========================================
const bookingForm = document.getElementById('booking-form');
const submitBtn = document.getElementById('submit-btn');
const formSuccess = document.getElementById('form-success');
const formError = document.getElementById('form-error');

if (bookingForm) {
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button to prevent double submission
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Optional: Hide previous messages
    formSuccess.classList.add('hidden');
    formError.classList.add('hidden');

    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    // Send to N8N webhook
    const webhookUrl = import.meta.env?.VITE_N8N_WEBHOOK_URL || 'YOUR_N8N_WEBHOOK_URL_HERE';
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Success
        bookingForm.classList.add('hidden');
        formSuccess.classList.remove('hidden');
        
        // GSAP animation for the success message (ensure GSAP is loaded)
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(formSuccess, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
          );
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Submission Error:', error);
      formError.classList.remove('hidden');
    } finally {
      // Re-enable button
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}
