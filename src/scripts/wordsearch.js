import $ from 'jquery';
import Word from './word';
import {
    isMobile,
    encrypt,
    decrypt,
    randomArray,
    ml,
    gi,
    gic
} from './utils';

let wordsAdded = 0;
let wordsSolved = {};
let words = [];
let wordlist = [];
let cypher = '';
export default class WordSearch {
    constructor(gridEl = document.body, wordList = [], gridX = 11, gridY = 17) {
        this.gridEl = gridEl;
        this.grid = {
            x: gridX,
            y: gridY
        };
        cypher = wordList[0];
        wordList = randomArray(wordList.slice(1, wordList.length), 20);
        //Decrypt here
        for (let i = 0; i < wordList.length; i++) {
            wordlist.push(decrypt(wordList[i], cypher));
        }
        wordsAdded = wordlist.length;
        this.isMobile = isMobile();
        this.selection = false;
        this.alphabet = "abcdefghijklmnopqrstuvwxyz";

        $(this.gridEl).html('').addClass('loading');
        $(this.gridEl).on('cfc', (evt) => {
            wordsAdded--;
        });
        this.drawGrid();
        this.startTimer();
        setTimeout(() => {
            this.placeWords();
        }, 500);
    }
    drawGrid() {
        //Draw the grid
        for (let y = 0; y < this.grid.y; y++) {
            let newGridRow = $(`<div class="grid-row grid-row-${y}"></div>`);
            for (let x = 0; x < this.grid.x; x++) {
                let newGridItem = $(`<div unselectable="on" id="grid-item-${x}-${y}" class="noselect grid-item grid-row-item-${x} grid-item-${x}-${y}"></div>`);
                newGridItem.html(ml(this.alphabet.charAt(Math.random() * 26)));
                newGridItem.css("visibility", "hidden");
                newGridRow.append(newGridItem);
            }
            newGridRow.append('<div class="anchor"></div>');
            $(this.gridEl).append(newGridRow);
        }
        $(this.gridEl).append('<div class="anchor"></div>');
        $('.game-footer').append('<button class="grid-submit flex" type="button" disabled="">submit</button>');
        if (this.isMobile) {
            this.gridEl.addEventListener('touchstart', this.onGridItemTouchStart.bind(this));
            this.gridEl.addEventListener('touchmove', this.onGridItemTouchMove.bind(this));
            this.gridEl.addEventListener('touchend', this.onGridItemTouchEnd.bind(this));
            document.querySelector('.grid-submit').addEventListener('touchstart', this.onGridSubmit.bind(this));
        }
    }
    getWords() {
        //Decrypt any encrypted words here.
        if (!wordlist.length) {
            $.ajax({
                url: '',
                success: (result) => {
                    //Retrieved data
                    wordlist = result;
                },
                error: () => {
                    //Retrieved error
                }
            });
        }
    }
    placeWords() {
        //Place words in the grid
        for (let i in wordlist) {
            let w = new Word(wordlist[i], i, this.grid, this.gridEl);
            words.push(w);
        }
        $(this.gridEl).removeClass('loading');
        $(".grid-item").css("visibility", "visible");
    }
    gameOver() {
        alert("Puzzle Complete!");
        //Show submit modal
    }
    drawGridLine(start, end) {
        let x0 = parseInt(start.x);
        let y0 = parseInt(start.y);
        let x1 = parseInt(end.x);
        let y1 = parseInt(end.y);

        let dx = Math.abs(x1 - x0)
        let dy = Math.abs(y1 - y0)
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;
        this.selection.dist = 0;
        while (true) {
            this.selection.dist++;
            gi(x0, y0).addClass('highlighted');
            if (x0 == x1 && y0 == y1) {
                break;
            }
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }
    onGridItemTouchStart(evt) {
        let e = evt.touches[0];
        let gridItem = gic(e.pageX, e.pageY, this.gridEl);
        gridItem.addClass('highlighted');
        let gridItemId = gridItem.attr('id');
        if (gridItemId) {
            let parts = gridItemId.split('-');
            this.selection = {
                dist: 0
            };
            this.selection.start = {
                item: gridItem,
                x: parts[2],
                y: parts[3]
            };
        }

        evt.preventDefault();
        return false;
    }
    onGridItemTouchMove(evt) {
        if (this.selection == false) {
            return;
        }
        let e = evt.touches[0];
        let gridItem = gic(e.pageX, e.pageY, this.gridEl);
        let gridItemId = gridItem.attr('id');
        if (gridItemId) {
            let parts = gridItemId.toString().split('-');
            this.selection.current = {
                item: gridItem,
                x: parts[2],
                y: parts[3]
            };
            $('.highlighted').removeClass('highlighted');
        }
        //drawline
        this.drawGridLine(this.selection.start, this.selection.current);

        evt.preventDefault();
        return false;
    }

    onGridItemTouchEnd(evt) {
        let e = evt.touches[0];
        let allSolved = true;
        for (let i in words) {
            if (words[i].check() && words[i].valid && this.selection.dist === words[i].len) {
                words[i].solve();
                wordsSolved[words[i].id] = true;
                //Minimum 5 words
                if (Object.keys(wordsSolved).length >= 5) {
                    document.querySelector('.grid-submit').disabled = false;
                }
            }
            if (!words[i].solved) {
                allSolved = false;
            }
        }
        this.selection = false;
        $('.highlighted').removeClass('highlighted');
        if (allSolved) {
            this.gameOver();
        }

        evt.preventDefault();
        return false;
    }
    onGridSubmit(evt) {
        evt.preventDefault();
        if (!evt.target.disabled) {
            let confirmation;
            if (wordsAdded > 5 && Object.keys(wordsSolved).length < wordsAdded) {
                confirmation = window.confirm('There are more words to be found. Are you sure you want to submit?');
                if (confirmation !== true) {
                    return;
                }
            }
            let encWordsAdded = encrypt(wordsAdded.toString(), cypher);
            let encWordsSolved = encrypt(Object.keys(wordsSolved).length.toString(), cypher);
            //Ajax to the backend goes here2
            $.post("/submit", {
                    eWA: encWordsAdded,
                    eWS: encWordsSolved,
                    sT: cypher,
                })
                .done(function() {
                    //On Ajax success redirect
                    window.location.href = '/final';
                })
                .fail(function() {
                    alert("An error occured! Please try submitting again.");
                });
        } else {
            alert('You need to solve at least five words before submitting');
            return;
        }
    }
    startTimer() {
        let totalSeconds = 0;
        setInterval(countTimer, 1000);

        function countTimer() {
            ++totalSeconds;
            let hour = pad(Math.floor(totalSeconds / 3600));
            let minute = pad(Math.floor((totalSeconds - hour * 3600) / 60));
            let seconds = pad(totalSeconds - (hour * 3600 + minute * 60));

            document.querySelector('.game-timer').innerHTML = hour + ":" + minute + ":" + seconds;
        }

        function pad(val) {
            let valString = val + "";
            if (valString.length < 2) {
                return "0" + valString;
            } else {
                return valString;
            }
        }
    }
};