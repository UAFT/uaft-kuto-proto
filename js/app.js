window.UAFT = window.UAFT || {};

(async function(ns){
  const boot = await ns.api.bootstrap();
  ns.state.boot = boot;
  ns.state.currentUser = boot.currentUser;
  ns.state.role = boot.currentUser.role;
  ns.state.permissions = ns.getRoleCapabilities(boot.currentUser.role);

  const firstActive = boot.students.find(s => s.activeInGroup);
  ns.state.ui.selectedStudentId = firstActive ? firstActive.id : null;
  if (firstActive && firstActive.packages[0]){
    ns.state.ui.selectedPackageIdByStudent[firstActive.id] = firstActive.packages[0].id;
  }
  boot.students.forEach(s => {
    if (!ns.state.ui.selectedPackageIdByStudent[s.id] && s.packages[0]) {
      ns.state.ui.selectedPackageIdByStudent[s.id] = s.packages[0].id;
    }
  });

  ns.router.render();
})(window.UAFT);
