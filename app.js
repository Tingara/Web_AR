// ===============================
// XR8 の Three.js シーンを取得
// ===============================
let xrScene = null;

XR8.addCameraPipelineModules([
  XR8.GlTextureRenderer.pipelineModule(),
  XR8.Threejs.pipelineModule(),
  {
    name: 'xr-init',
    onStart: () => {
      xrScene = XR8.Threejs.xrScene();   // XR8 の renderer / scene / camera を取得
      startApp();                        // Three.js ロジック開始
    }
  }
]);

// ===============================
// Three.js ロジック本体
// ===============================
function startApp() {
  const scene = xrScene.scene;
  const camera = xrScene.camera;
  const renderer = xrScene.renderer;

  // ライト
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(1, 2, 3);
  scene.add(dirLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // GLB 読み込み
  let model;
  const loader = new THREE.GLTFLoader();
  loader.load('assets/AR_prd.glb', (gltf) => {
    model = gltf.scene;
    model.position.set(0, 0, 0);
    model.scale.set(3, 3, 3);
    scene.add(model);

    hideOnReady();
    setupTapToPlace(model, camera, scene);
    setupResetButton(model);
  });

  // 距離スケール
  XR8.addCameraPipelineModule({
    name: 'scale-by-distance',
    onUpdate: ({ camera }) => {
      if (!model) return;
      const distance = camera.position.distanceTo(model.position);
      const scale = Math.max(0.5, 3.0 / distance);
      model.scale.set(scale, scale, scale);
    }
  });

  // 描画ループ（XR8 の renderer を使う）
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

// ===============================
// タップ配置
// ===============================
function setupTapToPlace(model, camera, scene) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      model.position.copy(intersects[0].point);
    }
  });
}

// ===============================
// リセットボタン
// ===============================
function setupResetButton(model) {
  const button = document.createElement('button');
  button.innerText = 'リセット';
  button.style.position = 'absolute';
  button.style.bottom = '20px';
  button.style.left = '20px';
  button.style.zIndex = '10';
  document.body.appendChild(button);

  const initialPos = model.position.clone();
  const initialScale = model.scale.clone();

  button.addEventListener('click', () => {
    model.position.copy(initialPos);
    model.scale.copy(initialScale);
  });
}

// ===============================
// ローディング非表示
// ===============================
function hideOnReady() {
  const loading = document.getElementById('loading');
  if (loading) loading.style.display = 'none';
}
