/* LNTDV — caricatore piattaforma separato */
(function(){
  "use strict";
  var ua=navigator.userAgent||"";
  var platform=navigator.platform||"";
  var isIOS=/iPhone|iPad|iPod/i.test(ua)||(platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var isAndroid=/Android/i.test(ua);
  var isMac=/Macintosh|Mac OS X/i.test(ua)&&!isIOS;
  var isWindows=/Windows/i.test(ua);
  var src=isIOS ? "scripts/platform-ios.js" : isAndroid ? "scripts/platform-android.js" : isMac ? "scripts/platform-macos.js" : isWindows ? "scripts/platform-windows.js" : "";
  if(!src) return;
  var s=document.createElement("script");
  s.src=src;
  s.defer=true;
  s.dataset.lntdvPlatform="true";
  document.head.appendChild(s);
})();