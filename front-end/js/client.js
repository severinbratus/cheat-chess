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

const captured = {
	w: [],
	b: []
}

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
			playMove(move)
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

	for (let i = 0; i < 8; i++) {
		for (let j = 0; j < 8; j++) {
			populateCoords(i, j, color)
		}
	}

	captured[color].forEach((piece, idx) => {
		const i = 8 + Math.floor(idx / 4)
		const j = idx % 4
		placeSVG(i, j, `svg/pieces/${piece}.svg`, "piece")
	})

	captured[kokopu.oppositeColor(color)].forEach((piece, idx) => {
		const i = 8 + Math.floor(idx / 4)
		const j = 4 + idx % 4
		placeSVG(i, j, `svg/pieces/${piece}.svg`, "piece")
	})

	if (position.isStalemate()) {
		over = true
		setPrompt(statusMessages.STALEMATE, statusMessages.PLAY_AGAIN)
	} else if (position.isCheckmate()) {
		over = true
		setPrompt(position.turn() == color ? statusMessages.GAME_LOST : statusMessages.GAME_WON,
				  statusMessages.PLAY_AGAIN)
	}

}

const populateCoords = (i, j, color) => {
	highlightCoords(i, j, color)

	const square = squareFromCoords(i, j, color)
	const piece = position.square(square)
	if (piece != '-' && (piece[0] == color || isGreen(square))) {
		placeSVG(i, j, `svg/pieces/${piece}.svg`, "piece")
	}
}

const highlightCoords = (i, j, color) => {
	const square = squareFromCoords(i, j, color)
	if (isGreen(square)) {
		placeSVG(i, j, "svg/highlight/square.svg", "highlight green")
	}
}

const files = [...'abcdefgh']
const ranks = [...'12345678']

const squareFromCoords = (i, j, color) => {
	// white and black have different perspectives of the board
	const ei = color == 'w' ? ranks.length - i - 1 : i
	const ej = color == 'w' ? j : files.length - j - 1
	return files[ej] + ranks[ei]
}

const isGreen = (square) => {
	return position.isAttacked(square, color)
}

const isRed = (square) => {
	return position.isAttacked(square, kokopu.oppositeColor(color))
}

const placeSVG = (i, j, src, className) => {
	const img = document.createElement("img")
	img.style.transform = `translate(${j * 100}%, ${i * 100}%)`
	img.className = className
	img.setAttribute("src", src)
	board.append(img)
}

const onclick = (event) => {
	i = Math.floor(8 * event.clientY / base.clientHeight)
	j = Math.floor(8 * event.clientX / base.clientWidth)

	const square = squareFromCoords(i, j, color)

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
			playMove(move)
			origin = null
		} else if (isValidOrigin(square)) {
		// if the second clicked square is not a legal destination,
		//	but a valid origin, set it as origin.
			origin = square
			enableHighlightFrom(origin)
			// origin is not null, waiting for second click
		} else {
		// the second move is not a legal destination,
		//	and not a valid origin: cancel the move by nulling `origin`
			origin = null
		}
	}
}

const pieceOrder = [..."pnbrq"]
const piecePriority = coloredPiece => pieceOrder.findIndex(piece => piece == coloredPiece[1])

const playMove = (move) => {
	position.play(move)
	if (move.isCapture()) {
		captured[move.color()].push(move.capturedColoredPiece())
		captured[move.color()].sort((a, b) => piecePriority(a) - piecePriority(b))
	}
	playSound("move-self")
	renderUI()
}

const enableHighlightFrom = (origin) => {
	for (let i = 0; i < 8; i++)
		for (let j = 0; j < 8; j++) {
			const square = squareFromCoords(i, j, color)
			if (position.isMoveLegal(origin, square) || square == origin)
				placeSVG(i, j, "svg/highlight/square.svg", "highlight seagreen")
		}
}

const disableHighlightFrom = () => {
	while (board.lastElementChild.className.includes('highlight')) {
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

const sounds = {
	"move-self": new Audio("sounds/move-self.webm")
}

const playSound = (sound) => {
	// Reset sound incase it hasn't finished playback yet
	sounds[sound].currentTime = 0;
	sounds[sound].muted = false; // Chrome support
	sounds[sound].play();
}

setup()
