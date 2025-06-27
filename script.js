import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/geometries/TextGeometry.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(40, 30, 40);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// GUI controls
const gui = new GUI();
const params = {
  height: 2,
  color: '#800080',
  textureURL: ''
};

const textureLoader = new THREE.TextureLoader();
let textMesh;
let textMaterial;
let textGeometry;
let baseGeometry;

// Load font and build text
const loader = new FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
  textGeometry = new TextGeometry('Misskonasiya', {
    font,
    size: 5,
    height: params.height,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 2
  });
  textGeometry.center();
  baseGeometry = textGeometry;

  textMaterial = new THREE.MeshStandardMaterial({ color: params.color });
  textMesh = new THREE.Mesh(textGeometry, textMaterial);
  scene.add(textMesh);
});

// GUI Controls
gui.add(params, 'height', 0.5, 10).onChange(val => {
  if (!baseGeometry) return;
  scene.remove(textMesh);
  textGeometry = baseGeometry.clone();
  textGeometry = textGeometry.clone();
  textGeometry = new TextGeometry('Misskonasiya', {
    font: textGeometry.parameters.font,
    size: 5,
    height: val,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.2,
    bevelSegments: 2
  });
  textGeometry.center();
  textMesh.geometry.dispose();
  textMesh.geometry = textGeometry;
  textMesh.geometry.center();
  scene.add(textMesh);
});

gui.addColor(params, 'color').onChange(value => {
  if (textMaterial) textMaterial.color.set(value);
});

gui.add(params, 'textureURL').name('Texture URL').onFinishChange(url => {
  if (url.trim() === '') {
    textMaterial.map = null;
    textMaterial.needsUpdate = true;
    return;
  }
  textureLoader.load(url, tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    textMaterial.map = tex;
    textMaterial.needsUpdate = true;
  });
});

// Orbit control (← → arrows)
let angle = 0;
const radius = 40;
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') angle -= 0.05;
  if (e.key === 'ArrowLeft') angle += 0.05;
  camera.position.x = radius * Math.cos(angle);
  camera.position.z = radius * Math.sin(angle);
  camera.lookAt(0, 0, 0);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
