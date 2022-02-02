// Message headers.
// S stands for server, C for client.
(function (exports) {
	exports.START      = 0 // S -> C : the game has started. contains player color
	exports.MOVE       = 1 // C -> S -> C : one player made a move
	exports.DISCONNECT = 2 // S -> C : the other player has disconnected
})(typeof(exports) == "undefined" ? (this.messages = {}) : exports)
