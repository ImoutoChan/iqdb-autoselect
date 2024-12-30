// ==UserScript==
// @name         Danbooru Open All Posts
// @version      1.3
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


    const newButton = document.querySelector("#subnav-menu li:last-child").cloneNode(true);
    newButton.style.float = 'right';

    const newAnchor = newButton.childNodes[0];
    newAnchor.innerHTML = 'Open All';
    newAnchor.setAttribute("href", "#");
    newAnchor.onclick = openAll;
    newAnchor.style.color = 'deeppink';

    const menu = document.querySelector("#subnav-menu");
    menu.appendChild(newButton);
})();
