// ==UserScript==
// @name         IqdbAutoselect
// @version      1.1
// @description  Auto select source site when found
// @author       ImoutoChan
// @include      https://iqdb.org/*
// @include      http://iqdb.org/*
// @grant        none
// ==/UserScript==

function ready() {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    autoselect();
  } else {
    document.addEventListener('DOMContentLoaded', autoselect);
  }
}

function log(logtext) {
    console.log('iqdb source selector: ' + logtext);
}

function getPriority(source) {
    switch(source) {
        case "yande.re":
            return 0;
        case "danbooru":
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

function autoselect() {
    if (document.querySelector(".imoutoExtHide") !== null || document.querySelector(".imoutoExtRelativeHide") !== null) {
        log("saved or have relatives");
        return;
    }


    if (document.querySelector("#pages").innerHTML.indexOf("No relevant matches") >= 0) {
        log("not found");
        return;
    }

    var entries = document.querySelectorAll("#pages > div > table > tbody");

    var foundEntries = [];
    for(var i = 1; i < entries.length; i++) {
        var current = entries[i];

        var source = current
            .querySelector("tr:nth-child(3) > td")
            .textContent
            .split(' ')[0]
            .trim()
            .toLowerCase();

        foundEntry = {
            link: current.querySelector("tr > td > a").getAttribute("href"),
            source: source,
            similarity: current.querySelector("tr:nth-child(5) > td").innerHTML,
            priority: getPriority(source)
        };

        foundEntries.push(foundEntry);
    }

    foundEntries.sort(function(a, b) {
        return a.priority - b.priority;
    });

    for(i = 0; i < foundEntries.length; i++) {
        log(foundEntries[i].source);
    }

    setTimeout(function() {
        window.location = foundEntries[0].link;
    }, 5000);
}

ready();
