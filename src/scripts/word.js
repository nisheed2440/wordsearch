import {
    ml,
    gi,
    gic
} from './utils';
import $ from 'jquery';

export default class Word {
    constructor(word, id, grid = {
        x: 11,
        y: 17
    }, gridEl) {
        let dir = Math.floor(Math.random() * 4);
        this.content = word;
        this.coords = [];
        this.id = id;
        this.solved = false;
        this.solveClass = '';
        this.len = word.length;
        this.minx = 0;
        this.miny = 0;
        this.maxx = grid.x;
        this.maxy = grid.y;
        this.addx = null;
        this.addy = null;
        this.gridEl = gridEl;

        if (dir < 1) {
            this.addx = function(x, i) {
                return x + i;
            };
            this.addy = function(y, i) {
                return y - i;
            };
            this.maxx = grid.x - this.len;
            this.miny = this.len;
            this.dir = "/";
            this.solveClass = "da";
        } else if (dir < 2) {
            this.addx = function(x, i) {
                return x + i;
            };
            this.addy = function(y, i) {
                return y + i;
            };
            this.maxx = grid.x - this.len;
            this.maxy = grid.y - this.len;
            this.dir = "\\";
            this.solveClass = "dd";
        } else if (dir < 3) {
            this.addx = function(x, i) {
                return x;
            };
            this.addy = function(y, i) {
                return y + i;
            };
            this.maxx = grid.x;
            this.maxy = grid.y - this.len;
            this.dir = "|"
            this.solveClass = "v";
        } else {
            this.addx = function(x, i) {
                return x + i;
            };
            this.addy = function(y, i) {
                return y;
            };
            this.maxx = grid.x - this.len;
            this.maxy = grid.y;
            this.dir = "-";
            this.solveClass = "h";
        }

        this.valid = this.place();
    }
    check() {
        for (let i in this.coords) {
            if (!this.coords[i].hasClass('highlighted')) {
                return false;
            }
        }
        return true;
    }
    solve() {
        for (let i in this.coords) {
            this.coords[i].addClass('solved').addClass(this.solveClass);
        }
        this.solved = true;
    }
    place() {
        let x, y;
        let valid = false;
        let reverse = Math.round(Math.random() * .9) == 0; //Mark this as false to have ltr words
        let timeout = 0;
        while (!valid) {
            x = this.minx + Math.floor(Math.random() * (this.maxx - this.minx));
            y = this.miny + Math.floor(Math.random() * (this.maxy - this.miny));
            valid = true;
            for (let i = 0; i < this.len; i++) {
                let item = gi(this.addx(x, i), this.addy(y, i));
                let c = (!reverse) ? this.content.charAt(i) : this.content.charAt(this.len - (i + 1));
                if (item.find(".letter").html() != c && item.hasClass('used')) valid = false;
            }
            if (timeout++ > 1000) {
                console.log(`!! Can't fit ${this.content}`);
                $(this.gridEl).trigger('cfc');//cannot fit content event
                return false;
            }
        }
        //draw words
        for (let i = 0; i < this.len; i++) {
            let item = gi(this.addx(x, i), this.addy(y, i));
            let c = (!reverse) ? this.content.charAt(i) : this.content.charAt(this.len - (i + 1));
            item.html(ml(c));
            item.addClass('used');
            this.coords.push(item);
        }
        return true;
    }
};