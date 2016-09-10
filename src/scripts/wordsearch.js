import $ from 'jquery';
import Word from './word';
import {
    isMobile,
    encrypt,
    decrypt,
    ml,
    gi,
    gic
} from './utils';
let wordsNotAdded = 0;
let words = [];

export default class WordSearch {
    constructor(gridEl = document.body, wordList = [], gridX = 11, gridY = 17) {
        this.gridEl = gridEl;
        this.grid = {
            x: gridX,
            y: gridY
        };
        this.wordList = wordList;
        this.isMobile = isMobile();
        this.selection = false;
        this.alphabet = "abcdefghijklmnopqrstuvwxyz";

        $(this.gridEl).html('').addClass('loading');
        $(this.gridEl).on('cfc', (evt) => {
            wordsNotAdded++;
        });
        this.drawGrid();
        this.placeWords();
    }
    drawGrid() {
        //Draw the grid
        for (let y = 0; y < this.grid.y; y++) {
            let newGridRow = $(`<div class="grid-row grid-row-${y}"></div>`);
            for (let x = 0; x < this.grid.x; x++) {
                let newGridItem = $(`<div unselectable="on" id="grid-item-${x}-${y}" class="noselect grid-item grid-row-item-${x} grid-item-${x}-${y}"></div>`);
                newGridItem.html(ml(this.alphabet.charAt(Math.random() * 26)));
                newGridRow.append(newGridItem);
            }
            newGridRow.append('<div class="anchor"></div>');
            $(this.gridEl).append(newGridRow);
        }
        if (this.isMobile) {
            this.gridEl.addEventListener('touchstart', this.onGridItemTouchStart.bind(this));
            this.gridEl.addEventListener('touchmove', this.onGridItemTouchMove.bind(this));
            this.gridEl.addEventListener('touchend', this.onGridItemTouchEnd.bind(this));
        }
        $(this.gridEl).append('<div class="anchor"></div>');
    }
    getWords() {
        //Decrypt any encrypted words here.
        if (!this.wordList.length) {
            $.ajax({
                url: '',
                success: (result) => {
                    //Retrieved data
                    this.wordList = result;
                },
                error: () => {
                    //Retrieved error
                }
            });
        }
    }
    placeWords() {
        //Place words in the grid
        for (let i in this.wordList) {
            let w = new Word(this.wordList[i], i, this.grid, this.gridEl);
            words.push(w);
        }
        setTimeout(() => {
            $(this.gridEl).removeClass('loading');
        }, 100);
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
            if (words[i].check() && this.selection.dist === words[i].len) {
                words[i].solve();
            }
            if (!words[i].solved) {
                allSolved = false;
            }
            console.log(words);
        }
        this.selection = false;
        $('.highlighted').removeClass('highlighted');
        if (allSolved) {
            this.gameOver();
        }

        evt.preventDefault();
        return false;
    }
};