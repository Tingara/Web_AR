export function hideOnReady() {
  const loading = document.getElementById('loading');
  if (!loading) return;
  loading.style.display = 'none';
}
