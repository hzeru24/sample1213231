import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
let angle = 0;
const radius = 50;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  const geometry = new TextGeometry('Misskonasiya', {
    font: font,
    size: 5,
    height: 1,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.3,
    bevelSegments: 5
  });

  geometry.center();

  const material = new THREE.MeshStandardMaterial({ color: 0xfb06ff });
  const textMesh = new THREE.Mesh(geometry, material);
  textMesh.castShadow = true;
  textMesh.receiveShadow = true;
  scene.add(textMesh);
});

function updateCameraPosition() {
  camera.position.x = radius * Math.cos(angle);
  camera.position.z = radius * Math.sin(angle);
  camera.position.y = 20;
  camera.lookAt(0, 0, 0);
}

window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') angle += 0.05;
  if (e.key === 'ArrowLeft') angle -= 0.05;
  updateCameraPosition();
});

updateCameraPosition();

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
