const Pairing = function(id) {
  this.players = []
  this.over = false
}

/**
 * Add a player to the Pairing.
 * @param {websocket} `p` WebSocket of the player
 * @returns {string} returns "w" or "b" depending on the player
 */
Pairing.prototype.addPlayer = function(player) {
  this.players.push(player)
  if (this.over)
    throw `Invalid call to addPlayer, pairing is over.`
  switch (this.players.length) {
  case 1:
    return 'w'
  case 2:
    return 'b'
  default:
    throw `Invalid call to addPlayer, ${this.players.length} players pushed.`
  }
}

module.exports = Pairing
