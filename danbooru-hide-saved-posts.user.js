// ==UserScript==
// @name         Danbooru Hide Saved
// @version      1.4
// @description  Add a button to hide faved images
// @author       ImoutoChan
// @match        https://danbooru.donmai.us/posts*
// @downloadURL  https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-hide-saved-posts.user.js
// @updateURL    https://github.com/ImoutoChan/iqdb-autoselect/raw/master/danbooru-hide-saved-posts.user.js
// @license      MIT
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

    appendButton('Hide Saved', funcRed);
    appendButton('Hide Saved Relatives', funcGreen);
})();
