## Cheat Chess

A quick and dirty proof of concept, which came to be in the aftermath of the TU Delft CSE1500 experience.

The concept is to provide a visual feel for *the areas of influence* of the two sides by highlighting all the squares that are in the range of attack of one player.

One image says it all, I hope:

![Epic chess highlighting](/demo.png?raw=true)

All the squares that can be attacked by any of your pieces are highlighted with green.

All the squares that can be attacked by any of your opponent's pieces are highlighted with red.

### Setup

Install dependencies:
```sh
cd back-end # make sure you are in the `back-end` directory
npm i
```

Start the server:
``` sh
cd back-end # as above
npm start
```

Then connect to `localhost:3333` on your browser of choice, where `localhost` can also be replaced by the local IP address of the host machine (other machines need to be on the same local network to connect).

### Issues

- The board size is hard-coded to some number of pixels.
- The piece selection mechanism will break down if the board does not fit in the window.
- No, you cannot center the board.
- Does not work well on mobile.

A cleaner rewrite in React is in progress.

Stay tuned for a variation of Dark Kriegspiel chess, where you see no pieces at all, as well as Hofstadter meta-chess, where in order to win you'll have to present an inductive proof that you shall check-mate the opponent on an infinite succession of chessboards.

### See also

- [*Darker* chess on the `darker` branch*](https://github.com/severinbratus/cheat-chess/tree/darker)
