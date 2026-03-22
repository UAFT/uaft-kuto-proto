
export function getInitialRoute() {
  const hash = (window.location.hash || '').replace(/^#/, '');
  if (hash === 'student-profile' || hash === 'student-packages' || hash === 'event-journal') return hash;
  return 'kuto';
}

export function navigate(route) {
  window.location.hash = route;
}
