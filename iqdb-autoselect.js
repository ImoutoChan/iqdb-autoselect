// ==UserScript==
// @name         Iqdb Autoselect
// @version      1.3
// @description  Auto select best match when found
// @author       ImoutoChan
// @match        https://iqdb.org/*
// @match        http://iqdb.org/*
// @grant        none
// ==/UserScript==

function ready() {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
        autoselectDelay();
    } else {
        document.addEventListener('DOMContentLoaded', autoselectDelay);
    }
}

function log(logtext) {
    console.log('iqdb source selector: ' + logtext);
}

function getPriority(source) {
    switch (source) {
        case "danbooru":
            return 0;
        case "yande.re":
            return 1;
        case "sankaku":
            return 2;
        case "gelbooru":
            return 3;
        case "konachan":
            return 4;
        case "e-shuushuu":
            return 5;
        case "anime-pictures":
            return 6;
        case "zerochan":
            return 6;
        // the anime gallery
        case "the":
            return 7;
        default:
            return 8;
    }
}

function autoselectDelay() {
    setTimeout(function () {
        autoselect();
    }, 1000);
}

function autoselect() {
    if (document.querySelector("#pages .imoutoExtHide") !== null || document.querySelector("#pages .imoutoExtRelativeHide") !== null) {
        log("saved or have relatives");
        return;
    }

    if (document.querySelector("#pages").innerHTML.indexOf("No relevant matches") >= 0) {
        log("not found");
        return;
    }

    const entries = document.querySelectorAll("#pages > div > table > tbody");

    const foundEntries = [];
    for (let i = 1; i < entries.length; i++) {
        const current = entries[i];

        const source = current
            .querySelector("tr:nth-child(3) > td")
            .textContent
            .split(' ')[0]
            .trim()
            .toLowerCase();

        const foundEntry = {
            link: current.querySelector("tr > td > a").getAttribute("href"),
            source: source,
            similarity: current.querySelector("tr:nth-child(5) > td").innerHTML,
            size: current.querySelector("tr:nth-child(4) > td").innerHTML,
            priority: getPriority(source)
        };

        foundEntries.push(foundEntry);
    }

    foundEntries.sort(function (a, b) {
        const sizeRegex = /(?<width>\d+)×(?<height>\d+)/;

        const aSize = a.size.match(sizeRegex).groups;
        const bSize = b.size.match(sizeRegex).groups;

        const higherASize = aSize.width > bSize.width && aSize.height > bSize.height;

        if (higherASize)
            return -100;

        const higherBSize = bSize.width > aSize.width && bSize.height > aSize.height;
        if (higherBSize)
            return 100;

        const higherPriority = a.priority - b.priority;
        return higherPriority;
    });

    for (let i = 0; i < foundEntries.length; i++) {
        log(JSON.stringify(foundEntries[i], null, 2));
    }

    setTimeout(function () {
        //window.location = foundEntries[0].link;
    }, 1);
}

ready();
