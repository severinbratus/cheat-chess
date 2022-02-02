// html elements routinely accessed
const board = document.getElementById('board')
const base = document.getElementById('base')
const prompt = document.getElementById('prompt')

let position = null
let socket = null
let color = null // 'w' or 'b'

let over = false

// origin square for a move
let origin = null


const setup = () => {
  setPrompt(statusMessages.OPP_TURN)
  socket = new WebSocket(`ws://${location.host}`)
  socket.onmessage = onmessage
  board.addEventListener('click', onclick)
}


const onmessage = (event) => {
  const message = JSON.parse(event.data)

  switch (message.type) {
    case messages.START:
      position = new kokopu.Position('chess960', message.scharnaglCode)
      color = message.color
      renderUI()
      break
    
    case messages.MOVE:
      const move = position.uci(message.moveUCI)
      position.play(move)
      renderUI()
      break
      
    case messages.DISCONNECT:
      if (!over) {
        over = true
        setPrompt(statusMessages.ABORTED, statusMessages.PLAY_AGAIN)
      }
      break
  }
}


const renderUI = () => {
  promptTurn()

  // clear the board
  while (board.lastElementChild.id != 'base') {
    board.removeChild(board.lastElementChild)
  }

  const files = 'abcdefgh'.split('')
  const ranks = '12345678'.split('')

  // white and black have different perspectives of the board
  const rows = color == 'w' ? ranks.reverse() : ranks
  const cols = color == 'w' ? files : files.reverse()

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = cols[j] + rows[i]

      if (isGreen(square) && isRed(square)) {
        placeSVG(i, j, "svg/highlight/triangle-green.svg", "highlight")
        placeSVG(i, j, "svg/highlight/triangle-red.svg", "highlight")
      } else if (isGreen(square)) {
        placeSVG(i, j, "svg/highlight/square-green.svg", "highlight")
      } else if (isRed(square)) {
        placeSVG(i, j, "svg/highlight/square-red.svg", "highlight")
      }

      const piece = position.square(square)

      if (piece != '-') {
        placeSVG(i, j, `svg/pieces/${piece}.svg`, "piece")
      }
    }
  }
}

const isGreen = (square) => {
  return position.isAttacked(square, color)
}

const isRed = (square) => {
  return position.isAttacked(square, kokopu.oppositeColor(color))
}

const placeSVG = (i, j, src, type) => {
  const img = document.createElement("img")
  img.style.transform = `translate(${j * 100}%, ${i * 100}%)`
  img.className = type
  img.setAttribute("src", src)
  board.append(img)
}


const onclick = (event) => {
  i = Math.floor(8 * event.clientY / base.clientHeight)
  j = Math.floor(8 * event.clientX / base.clientWidth)

  const files = 'abcdefgh'.split('')
  const ranks = '12345678'.split('')

  // white and black have different perspectives of the board
  const rows = color == 'w' ? ranks.reverse() : ranks
  const cols = color == 'w' ? files : files.reverse()

  const square = cols[j] + rows[i]

  if (origin == null && isValidOrigin(square)) {
    origin = square
    enableHighlightFrom(origin)
  } else if (origin != null) {
    disableHighlightFrom(origin)

    const moveFun = position.isMoveLegal(origin, square)
    if (moveFun) {
      // this player makes a move
      // NOTE: pawn promotion always resolves to queen
      const arg = (moveFun.status == 'regular') ? '' : 'q'

      const message = {
        type: messages.MOVE,
        moveUCI: origin + square + arg
      }
      socket.send(JSON.stringify(message))
      const move = position.uci(message.moveUCI)
      position.play(move)
      renderUI()
      origin = null
    } else if (isValidOrigin(square)) {
    // if the second clicked square is not a legal destination,
    //  but a valid origin, set it as origin.
      origin = square
      enableHighlightFrom(origin)
      // origin is not null, waiting for second click
    } else {
    // the second move is not a legal destination,
    //  and not a valid origin: cancel the move by nulling `origin`
      origin = null
    }
  }
}


const enableHighlightFrom = (origin) => {
  const files = 'abcdefgh'.split('')
  const ranks = '12345678'.split('')

  // white and black have different perspectives of the board
  const rows = color == 'w' ? ranks.reverse() : ranks
  const cols = color == 'w' ? files : files.reverse()

  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      const square = cols[j] + rows[i]
      if (position.isMoveLegal(origin, square))
        if (isRed(square))
          placeSVG(i, j, "svg/highlight/triangle-seagreen.svg", "highlight")
        else
          placeSVG(i, j, "svg/highlight/square-seagreen.svg", "highlight")
    }
}


const disableHighlightFrom = (origin) => {
  while (board.lastElementChild.className == 'highlight') {
    board.removeChild(board.lastElementChild)
  }
}


const isValidOrigin = (square) => {
 return (position.square(square)[0] == color
        && position.turn() == color && !over)
}


const setPrompt = (...statusMessageList) => {
  prompt.innerHTML = statusMessageList.join(' ')
}


const promptTurn = () => {
  setPrompt(position.turn() == color ? statusMessages.YOUR_TURN : statusMessages.OPP_TURN)
}


setup()
