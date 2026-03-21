window.UAFT = window.UAFT || {};

(function(ns){
  const routes = {
    kuto: () => ns.screens.kuto.render()
  };

  function setRoute(route){
    ns.state.route = route;
    render();
  }

  function render(){
    const view = routes[ns.state.route] || routes.kuto;
    view();
  }

  ns.router = { setRoute, render };
})(window.UAFT);
