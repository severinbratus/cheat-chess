## Darker Chess

Usual chess, but with visibility constraints -- the player can only see the enemy pieces that are in their range of attack.
Like in normal chess, the ultimate achievement is to check-mate the opponent.
This is different from [Dark chess](https://en.wikipedia.org/wiki/Dark_chess), and is hence called *Darker chess* due to my limited creativity.

![Demo](/demo.png?raw=true)

### Caveats

If there is an enemy piece in front of a pawn, that piece may or may not be visible, and the pawn will not be able to move.
Likewise, if your king is in check, you will not be notified of it, but you will *feel* it.
*En passant* moves are possible, but, again, you may not know they are available.

### Setup

See [link](https://github.com/severinbratus/cheat-chess/tree/main#setup)

### Issues (specific to this branch)

- This game can totally be cheated with the dev tools and some knowledge of the source code, because full game state is stored on the client-side.
- The player is not notified in case of a check, and can only deduce they are in one based on the limited range of available moves (availability is communicated by highlighting)
- See also [link](https://github.com/severinbratus/cheat-chess/tree/main#issues)

### See also

- [Main branch](https://github.com/severinbratus/cheat-chess/tree/main#issues)
