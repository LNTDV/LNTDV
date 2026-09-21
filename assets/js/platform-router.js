/* LNTDV PLATFORM ROUTER — 2026-09-21 */
(function(){
  'use strict';
  var ua=navigator.userAgent||'';
  var platform=navigator.platform||'';
  var isIOS=/iPhone|iPad|iPod/i.test(ua) || (platform==='MacIntel' && navigator.maxTouchPoints>1);
  var isAndroid=/Android/i.test(ua);
  var isWindows=/Windows/i.test(ua);
  var isMacOS=!isIOS && /Macintosh|Mac OS X/i.test(ua);
  var cls=isIOS?'platform-ios':isAndroid?'platform-android':isWindows?'platform-windows':isMacOS?'platform-macos':'platform-other';
  document.documentElement.classList.add(cls);
  document.body && document.body.classList.add(cls);
  window.LNTDVPlatform={name:cls.replace('platform-',''),ios:isIOS,android:isAndroid,windows:isWindows,macos:isMacOS};
})();
