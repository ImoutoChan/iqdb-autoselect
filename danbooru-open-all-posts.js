// ==UserScript==
// @name         Danbooru Open All Posts
// @version      1.1
// @description  Add a button to open all posts in tabs
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts?*
// @grant        GM_openInTab
// ==/UserScript==

(async function() {
    'use strict';

    const openAll = async () => {
        const imgs = [...document.querySelectorAll("article.post-preview > a")].map(x => x.getAttribute('href'));

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


    const newButton = document.querySelector('#subnav-help').cloneNode(true);
    newButton.style.float = 'right';

    const newAnchor = newButton.childNodes[0];
    newAnchor.innerHTML = 'Open All';
    newAnchor.setAttribute("href", "#");
    newAnchor.onclick = openAll;
    newAnchor.style.color = 'deeppink';

    const menu = document.querySelector("#subnav-menu");
    menu.appendChild(newButton);
})();
