// ==UserScript==
// @name         Danbooru Recent Posts
// @version      1.4
// @description  Add a button to view recent most liked posts for current search
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts*
// @downloadURL  https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-recent-top-posts.user.js
// @updateURL    https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-recent-top-posts.user.js
// @license      MIT
// ==/UserScript==

(async function() {
    'use strict';

    const openRecent = async (plusTags) => {
        const tags = new URLSearchParams(window.location.search).get("tags");

        plusTags = plusTags.split(' ').filter(x => !tags.split(' ').some(y => y.split(':')[0] == x.split(':')[0])).join(' ')

        if (plusTags.length)
        {
            const newUrl = 'https://danbooru.donmai.us/posts?tags=' + tags + '%20' + plusTags;
            window.location.href = newUrl;
        }
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

    appendButton('Top Fav', () => openRecent('order:favcount age:..6month -animated'));
    appendButton('Top Score', () => openRecent('order:score age:..6month -animated'));
})();
