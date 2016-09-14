import WordSearch from './scripts/wordsearch';
import './styles/app.scss';

(function() {
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
  }
})();

new WordSearch(document.getElementById('frame'),window.wordsearch);
