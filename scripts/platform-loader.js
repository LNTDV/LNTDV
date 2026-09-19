/* LNTDV — caricatore piattaforma separato */
(function(){
  "use strict";
  var ua=navigator.userAgent||"";
  var platform=navigator.platform||"";
  var isIOS=/iPhone|iPad|iPod/i.test(ua)||(platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var isAndroid=/Android/i.test(ua);
  var isMac=/Macintosh|Mac OS X/i.test(ua)&&!isIOS;
  var isWindows=/Windows/i.test(ua);
  var file=isIOS ? "platform-ios.js" : isAndroid ? "platform-android.js" : isMac ? "platform-macos.js" : isWindows ? "platform-windows.js" : "";
  if(!file) return;
  var current=document.currentScript;
  var src=current ? new URL(file,current.src).href : file;
  var s=document.createElement("script");
  s.src=src;
  s.defer=true;
  s.dataset.lntdvPlatform="true";
  document.head.appendChild(s);
})();