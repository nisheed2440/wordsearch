import WordSearch from './scripts/wordsearch';
import './styles/app.scss';


if('serviceWorker' in window.navigator) {
    window.navigator.serviceWorker.register('service-worker.js');
}


new WordSearch(document.getElementById('frame'),window.wordsearch);
