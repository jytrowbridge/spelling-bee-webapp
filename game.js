let game = {  // this needs to be a class so I can recreate it
  vowel: false,
  hex0: '',
  hex1: '',
  hex2: '',
  hex3: '',
  hex4: '',
  hex5: '',
  hex6: '',
  letters: [],
  minLen: 4,
  words: [],
  score: 0,
}

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
  const id = getGameId(this.id);
  const letter = game[id];
  const currText = textInput.textContent;
  textInput.textContent = currText + letter;
}

function getGameId(id) {
  let gameId = id.replace('-outer-', '');
  gameId = gameId.replace('-', '');
  return gameId
}

function getRndInteger(min, max) {
  // Return random integer in range [min,max). Note that range excludes max. 
  // Taken from W3 schools page
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRndLet() {
  // Return random uppercase letter
  return String.fromCharCode(65 + getRndInteger(0,26));
}

function getLetter() {
  // Return random letter not used by another game hex
  while (true){
    const letter = getRndLet();
    if (!game.letters.includes(letter)) return letter;
  }
}

function fillLetter(hex) {
  // Fill hex textcontent with random letter
  // THIS SHOULD JUST FILL GAME OBJECT; SHOULD HAVE SEPARATE FUNCTIONALITY TO SET BOARD FROM OBJECT
  const id = hex.id;
  if (id.includes('hidden')) return;  // skip hidden hexes
  
  const letter = getLetter();
  hex.textContent = letter;
  
  const gameId = getGameId(id);
  game[gameId] = letter;
  game.letters.push(letter);
  if (vowels.includes(letter)) game.vowel = true;
}

function fillLetters(hexes) {
  let allWords;
  while (true) {
    game.letters = [];
    hexes.forEach(hex => fillLetter(hex));
    allWords = getAllWords();
    if (allWords.length > 19) return allWords; // Check if there are at least 20 valid words
    
  }
}

function deleteLetter() {
  const text = textInput.textContent;
  textInput.textContent = text.slice(0, text.length - 1)
}

function submitWord() {
  const word = textInput.textContent;
  if (game.words.includes(word)) return;
  const middleLetter = game.hex0;
  if (word.length < game.minLen) {
    alertWrong('Word must be at least four letters')
  } else if (!word.includes(middleLetter)) {
    alertWrong('Word must include middle letter')
  } else if (!(word in scrabDic)) {
    alertWrong('Word is not in dictionary')
  } else {
    acceptWord(word);
  }
}

function alertWrong(message) {
  msgDiv.textContent = message;
  setTimeout(() => msgDiv.textContent = '', 1500);
  moveWrong();
}

function acceptWord(word) {
  msgDiv.textContent = 'Word is valid!';
  setTimeout(() => {
    textInput.textContent = '';
  }, 500);
  setTimeout(() => {
    msgDiv.textContent = '';
  }, 2000);
  addWordFound(word);
  moveValid();
}

function addWordFound(word) {
  game.score += getWordScore(word);
  score.textContent = game.score;

  game.words.push(word);
  let wordDiv = document.createElement('div');
  wordDiv.classList.add('word');
  wordDiv.textContent = word;
  wordsFndList.appendChild(wordDiv);
}

function getWordScore(word) {
  return word.length - 3;
}

function getAllWords() {
  // Return all words in scrabDic object that can be made from hex letters
  // Letter in hex-0 is required
  const fullDic = Object.keys(scrabDic);
  const words = fullDic.filter(word => isValidWord(word));
  return words;
}

function isValidWord(word) {
  // Return false if word is too short, doesn't include hex-0 letter, or isn't in dictionary
  if (word.length < game.minLen) return false;
  const reqLetter = game.hex0;
  const letters = game.letters;
  const upperWord = word.toUpperCase();
  let reqExists = false;
  
  for (i = 0; i < upperWord.length; i++) {
    const letter = upperWord[i];
    if (!letters.includes(letter)) return false;
    reqExists = (letter == reqLetter) || reqExists;
  }
  return reqExists;
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
allWords = fillLetters(hexes);  // this occasionally doesn't work

console.table(allWords);


// ------------
wordsFndHeader.addEventListener('click', toggleWordsFnd)

function toggleWordsFnd() {
  if (wordsFndDiv.classList.contains('close')) {
    wordsFndDiv.classList.remove('close')
    arrow.classList.remove('up')
  } else {
    wordsFndDiv.classList.add('close')
    arrow.classList.add('up')
  }
}

// ----------------
lockWords.addEventListener('change', toggleWordsLock);

function toggleWordsLock() {
  if (this.checked) {
    wordsFndDiv.classList.add('locked');
    gameWrapper.classList.add('locked');
  } else {
    wordsFndDiv.classList.remove('locked');
    gameWrapper.classList.remove('locked');
  }
}

// --------------------
newGame.addEventListener('click', startNewGame);

function startNewGame() {
  const confRestart = confirm('Are you sure you want to start a new game?');
  console.log(confRestart)
  if (confRestart) {
    game.score = 0;
    game.words = [];
    deleteChildren(wordsFndList);
    score.textContent = '0';
    allWords = fillLetters(hexes);
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
  for (key in game) {
    document.cookie = `${key}=${game[key]};`;
  }
  document.cookie = `${lockWords.id}=${lockWords.checked};`
}

function parseCookie(cookie) {
  const cookieArr = cookie.split('; ');
  const cookiePairs = cookieArr.map(cookie => cookie.split('='));
  //return cookiePairs;

  cookiePairs.forEach((cookiePair) => {
    let key = cookiePair[0];
    let value = cookiePair[1];
    if (key in game) {
      game[key] = value;
    }
  })

  //setBoardFromGame()
}

function setBoardFromGame() {
  // I think this is how I should implement above
  for (key in game) {
    return;
  }
}

//const cookieStr = saveGameToCookie().join('; ');

//document.cookie = "jaaaack";