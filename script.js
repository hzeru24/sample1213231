import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // white background

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
let angle = 0;
const radius = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Load Font and Create 3D Text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  const geometry = new TextGeometry('Misskonasiya', {
    font: font,
    size: 5,
    height: 1,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 3
  });

  geometry.center();

  const material = new THREE.MeshStandardMaterial({ color: 0x800080 }); // purple color
  const textMesh = new THREE.Mesh(geometry, material);
  scene.add(textMesh);
});

function updateCamera() {
  camera.position.set(
    radius * Math.cos(angle),
    20,
    radius * Math.sin(angle)
  );
  camera.lookAt(0, 0, 0);
}
updateCamera();

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') angle += 0.05;
  if (e.key === 'ArrowLeft')  angle -= 0.05;
  updateCamera();
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
