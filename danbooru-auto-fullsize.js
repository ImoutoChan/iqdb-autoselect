// ==UserScript==
//
// @name           DanbooruAutoFullsize
// @author         ImoutoChan
// @version        2.0
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
    if (document.querySelector(".imoutoExtHide") !== null || document.querySelector(".imoutoExtRelativeHide") !== null ||  document.querySelector(".notice-child") !== null) {
        log("saved or have relatives");
        return;
    }

    var regex = document.body.innerHTML.match(/\/data\/[0-9a-f]{32}\.[a-z]*/ig);
    var link = "https://danbooru.donmai.us" + regex[0];

    setTimeout(function() {
        window.location = link;
    }, 5000);
}

ready();
