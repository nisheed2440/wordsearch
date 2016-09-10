import WordSearch from './scripts/wordsearch';
import {randomArray} from './scripts/utils';
import './styles/app.scss';

let wordlist = [
    "react",
    "angular",
    "routing",
    "scope",
    "json",
    "ajax",
    "svg",
    "functional",
    "canvas",
    "cookies",
    "webpack",
    "node",
    "github",
    "backbone",
    "jquery",
    "gulp",
    "grunt",
    "javascript",
    "async",
    "defer",
    "promise",
    "callback",
    "immutable",
    "prototype",
    "closure",
    "console",
    "redux"
];

let test = new WordSearch(document.getElementById('frame'), randomArray(wordlist,20));
