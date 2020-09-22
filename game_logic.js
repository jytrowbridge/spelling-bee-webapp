/* *********
  Grab HTML elements
*/

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
const helpBtn = document.querySelector('#help')
const helpDiv = document.querySelector('#help-wrapper')
const showWordsBtn = document.querySelector('#show-words')
const showWordsDiv = document.querySelector('#show-words-wrapper')
const showWordsList = document.querySelector('#show-words-list')
const exitBtns = document.querySelectorAll('.pop-up-div-exit')


/* ****************************************
    Functions
* ****************************************/

/* ****************************
    Word Input Logic
*/

function processKey(e) {

  e.preventDefault();

  
  const key = e.key.toUpperCase();
  if (game.letters.includes(key)) {
    const hex = [...hexes].filter(hex => hex.dataset.letter == key)[0];
    addLetterKey(key);
    hex.classList.add('clicked');
    window.addEventListener('keyup', () => hex.classList.remove('clicked'));
  } else if (key == 'BACKSPACE') {
    deleteLetter();
  } else if (key == 'ENTER') {
    submitWord();
  }
}

function addLetterKey (letter) {
  const currText = textInput.textContent;
  textInput.textContent = currText + letter;
}

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
  showWordFound(word);
  saveGameToCookie();
}

function createWordDiv(word) {
  // Create a div inside the words-found-list div
  let wordDiv = document.createElement('div');
  wordDiv.classList.add('word');
  wordDiv.textContent = word;
  wordsFndList.appendChild(wordDiv);
}


/* ****************************
  Animation Handling
*/

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

function hexAnimate() {
  this.classList.add('clicked');
}

function hexUnAnimate() {
  this.classList.remove('clicked');
}


/* ****************************
  Toggle Page Features
*/

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

/* **********************
    HELP/SHOW WORDS FUNCTIONS
*/

function toggleVisible() {
  obj = this;
  const div = obj.id == 'help' || obj.id == 'help-exit' ? helpDiv
            : obj.id == 'show-words' || obj.id == 'show-words-exit' ? showWordsDiv
            : undefined
  if (obj.id == 'show-words' && !game.locked) {
    const confShow = confirm('Are you sure you want to show all words?'
                +'\nYou will be unable to submit any more words if you do.');
    if (!confShow) return;
    lockGame();
  }
  if (div.classList.contains('close')) {
    div.classList.remove('close')
  } else {
    div.classList.add('close')
  }
}

function fillAllWords (game) {
  const allWords = game.getAllWords();
  allWords.forEach(word => createShowWordDiv(word));
}

function createShowWordDiv (word) {
  const wordDiv = document.createElement('div');
  wordDiv.classList.add('show-word');
  wordDiv.id = 'show-' + word;
  wordDiv.textContent = word;
  showWordsList.appendChild(wordDiv);
}

function showWordFound (word) {
  const id = '#show-' + word;
  const wordDiv = document.querySelector(id);
  wordDiv.textContent += '\t\u2713'
  wordDiv.classList.add('found');
}

function lockGame() {
  console.log('locking...')
  game.locked = 'true';
  textInput.textContent = '';
  toggleInput(game);
  saveGameToCookie();
}


/* ****************************
  New Game Logic
*/

function startNewGame() {
  const confRestart = confirm('Are you sure you want to start a new game?');
  console.log(confRestart)
  if (confRestart) {
    game = new Game();
    textInput.textContent = '';
    toggleInput(game);              // add event listeners for letter input
    deleteChildren(wordsFndList);   // clear words found div
    deleteChildren(showWordsList);  // clear show words div
    allWords = game.fillLetters();  // get new hex letters
    setBoardFromGame(game);         // populate dom
    saveGameToCookie();             // save new game to cookie
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


/* ****************************
  Cookie Logic
*/

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
    if (key in game) {
      game[key] = value;
    }
    
    // set words found locked property
    if (key == 'lock-words' && value == 'true') {
      lockWords.checked = true;
      toggleWordsLock(saveCookie=false);
      toggleWordsFnd(animate=false);
    }
  })

  // set boolean from string
  game.locked = game.locked == 'true';
  
  // set values to int
  game.score = parseInt(game.score);

  // parse lists
  game.words = game.words.split(',').filter(e => e != '');  // prevent empty string from creating non-empty list
  game.letters = game.letters.split(',');

  // set dom elements from game attriutes
  setBoardFromGame(game);

  return game;
}


/* ****************************
  Set Board State
*/

function setBoardFromGame(game) {
  // Sets DOM elements to match attributes in Game Object
  // set hex text
  hexes.forEach(hex => {
    const gameId = game.getGameId(hex.id);
    const letter = game[gameId];
    hex.textContent = letter;
    hex.dataset.letter = letter;
  })

  // set score
  score.textContent = game.score;
  
  // populate all words div
  fillAllWords(game);
  
  // set words found
  const words = game.words;
  if (words.length > 0) {
    words.forEach(word => {
      createWordDiv(word);  // create entry in "words found" div
      showWordFound(word);  // set word styling in "all words" div
    })
  }
  toggleInput(game);
}


/* ****************************
  Add listeners
*/

// Letter/Word Input Listeners
function toggleInput (game) {
  // If game is locked, remove input event listeners; otherwise, add them
  if (game.locked) {
    window.removeEventListener('keydown', processKey);                       // Allow for keyboard entry
    hexes.forEach(hex => hex.removeEventListener('click', addLetter));
    deleteBtn.removeEventListener('click', deleteLetter);
    submitBtn.removeEventListener('click', submitWord);
    hexes.forEach(hex => hex.removeEventListener('mouseup', hexUnAnimate));  // click animation for hexes
    hexes.forEach(hex => hex.removeEventListener('mousedown', hexAnimate));  // click animation for hexes
    textInput.removeEventListener('transitionend', removeTransition)  
  } else {
    window.addEventListener('keydown', processKey);                       // Allow for keyboard entry
    hexes.forEach(hex => hex.addEventListener('click', addLetter));
    deleteBtn.addEventListener('click', deleteLetter);
    submitBtn.addEventListener('click', submitWord);
    hexes.forEach(hex => hex.addEventListener('mouseup', hexUnAnimate));  // click animation for hexes
    hexes.forEach(hex => hex.addEventListener('mousedown', hexAnimate));  // click animation for hexes
    textInput.addEventListener('transitionend', removeTransition)         // Undo transition for text box
  }
}

// Toggle Page Features Listeners
wordsFndHeader.addEventListener('click', toggleWordsFnd)              // Show/hid words found div
lockWords.addEventListener('change', toggleWordsLock);                // Lock/unlock words found div

// New Game Listener
newGame.addEventListener('click', startNewGame);

// help/show words Listeners
helpBtn.addEventListener('click', toggleVisible)
showWordsBtn.addEventListener('click', toggleVisible)
exitBtns.forEach(btn => btn.addEventListener('click', toggleVisible))


/* ****************************
  Initialize Page
*/

let allWords;     // variable only used for convenience in console
let game;
const cookie = document.cookie;
if (cookie == '') {
  game = new Game();
  toggleInput(game);
  allWords = game.fillLetters();
  setBoardFromGame(game);
  saveGameToCookie();
} else {
  game = applyCookie(cookie);
  allWords = game.getAllWords();
}
