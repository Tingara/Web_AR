// 画面タップでモデルの位置を更新する簡易版
export function setupTapToPlace(renderer: THREE.WebGLRenderer, camera: THREE.Camera, scene: THREE.Scene, model: THREE.Object3D) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
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
