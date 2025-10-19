// ==UserScript==
// @name         Danbooru Hide Favs
// @version      1.4
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

    const appendButton = (caption, func) => {
        const menu = document.querySelector("#subnav-menu");
        const firstRight = menu.querySelector(".ml-auto, .ms-auto");
        const newButton = document.querySelector("#subnav-menu a:last-child").cloneNode(true);

        newButton.textContent = caption;
        newButton.href = "#";
        newButton.onclick = func;
        newButton.style.color = 'deeppink';

        if (!firstRight) {
            newButton.style.marginLeft = "auto";
            newButton.classList.add("ml-auto");
        }

        menu.appendChild(newButton);
        cleanUp();
    };

    const cleanUp = () => {
        const menu = document.querySelector("#subnav-menu");
        const autos = Array.from(menu.querySelectorAll('.ml-auto, .ms-auto'));

        let kept = false;
        for (const el of autos) {
            if (!kept) {
                kept = true;
            } else {
                el.style.marginLeft = "unset";
                el.classList.remove('ml-auto');
            }
        }
    };

    appendButton('Hide Favs', func);
})();
