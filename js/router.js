// js/router.js — UAFT KUTO Router
// Внутренняя маршрутизация между экранами mini-app

window.Router = (function () {
  const _screens = {};
  let _history = [];
  let _current = null;

  function register(name, renderFn) {
    _screens[name] = renderFn;
  }

  function navigate(name, params) {
    if (_current) {
      _history.push({ name: _current.name, params: _current.params });
    }
    _current = { name, params: params || {} };
    _render();
  }

  function back() {
    if (_history.length === 0) return;
    _current = _history.pop();
    _render();
  }

  function canGoBack() {
    return _history.length > 0;
  }

  function _render() {
    if (!_current || !_screens[_current.name]) return;
    const app = document.getElementById("app");
    app.innerHTML = "";
    _screens[_current.name](app, _current.params);
  }

  function getCurrent() {
    return _current;
  }

  return { register, navigate, back, canGoBack, getCurrent };
})();
