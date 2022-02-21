## Cheat Chess

A quick and dirty proof of concept, which came to be in the aftermath of the TU Delft CSE1500 experience.

The concept is to provide a visual feel for *the areas of influence* of the two sides by highlighting all the squares that are in the range of attack of one player.

One image says it all, I hope:

![Epic chess highlighting](/demo.png?raw=true)

### Setup

``` sh
cd back-end
npm install
npm start
```

### Issues

- The board size is hardcoded to some number of pixels.
- The piece selection mechanism will break down if the board does not fit in the window.
- No, you cannot center the board.

This is a total hackjob, but it is good enough for my purposes.

Stay tuned for a variation of Dark Kriegspiel chess, as well as Hofstadter meta-chess, where in order to win you will have to present an inductive proof that you will check-mate the opponent on an infinite succession of chessboards.
