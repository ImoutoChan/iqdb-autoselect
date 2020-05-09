// ==UserScript==
//
// @name           DanbooruAutoFullsize
// @author         ImoutoChan
// @version        2.4
// @description    Auto load fullsize image
//
// @include        https://danbooru.donmai.us/posts/*
// @include        http://danbooru.donmai.us/posts/*
//
// ==/UserScript==

function ready() {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    autoFullsize();
  } else {
    document.addEventListener('DOMContentLoaded', autoFullsize);
  }
}

function log(logtext) {
    console.log('danbooru auto fullsize: ' + logtext);
}

function autoFullsize()
{
    if (document.querySelector(".imoutoExtHide") !== null
        || document.querySelector(".imoutoExtRelativeHide") !== null
        || document.querySelector(".post-notice-child") !== null) {
        log("saved or has parent");
        return;
    }

    var regex = document.body.innerHTML.match(/[^"'\s]*\/data\/[0-9a-f]{32}\.[a-z0-9]*/ig);
    var link = regex[0];

    if (link.startsWith('/')) {
        link = "https://danbooru.donmai.us" + link;
    }

    setTimeout(function() {
        window.location = link;
    }, 5000);
}

ready();
