class Pairing {

    static count = 0;

    constructor() {
        this.players = []
        this.over = false
        this.id = Pairing.count++;
    }

    addPlayer(player) {
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

}

module.exports = Pairing
