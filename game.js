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
}

/* *********
  Grab HTML elements
*/
const vowels = ['A','E','I','O','U'];
const hexes = document.querySelectorAll('.hex');
const textInput = document.querySelector('#text-display');
const msgDiv = document.querySelector('#msg-display');
const deleteBtn = document.querySelector('#delete-letter');
const submitBtn = document.querySelector('#submit');
const wordsFndDiv = document.querySelector('#words-found');

/* *********
  Functions
*/

function addLetter () {
  const id = getGameId(this.id);
  const letter = game[id];
  const currText = textInput.textContent;
  textInput.textContent = currText + letter;
  //this.style.color = 'black';
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
  game.words.push(word);
  moveValid();
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
wordsFndDiv.addEventListener('click', toggleWordsFnd)

function toggleWordsFnd() {
  if (wordsFndDiv.classList.contains('close')) {
    wordsFndDiv.classList.remove('close')
  } else {
    wordsFndDiv.classList.add('close')
  }
}