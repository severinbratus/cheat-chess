## Darker Chess

Usual chess, but with visibility constraints -- the player can only see the enemy pieces that are in the range of attack. If there is an enemy piece in front of a pawn, that piece may or may not be visible, and the pawn will not be able to move. Likewise, if your king is in check, you will not be notified of it, but you will *feel* it.
*En passant* moves are possible, but tricky.

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

This is a total hackjob, but it is good enough for my purposes. This game can totally be cheated with the dev tools and some knowledge of the source code, because full game state is stored on the client-side.
