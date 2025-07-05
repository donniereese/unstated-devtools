const script = document.createElement("script");
script.src = chrome.runtime.getURL("inject-script.js");
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);
