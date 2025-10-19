// ==UserScript==
// @name         Danbooru Open All Posts
// @version      1.4
// @description  Add a button to open all posts in tabs
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts*
// @downloadURL  https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-open-all-posts.user.js
// @updateURL    https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-open-all-posts.user.js
// @license      MIT
// @grant        GM_openInTab
// ==/UserScript==

(async function() {
    'use strict';

    const openAll = async () => {
        const imgs = [...document.querySelectorAll("a.post-preview-link")].map(x => x.getAttribute('href'));

        let i = 0;
        for (const img of imgs) {
            console.log('opening' + img);
            GM_openInTab("https://danbooru.donmai.us" + img);

            if (i++ > 8 && i % 10 === 0) {
                console.log('start wait');
                await new Promise(r => setTimeout(r, 20000));
                console.log('end wait');
            }
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

    appendButton("Open All", openAll);
})();
