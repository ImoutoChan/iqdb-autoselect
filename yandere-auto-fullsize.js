// ==UserScript==
//
// @name           YandereAutoFullsize
// @author         ImoutoChan
// @version        2.0
// @description    Auto load fullsize image
//
// @include        https://yande.re/post/show/*
// @include        http://yande.re/post/show/*
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
    console.log('yandere auto fullsize: ' + logtext);
}

function hasParent(document) {
    for (let notice of document.querySelectorAll(".status-notice")) {
       if (notice.innerHTML.indexOf("This post belongs to a ") > -1) {
           return true;
       }
    }
    return false;
}

function autoFullsize()
{
    if (document.querySelector(".imoutoExtHide") !== null || document.querySelector(".imoutoExtRelativeHide") !== null || hasParent(document) === true) {
        log("saved or has parent");
        return;
    }

    var regex = document.body.innerHTML.match(/https:\/\/files\.yande\.re\/image\/[\da-f]{32}\/[^\s"]*\.(png|jpeg|jpg)/g);
    var link = regex[0];

    setTimeout(function() {
        window.location = link;
    }, 5000);
}

ready();
