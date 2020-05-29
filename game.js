let game = {  // this needs to be a class so I can recreate it
  vowel: false,
  hexcenter: '',
  hex1: '',
  hex2: '',
  hex3: '',
  hex4: '',
  hex5: '',
  hex6: '',
}

const vowels = ['A','E','I','O','U']
const hexes = document.querySelectorAll('.hex')
const textInput = document.querySelector('#text-display')
const deleteBtn = document.querySelector('#delete-letter')

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

function fillLetter(hex) {
  // NEED TO UPDATE SO IT DOESN'T ADD DUPLICATE LETTERS
  const id = hex.id;
  if (id.includes('hidden')) return;  // skip hidden hexes
  const letter = getRndLet();
  hex.textContent = letter;
  
  const gameId = getGameId(id);
  game[gameId] = letter;
  if (vowels.includes(letter)) game.vowel = true;
}

function getRndInteger(min, max) {
  // returns random integer in range [min,max). Note that range excludes max. 
  // Taken from W3 schools page
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRndLet() {
  return String.fromCharCode(65 + getRndInteger(0,26));
}

function fillLetters(hexes) {
  hexes.forEach(hex => fillLetter(hex));
}
function checkVowel(hexes) {
  // If no vowels in hexes, randomize and check again until vowel exists.
  if (game.vowel) return;
  fillLetters(hexes);
  checkVowel(hexes);
}
/* should also add function to check for less common letters...
it would be bad to have only vowel as 'u' or the consonants as k, z, x...
*/

function deleteLetter() {
  const text = textInput.textContent;
  textInput.textContent = text.slice(0, text.length - 1)
}

deleteBtn.addEventListener('click', deleteLetter)
hexes.forEach(hex => hex.addEventListener('click', addLetter))
fillLetters(hexes);
checkVowel(hexes);