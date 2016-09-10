import AES from 'crypto-js/aes';
import SHA1 from 'crypto-js/sha1';
import UTF8 from 'crypto-js/enc-utf8';
import $ from 'jquery';

function randomArray(arr, count) {
    let shuffled = arr.slice(0),
        i = arr.length,
        min = i - count,
        temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
}

function isMobile() {
    return (window.navigator.userAgent.match(/iPad|iPhone|android/i) != null);
}

function cypher() {
    return SHA1('&copy;SapientNitro' + new Date().getFullYear()).toString();
}

function encrypt(word) {
    if (typeof word === 'string') {
        word = AES.encrypt(word, cypher()).toString();
    }
    return word;
}

function decrypt(word) {
    if (typeof word === 'string') {
        word = AES.decrypt(word, cypher()).toString(UTF8);
    }
    return word;
}
//make letter
function ml(letter) {
    return `<div unselectable='on' class='letter noselect'>${letter.toUpperCase()}</div>`;
}
//Get grid item
function gi(x, y) {
    return $(`.grid-item-${x}-${y}`);
}
//get grid item by coordinates
function gic(x, y, gridEl) {
    let c = $(gridEl).offset();
    let xX = Math.floor((x - c.left) / ($('.grid-item').width() + 2));
    let yY = Math.floor((y - c.top) / ($('.grid-item').height() + 2));
    return gi(xX, yY);
}
//Add css rule
function addRule(gridX) {
    if (isMobile()) {
        var width = Math.floor((window.innerWidth - 2) / gridX);
        var css = `.grid-item {width:${width}px;height:${width}px}`,
            head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        style.id = 'test';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
    }
}

export {
    isMobile,
    encrypt,
    decrypt,
    ml,
    gi,
    gic,
    randomArray,
    addRule
};