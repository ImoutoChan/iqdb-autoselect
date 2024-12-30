// ==UserScript==
// @name         Danbooru Hide Favs
// @version      1.3
// @description  Add a button to hide faved images
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts*
// @downloadURL  https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-hide-favorited-posts.user.js
// @updateURL    https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-hide-favorited-posts.user.js
// @license      MIT
// ==/UserScript==

(async function() {
    'use strict';

    const func = async () => {
        Array.from(document.querySelectorAll('.post-unvote-link')).map(x => x.closest('article')).map(x => { x.style.display = x.style.display === 'none' ? 'block' : 'none'; return true; } );
    };

    const appendButton = (caption) => {
        const newButton = document.querySelector("#subnav-menu li:last-child").cloneNode(true);
        newButton.style.float = 'right';

        const newAnchor = newButton.childNodes[0];
        newAnchor.innerHTML = caption;
        newAnchor.setAttribute("href", "#");
        newAnchor.onclick = func;
        newAnchor.style.color = 'deeppink';

        const menu = document.querySelector("#subnav-menu");
        menu.appendChild(newButton);
    };

    appendButton('Hide Favs');
})();
