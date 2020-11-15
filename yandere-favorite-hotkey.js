// ==UserScript==
// @name         Favorite F HotKey
// @version      1.0
// @description  Favorite post by pressing F
// @author       ImoutoChan
// @match        https://yande.re/post/show/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener("keydown", function(e) {
        if (String.fromCharCode(e.which) === 'f' || String.fromCharCode(e.which) === 'F') {
            document.querySelector("#add-to-favs > a").click();
        }
    });
})();
