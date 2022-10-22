// ==UserScript==
// @name         Danbooru Hide Saved
// @version      1.2
// @description  Add a button to hide faved images
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts?*
// ==/UserScript==

(async function() {
    'use strict';

    const funcRed = async () => {
        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        const articles = [
            ...Array.from(document.querySelectorAll('.post-preview-image.imoutoExtHide')).map(x => x.closest('article'))
            ];

        articles.filter(onlyUnique).map(x => { x.style.display = x.style.display === 'none' ? 'block' : 'none'; x.parentNode.removeChild(x); return true; } );
    };

    const funcGreen = async () => {
        const onlyUnique = (value, index, self) => {
            return self.indexOf(value) === index;
        }

        const articles = [
            ...Array.from(document.querySelectorAll('.post-preview-image.imoutoExtRelativeHide')).map(x => x.closest('article'))
            ];

        articles.filter(onlyUnique).map(x => { x.style.display = x.style.display === 'none' ? 'block' : 'none'; x.parentNode.removeChild(x); return true; } );
    };

    const appendButton = (caption, func) => {
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

    appendButton('Hide Saved', funcRed);
    appendButton('Hide Saved Relatives', funcGreen);
})();
