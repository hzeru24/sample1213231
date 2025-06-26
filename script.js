const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const grid = new THREE.GridHelper(100, 20);
scene.add(grid);

const gui = new dat.GUI();
const buildingParams = {
  height: 10,
  color: '#fb06ff',
  textureURL: ''
};
let heightCtrl = null;
let colorCtrl = null;
let textureCtrl = null;

const buildings = [];
const defaultColor = 0xfb06ff;
const blockSize = 5;
const spacing = 10;
const textureLoader = new THREE.TextureLoader();

const windowTexture = textureLoader.load('https://threejs.org/examples/textures/brick_diffuse.jpg'); // replace with any tileable window image
windowTexture.wrapS = windowTexture.wrapT = THREE.RepeatWrapping;
windowTexture.repeat.set(1, 4);

for (let i = 0; i < blockSize; i++) {
  for (let j = 0; j < blockSize; j++) {
    const width = 5;
    const depth = 5;
    const height = Math.random() * 20 + 20;

    const geom = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: defaultColor,
      map: windowTexture
    });

    const building = new THREE.Mesh(geom, mat);
    building.position.set(i * spacing, height / 2, j * spacing);
    building.userData.baseHeight = height;
    building.userData.textureURL = '';

    scene.add(building);
    buildings.push(building);
  }
}

camera.position.set(30, 40, 50);
camera.lookAt(scene.position);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedBuilding = null;

window.addEventListener('click', e => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(buildings);

  if (hits.length) {
    selectedBuilding = hits[0].object;

    const baseH = selectedBuilding.userData.baseHeight;
    const currentColor = '#' + selectedBuilding.material.color.getHexString();
    const currentTexture = selectedBuilding.userData.textureURL || '';

    buildingParams.height = baseH * selectedBuilding.scale.y;
    buildingParams.color = currentColor;
    buildingParams.textureURL = currentTexture;

    if (heightCtrl) gui.remove(heightCtrl);
    if (colorCtrl) gui.remove(colorCtrl);
    if (textureCtrl) gui.remove(textureCtrl);

    heightCtrl = gui.add(buildingParams, 'height', 5, 100).onChange(v => {
      selectedBuilding.scale.y = v / baseH;
      selectedBuilding.position.y = (baseH * selectedBuilding.scale.y) / 2;
    });

    colorCtrl = gui.addColor(buildingParams, 'color').onChange(value => {
      selectedBuilding.material.color.set(value);
      selectedBuilding.material.map = windowTexture;
      selectedBuilding.material.needsUpdate = true;
      selectedBuilding.userData.textureURL = '';
    });

    textureCtrl = gui.add(buildingParams, 'textureURL').name('Custom Texture URL').onFinishChange(url => {
      if (url.trim() === '') {
        selectedBuilding.material.map = windowTexture;
        selectedBuilding.userData.textureURL = '';
        selectedBuilding.material.needsUpdate = true;
        return;
      }
      textureLoader.load(url, tex => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 4);
        selectedBuilding.material.map = tex;
        selectedBuilding.userData.textureURL = url;
        selectedBuilding.material.needsUpdate = true;
      });
    });
  }
});

const lightFolder = gui.addFolder('Light Position');
lightFolder.add(light.position, 'x', -50, 50).name('X');
lightFolder.add(light.position, 'y', -50, 50).name('Y');
lightFolder.add(light.position, 'z', -50, 50).name('Z');
lightFolder.open();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
