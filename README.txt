UAFT KUTO modular shell based on the approved final monolithic KUTO index.

Entry point:
- index.html

Modules:
- js/app.js
- js/router.js
- js/api.js
- js/state.js
- js/screens/kuto.js
- js/screens/student-profile.js
- js/screens/student-packages.js
- js/screens/event-journal.js

Styles:
- styles/main.css
- styles/kuto.css
- styles/student-profile.css

Demo role switch via query string:
- ?role=student
- ?role=trainer
- ?role=admin
- ?role=director

Current status:
- KUTO screen is live and carries over the approved final UI/logic from the monolithic version.
- student-profile / packages / journal are placeholders for the next stage.
- Backend integration should be wired through js/api.js and consumed in js/screens/kuto.js.


V16: fixed header layout so Add Student button spans full width below header and Journal stays in right half.
