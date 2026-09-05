// ===============================
// ① .ts の機能を import
// ===============================
import { setupTapToPlace } from './tap-to-place.ts';
import { setupResetButton } from './reset-button.ts';
import { hideOnReady } from './hide-on-ready.ts';

// ===============================
// ② Three.js 基本セットアップ
// ===============================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('xrweb').appendChild(renderer.domElement);

// ===============================
// ライト
// ===============================
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 2, 3);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// ===============================
// ③ GLB 読み込み（AR_prd.glb）
// ===============================
let model;
const loader = new THREE.GLTFLoader();
loader.load('assets/AR_prd.glb', (gltf) => {
  model = gltf.scene;

  // Inspector と合わせる
  model.position.set(0, 0, 0);
  model.scale.set(3, 3, 3);

  scene.add(model);

  // ローディング非表示
  hideOnReady();

  // タップ配置機能
  setupTapToPlace(renderer, camera, scene, model);

  // リセットボタン
  setupResetButton(model);
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
  onUpdate: ({camera}) => {
    if (!model) return;

    const distance = camera.position.distanceTo(model.position);
    const scale = Math.max(0.5, 3.0 / distance);
    model.scale.set(scale, scale, scale);
  }
});

// ===============================
// 描画ループ
// ===============================
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
