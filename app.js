// ===============================
// ① Three.js 基本セットアップ
// ===============================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('xrweb').appendChild(renderer.domElement);

// ===============================
// ② ライト
// ===============================
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(1, 2, 3);
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambLight);

// ===============================
// ③ GLB 読み込み（AR_prd.glb）
// ===============================
let model;
const loader = new THREE.GLTFLoader();

loader.load('assets/AR_prd.glb', (gltf) => {
  model = gltf.scene;

  // Niantic Studio の Inspector と合わせる
  model.position.set(0, 0, 0);
  model.scale.set(3, 3, 3);

  scene.add(model);

  // ローディング非表示
  hideOnReady();

  // タップで配置できるようにする
  setupTapToPlace();

  // リセットボタンを有効化
  setupResetButton();
});

// ===============================
// ④ XR8 パイプライン
// ===============================
XR8.addCameraPipelineModules([
  XR8.GlTextureRenderer.pipelineModule(),
  XR8.Threejs.pipelineModule(),
]);

// ===============================
// ⑤ 距離スケール（近づくと大きく）
// ===============================
XR8.addCameraPipelineModule({
  name: 'scale-by-distance',
  onUpdate: ({ camera }) => {
    if (!model) return;

    const distance = camera.position.distanceTo(model.position);
    const scale = Math.max(0.5, 3.0 / distance);
    model.scale.set(scale, scale, scale);
  },
});

// ===============================
// ⑥ タップでモデルを配置する処理
// ===============================
function setupTapToPlace() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    if (!model) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      model.position.copy(point);
    }
  });
}

// ===============================
// ⑦ リセットボタン（元の位置・スケールに戻す）
// ===============================
function setupResetButton() {
  if (!model) return;

  const button = document.createElement('button');
  button.innerText = 'リセット';
  button.style.position = 'absolute';
  button.style.bottom = '20px';
  button.style.left = '20px';
  button.style.padding = '8px 16px';
  button.style.fontSize = '16px';
  button.style.zIndex = '10';
  document.body.appendChild(button);

  const initialPosition = model.position.clone();
  const initialScale = model.scale.clone();

  button.addEventListener('click', () => {
    model.position.copy(initialPosition);
    model.scale.copy(initialScale);
  });
}

// ===============================
// ⑧ ローディング非表示
// ===============================
function hideOnReady() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  loading.style.display = 'none';
}

// ===============================
// ⑨ 描画ループ
// ===============================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
