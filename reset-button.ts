export function setupResetButton(model: THREE.Object3D) {
  const button = document.createElement('button');
  button.innerText = 'リセット';
  button.style.position = 'absolute';
  button.style.bottom = '20px';
  button.style.left = '20px';
  document.body.appendChild(button);

  const initialPosition = model.position.clone();
  const initialScale = model.scale.clone();

  button.addEventListener('click', () => {
    model.position.copy(initialPosition);
    model.scale.copy(initialScale);
  });
}
