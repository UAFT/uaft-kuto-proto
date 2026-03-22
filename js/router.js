export function getInitialRoute() {
  const hash = (window.location.hash || '').replace(/^#/, '');
  if (hash === 'student-profile' || hash === 'student-packages' || hash === 'event-journal') return hash;
  return 'kuto';
}

export function navigate(route) {
  if (!route) route = 'kuto';
  window.location.hash = route === 'kuto' ? '' : route;
}
