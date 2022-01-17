// ==UserScript==
// @name         Danbooru Hide Saved
// @version      1.0
// @description  Add a button to hide faved images
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts?*
// ==/UserScript==

(async function() {
    'use strict';

    const func = async () => {
        Array.from(document.querySelectorAll('.post-unvote-link')).map(x => x.closest('article')).map(x => { x.style.display = x.style.display === 'none' ? 'block' : 'none'; return true; } );
    };

    const appendButton = (caption) => {
        const newButton = document.querySelector('#subnav-help').cloneNode(true);
        newButton.style.float = 'right';

        const newAnchor = newButton.childNodes[0];
        newAnchor.innerHTML = caption;
        newAnchor.setAttribute("href", "#");
        newAnchor.onclick = func;
        newAnchor.style.color = 'deeppink';

        const menu = document.querySelector("#subnav-menu");
        menu.appendChild(newButton);
    };

    appendButton('Hide Fav');
})();
