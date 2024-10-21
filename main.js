import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Set up basic Three.js scene
const canvas = document.getElementById('mri-viewer');
const renderer = new THREE.WebGLRenderer({ canvas });
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 2;

const totalSlices = 251;
var currentSlice = 114;

const textureLoader = new THREE.TextureLoader();
const planes = [];

// Create planes for all slices
for (let i = 1; i <= totalSlices; i++) {
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.z = (i - 1) * 0.01 - 1; // Stack planes with a small offset 
    scene.add(plane);
    planes.push(plane);
}

// Set up camera rotation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.update();

function loadSlice(sliceNumber) {
    const slicePath = `mri-slices/output_${sliceNumber}.png`;
    textureLoader.load(slicePath, (texture) => {
        planes[sliceNumber - 1].material.map = texture;
        planes[sliceNumber - 1].material.opacity = 1;
        planes[sliceNumber - 1].material.needsUpdate = true;
    });
}

// Load initial slices
for (let i = 1; i <= currentSlice; i++) {
    loadSlice(i);
}

canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const delta = Math.sign(event.deltaY) * -1;
    currentSlice += delta;
    
    if (currentSlice < 1) currentSlice = 1;
    if (currentSlice > totalSlices) currentSlice = totalSlices;
    
    if (delta > 0) {
        // Scrolling down, load new slice
        loadSlice(currentSlice);
    } else {
        // Scrolling up, hide the slice
        planes[currentSlice].material.opacity = 0;
        planes[currentSlice].material.needsUpdate = true;
    }
    
    console.log(`Current Slice: ${currentSlice}`);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.setSize(600, 600);
    renderer.render(scene, camera);
}

animate();
