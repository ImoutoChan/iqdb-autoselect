// ==UserScript==
// @name         Danbooru Recent Posts
// @version      1.3
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

    const appendButton = (caption, tags) => {
        const newButton = document.querySelector("#subnav-menu li:last-child").cloneNode(true);
        newButton.style.float = 'right';

        const newAnchor = newButton.childNodes[0];
        newAnchor.innerHTML = caption;
        newAnchor.setAttribute("href", "#");
        newAnchor.onclick = () => openRecent(tags);
        newAnchor.style.color = 'deeppink';

        const menu = document.querySelector("#subnav-menu");
        menu.appendChild(newButton);
    };

    appendButton('Top Fav', 'order:favcount age:..6month -animated');
    appendButton('Top Score', 'order:score age:..6month -animated');
})();
