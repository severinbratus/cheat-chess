const express = require("express")
const http = require("http")
const ws = require("ws")
const kokopu = require("kokopu")


const Pairing = require("./Pairing")
const messages = require("../front-end/js/messages")


// return a random integer in range [0,max)
const randInt = (max) => {
  return Math.floor(Math.random() * (max-1));
}


const cleanup = () => {
  for (let key in pairings) {
    // if pairing under `key` not deleted already
    if (pairings.hasOwnProperty(key))
      if (pairings[key].over)
        delete pairings[key]
  }
}


const onconnection = (connection) => {
  connection["id"] = connectionID++

  // if the current pairing was aborted by first player already
  if (currentPairing.over) {
    currentPairing = new Pairing()
  }

  connection.color = currentPairing.addPlayer(connection)
  pairings[connection["id"]] = currentPairing

  console.log(`Player ${connection["id"]} placed in pairing ${currentPairing.id} as ${connection.color}`)

  if (currentPairing.players.length == 2) {
    startGame();
    currentPairing = new Pairing()
  }

  connection.on("message", onmessage.bind(null, connection))
  connection.on("close", onclose.bind(null, connection))
}


const startGame = () => {
  // start the game!
  const scharnaglCode = 518 // randInt(960) // 518 // for classical chess

  for (let player of currentPairing.players) {
    const message = {
      type: messages.START,
      color: player.color,
      scharnaglCode: scharnaglCode
    }
    player.send(JSON.stringify(message))
  }
}


const onmessage = (connection, messageRaw) => {
  const message = JSON.parse(messageRaw.toString())
  console.log("Received:", message)

  const pairing = pairings[connection["id"]]
  oppConnection = pairing.players[(pairing.players[0] == connection) ? 1 : 0]

  if (message.type == messages.MOVE)
    oppConnection.send(JSON.stringify(message))
}


const onclose = (connection, code) => {
  console.log(`${connection["id"]} disconnected ...`)

  // 1001 means client is closing the websocket connection
  if (code == 1001) {
    const pairing = pairings[connection["id"]]
    if (pairing && !pairing.over) {
      pairing.over = true
      for (let player of pairing.players)
        if (player)
          player.send(JSON.stringify({type: messages.DISCONNECT}))
    }
  }
}


const app = express()
app.use(express.static(__dirname + "/../front-end"))

const router = express.Router();

// one route only
router.get("/", (req, res) => {
  res.sendFile("play.html", { root: "../front-end" })
})

app.use(router)

const server = http.createServer(app)
const wsServer = new ws.Server({ server })

// key (= property): id of a websocket, value: a pairing
const pairings = {}

// regular clean-up every 50 seconds
setInterval(cleanup, 50000)

let currentPairing = new Pairing()
let connectionID = 0 // each websocket (= connection) receives a unique ID

wsServer.on("connection", onconnection)

// launch the server
const port = process.argv[2]
server.listen(port)
console.log(`Server listening.`)
