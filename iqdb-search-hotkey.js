// ==UserScript==
// @name         IqdbSearchHotKey
// @version      1.1
// @description  Move mouse over image and press ctrl+q
// @author       ImoutoChan
//
// @match        *://*/*
//
// @grant        GM.openInTab
// ==/UserScript==

(function() {
    'use strict';

    var hoverElem = null;

    function rebind()     {
        var imgs = document.querySelectorAll('img');
        var as = document.querySelectorAll('a');

        Array.prototype.forEach.call(imgs, function(el, i){
            el.onmousemove = () => { hoverElem = el;};
        });
        Array.prototype.forEach.call(as, function(el, i){
            el.onmousemove = () => { hoverElem = el; };
        });
    }

    var observer = new MutationObserver(rebind);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    rebind();

    document.onkeydown = function(e) {
        if (e.ctrlKey && (String.fromCharCode(e.which) === 'q' || String.fromCharCode(e.which) === 'Q')) {
            var res = hoverElem.outerHTML.match(/https?:\/\/[^\/\s]+\/\S+\.(jpg|png|gif|jpeg|bmp)/i);
            if (res !== null) {
                var urlString = res[0];
                GM.openInTab("http://iqdb.org/?url=" + encodeURIComponent(urlString));
            }
        }
    };
})();
