// ==UserScript==
// @name         IqdbSearchHotKey
// @version      2.2
// @description  Move mouse over image and press ctrl+q
// @author       ImoutoChan
//
// @match        *://*/*
//
// @grant        GM_openInTab
// @grant        GM_download
// @updateURL    https://raw.githubusercontent.com/ImoutoChan/iqdb-autoselect/master/iqdb-search-hotkey.js
// @downloadURL  https://raw.githubusercontent.com/ImoutoChan/iqdb-autoselect/master/iqdb-search-hotkey.js
// ==/UserScript==

(function() {
    'use strict';
    let hoverElem = null;

    const rebind = () => {
        const imgs = document.querySelectorAll('img');
        const as = document.querySelectorAll('a');
        const videos = document.querySelectorAll('video');

        Array.prototype.forEach.call(imgs, function(el, i){
            el.onmousemove = () => { hoverElem = el;};
        });
        Array.prototype.forEach.call(as, function(el, i){
            el.onmousemove = () => { hoverElem = el; };
        });
        Array.prototype.forEach.call(videos, function(el, i){
            el.onmousemove = () => { hoverElem = el; };
        });

        if (videos.length === 1) {
            hoverElem = videos[0];
        }

        if (imgs.length === 1) {
            hoverElem = imgs[0];
        }
    };

    const decodeHtml = (html) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    const observer = new MutationObserver(rebind);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    rebind();

    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && (String.fromCharCode(e.which) === 'q' || String.fromCharCode(e.which) === 'Q')) {
            const searchMatches = hoverElem.outerHTML.match(/https?:\/\/[^\/\s]+\/\S+\.(jpg|png|gif|jpeg|bmp)[^"]*/i);
            if (searchMatches !== null) {
                const urlString = searchMatches[0];
                const url = encodeURIComponent(decodeHtml(urlString));
                GM_openInTab("http://iqdb.org/?url=" + url, true);
            }
        } else if (e.ctrlKey && (e.altKey || e.shiftKey) && (String.fromCharCode(e.which) === 's' || String.fromCharCode(e.which) === 'S')) {
            const saveMatches = hoverElem.outerHTML.match(/https?:\/\/[^\/\s]+\/\S+\.(jpg|png|gif|jpeg|bmp|webm|mp4)/i);
            if (saveMatches !== null) {
                const url = saveMatches[0];
                const filename = url.substring(url.lastIndexOf('/') + 1);

                GM_download({ url: url, name: filename, saveAs: false });
            }
        }
    });
})();
