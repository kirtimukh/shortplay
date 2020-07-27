$(document).ready(() => {
  const X_CLASS = 'x'
  const CIRCLE_CLASS = 'circle'
  const END = 'end'
  const WINNING_COMBINATIONS = [ //////// here
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]
  const cellElements = document.querySelectorAll('[data-cell]')
  const board = document.getElementById('board')
  const winningMessageElement = document.getElementById('winningMessage')
  const restartButton = document.getElementById('restartButton')
  const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
  let circleTurn
  let myTurn = false

  startGame()       ////////    here

  restartButton.addEventListener('click', restartGame)       /////////    here

  function restartGame() {
    startGame()
    connect.emit('restart_game', 'restart_game')
  }

  function startGame() {         
    circleTurn = false          ////////   here
    cellElements.forEach(cell => {
      cell.classList.remove(X_CLASS)
      cell.classList.remove(CIRCLE_CLASS)
      cell.classList.remove(END)
      cell.removeEventListener('click', handleClick)
      cell.addEventListener('click', handleClick, { once: true })
      winningMessageTextElement.innerText = 'Play'
    })
    setBoardHoverClass()
  }

  function handleClick(e) {
    const cell = e.target
    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS
    placeMark(cell, currentClass)
    if (checkWin(currentClass)) {
      endGame(false)
    } else if (isDraw()) {
      endGame(true)
    } else {
      swapTurns()
      setBoardHoverClass()
    }
    if (myTurn) {
      connect.emit('play_data1', {'cell_id': cell.id})
      document.getElementById('board').style.pointerEvents = 'none'
      myTurn = false
    }
  }

  function endGame(draw) {
    if (draw) {
      winningMessageTextElement.innerText = 'Draw!'
    } else {
      winningMessageTextElement.innerText = `${circleTurn ? "O" : "X"} Wins!`
    }
    cellElements.forEach(cell => {
      cell.classList.add(END)
    })
  }

  function isDraw() {
    return [...cellElements].every(cell => {
      return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
  }

  function placeMark(cell, currentClass) {
    cell.classList.add(currentClass)
  }

  function swapTurns() {     /////////// here
    circleTurn = !circleTurn
  }

  function setBoardHoverClass() {
    board.classList.remove(X_CLASS)
    board.classList.remove(CIRCLE_CLASS)
    if (circleTurn) {
      board.classList.add(CIRCLE_CLASS)
    } else {
      board.classList.add(X_CLASS)
    }
  }

  function checkWin(currentClass) { //////////////////     here
    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => {
        return cellElements[index].classList.contains(currentClass)
      })
    })
  }

  let connect = io.connect(base_url+'/gameplay')
  connect.on('play_data2', data => {
    document.getElementById(data.cell_id).click()
    myTurn = true
    document.getElementById('board').style.pointerEvents = 'auto'
  })

  connect.on('first_turn', data => {
    myTurn = data.myTurn
  })

  connect.on('restart_game', (msg) => {
    if (msg=='restart_game') {
      startGame()
    }
  })
});