import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30, 40, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Grid
scene.add(new THREE.GridHelper(100, 20));

// GUI
const gui = new dat.GUI();
const params = {
  height: 10,
  color: '#fb06ff',
  textureURL: ''
};

let heightCtrl = null;
let colorCtrl = null;
let textureCtrl = null;

const textureLoader = new THREE.TextureLoader();
const defaultTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg');
defaultTexture.wrapS = defaultTexture.wrapT = THREE.RepeatWrapping;
defaultTexture.repeat.set(1, 4);

const buildings = [];
const blockSize = 5;
const spacing = 10;

// Generate buildings
for (let i = 0; i < blockSize; i++) {
  for (let j = 0; j < blockSize; j++) {
    const width = 5, depth = 5, height = Math.random() * 20 + 20;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xfb06ff, map: defaultTexture });
    const building = new THREE.Mesh(geometry, material);
    building.position.set(i * spacing, height / 2, j * spacing);
    building.userData = { baseHeight: height, textureURL: '' };
    buildings.push(building);
    scene.add(building);
  }
}

// Raycaster for click
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selected = null;

window.addEventListener('click', e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(buildings);
  if (intersects.length > 0) {
    selected = intersects[0].object;
    const base = selected.userData.baseHeight;
    const currentColor = '#' + selected.material.color.getHexString();
    const currentTexture = selected.userData.textureURL || '';

    params.height = base * selected.scale.y;
    params.color = currentColor;
    params.textureURL = currentTexture;

    if (heightCtrl) gui.remove(heightCtrl);
    if (colorCtrl) gui.remove(colorCtrl);
    if (textureCtrl) gui.remove(textureCtrl);

    heightCtrl = gui.add(params, 'height', 5, 100).onChange(val => {
      selected.scale.y = val / base;
      selected.position.y = (base * selected.scale.y) / 2;
    });

    colorCtrl = gui.addColor(params, 'color').onChange(val => {
      selected.material.color.set(val);
      selected.material.map = defaultTexture;
      selected.material.needsUpdate = true;
      selected.userData.textureURL = '';
    });

    textureCtrl = gui.add(params, 'textureURL').name('Custom Texture').onFinishChange(url => {
      if (!url.trim()) {
        selected.material.map = defaultTexture;
        selected.userData.textureURL = '';
      } else {
        textureLoader.load(url, tex => {
          tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(1, 4);
          selected.material.map = tex;
          selected.material.needsUpdate = true;
          selected.userData.textureURL = url;
        });
      }
    });
  }
});

// Light GUI
const lightFolder = gui.addFolder('Light Position');
lightFolder.add(light.position, 'x', -50, 50).name('X');
lightFolder.add(light.position, 'y', -50, 50).name('Y');
lightFolder.add(light.position, 'z', -50, 50).name('Z');
lightFolder.open();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
