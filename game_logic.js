/* *********
  Grab HTML elements
*/
const vowels = ['A','E','I','O','U'];
const gameWrapper = document.querySelector('#game-wrapper');
const hexes = document.querySelectorAll('.hex');
const textInput = document.querySelector('#text-display');
const msgDiv = document.querySelector('#msg-display');
const deleteBtn = document.querySelector('#delete-letter');
const submitBtn = document.querySelector('#submit');
const wordsFndDiv = document.querySelector('#words-found-wrapper');
const wordsFndHeader = document.querySelector('#words-found-header');
const wordsFndList = document.querySelector('#words-found-list');
const arrow = document.querySelector('.arrow');
const score = document.querySelector('#score-value');
const lockWords = document.querySelector('#lock-words');
const newGame = document.querySelector('#new-game');

/* *********
  Functions
*/

function addLetter () {
  const id = game.getGameId(this.id);
  const letter = game[id];
  const currText = textInput.textContent;
  textInput.textContent = currText + letter;
}

function deleteLetter() {
  const text = textInput.textContent;
  textInput.textContent = text.slice(0, text.length - 1)
}

function submitWord() {
  const word = textInput.textContent;
  if (game.words.includes(word)) return;
  const [result, message] = game.processWord(word);
  if (result) {
    acceptWord(word, message);
  } else {
    alertWrong(message);
  }
}

function alertWrong(message) {
  msgDiv.textContent = message;
  setTimeout(() => msgDiv.textContent = '', 1500);
  moveWrong();
}

function acceptWord(word, message) {
  game.addWord(word);
  createWordDiv(word);
  score.textContent = game.score;

  msgDiv.textContent = message;
  setTimeout(() => {
    textInput.textContent = '';
  }, 500);
  setTimeout(() => {
    msgDiv.textContent = '';
  }, 2000);
  
  moveValid();
  saveGameToCookie();
}

function createWordDiv(word) {
  // Create a div inside the words-found-list div
  let wordDiv = document.createElement('div');
  wordDiv.classList.add('word');
  wordDiv.textContent = word;
  wordsFndList.appendChild(wordDiv);
}

function removeTransition (e) {
  if (e.propertyName != 'transform') return;
  this.className = '';
}

function moveWrong() {
  textInput.classList.add('wrong')
}

function moveValid() {
  textInput.classList.add('valid')
}

/* *********
  Add listeners
*/

deleteBtn.addEventListener('click', deleteLetter);
submitBtn.addEventListener('click', submitWord);
textInput.addEventListener('transitionend', removeTransition)
hexes.forEach(hex => hex.addEventListener('click', addLetter));

// ------------
wordsFndHeader.addEventListener('click', toggleWordsFnd)

function toggleWordsFnd(animate=true) {
  if (!animate) {
    wordsFndDiv.classList.add('notransition');
  }

  if (wordsFndDiv.classList.contains('close')) {
    wordsFndDiv.classList.remove('close');
  } else {
    wordsFndDiv.classList.add('close');
  }

  if (!animate) {
    wordsFndDiv.offsetHeight; // Trigger a reflow, flushing the CSS changes
    wordsFndDiv.classList.remove('notransition');
  }
}

// ----------------
lockWords.addEventListener('change', toggleWordsLock);

function toggleWordsLock(saveCookie=true) {
  if (lockWords.checked) {
    wordsFndHeader.removeEventListener('click', toggleWordsFnd);
    gameWrapper.classList.add('locked');
    arrow.style.transition = 'all 0ms';
  } else {
    wordsFndHeader.addEventListener('click', toggleWordsFnd)
    gameWrapper.classList.remove('locked');
    arrow.style.transition = 'all 500ms';
  }
  if (saveCookie) saveGameToCookie();
}

// --------------------
newGame.addEventListener('click', startNewGame);

function startNewGame() {
  const confRestart = confirm('Are you sure you want to start a new game?');
  console.log(confRestart)
  if (confRestart) {
    game = new Game();
    deleteChildren(wordsFndList);
    score.textContent = '0';
    allWords = game.fillLetters();
    setBoardFromGame(game);
    saveGameToCookie();
    return allWords;
  } else {
    return;
  }
}

function deleteChildren(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}

// -------------------------
// Click animation for hexes

hexes.forEach(hex => hex.addEventListener('mousedown', hexAnimate));
hexes.forEach(hex => hex.addEventListener('mouseup', hexUnAnimate));

function hexAnimate() {
  this.classList.add('clicked');
}

function hexUnAnimate() {
  this.classList.remove('clicked');
}

// ------------------------
// keyboard functionality

window.addEventListener('keydown', processKey);

function processKey(e) {
  const key = e.key.toUpperCase();
  if (game.letters.includes(key)) addLetterKey(key);
  if (key == 'BACKSPACE') deleteLetter();
  if (key == 'ENTER') submitWord();
}

function addLetterKey (letter) {
  const currText = textInput.textContent;
  textInput.textContent = currText + letter;
}

// ---------------------
// COOKIES

function saveGameToCookie() {
  const gameCookieArr = game.getCookieArr();
  gameCookieArr.forEach(cookieStr => {
    document.cookie = cookieStr;
  });
  document.cookie = `${lockWords.id}=${lockWords.checked};`
}

function applyCookie(cookie) {
  // Read saved session from cookie, set DOM elements, and return instance of game
  const cookieArr = cookie.split('; ');
  const cookiePairs = cookieArr.map(cookie => cookie.split('='));
  let game = new Game();

  cookiePairs.forEach((cookiePair) => {
    let key = cookiePair[0];
    let value = cookiePair[1];

    // set game Object
    console.log(key)
    if (key in game) {
      game[key] = value;
    }

    // set values to int
    game.score = parseInt(game.score);

    // set locked property
    if (key == 'lock-words' && value == 'true') {
      lockWords.checked = true;
      toggleWordsLock(saveCookie=false);
      toggleWordsFnd(animate=false);
    }
  })

  // parse lists
  game.words = game.words.split(',');
  game.letters = game.letters.split(',');

  // set dom elements from game attriutes
  setBoardFromGame(game);

  return game;
}

function setBoardFromGame(game) {
  // set hex text
  hexes.forEach(hex => {
    const gameId = game.getGameId(hex.id);
    const letter = game[gameId];
    hex.textContent = letter;
  })

  // set score
  score.textContent = game.score;
  
  // set words found
  const words = game.words;
  words.forEach(word => {
    createWordDiv(word);
  })
}

// ----------
// Initialize page
let allWords;
let game;
const cookie = document.cookie;
if (cookie == '') {
  console.log('no cookie');
  game = new Game();
  allWords = game.fillLetters();
  setBoardFromGame(game);
  saveGameToCookie();
} else {
  console.log('cookie found')
  game = applyCookie(cookie);
  allWords = game.getAllWords();
}

console.table(allWords);