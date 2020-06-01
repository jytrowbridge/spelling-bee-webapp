function getRndInteger(min, max) {
  // Return random integer in range [min,max). Note that range excludes max. 
  // Taken from W3 schools page
  return Math.floor(Math.random() * (max - min) ) + min;
}

function getRndLet() {
  // Return random uppercase letter
  return String.fromCharCode(65 + getRndInteger(0,26));
}

const vowels = ['A','E','I','O','U'];

class Game {
  constructor (vowel=false
              , hex0=''
              , hex1=''
              , hex2=''
              , hex3=''
              , hex4=''
              , hex5=''
              , hex6=''
              , letters=[]  
              , words=[]    
              , minLen=4
              , score=0
              , minWords=20
              , scoreAdjust=3
              ) {
    this.vowel = vowel;
    this.hex0 = hex0;
    this.hex1 = hex1;
    this.hex2 = hex2;
    this.hex3 = hex3;
    this.hex4 = hex4;
    this.hex5 = hex5;
    this.hex6 = hex6;
    this.letters = letters;
    this.words = words;
    this.minLen = minLen;
    this.score = score;
    this.minWords = minWords;
    this.scoreAdjust = scoreAdjust;
  }

  getWordScore (word) {
    return word.length - this.scoreAdjust;
  }

  fillLetters () {
    let allWords;
    while (true) {
      this.letters = [];
      for (let i = 0; i < 7; i++){
        this.fillLetter(`hex${i}`);
      }
      allWords = this.getAllWords();
      if (allWords.length >= this.minWords) return allWords; 
    }
  }

  fillLetter (hex) {
    const letter = this.getLetter();
    this[hex] = letter;
    this.letters.push(letter);
    if (vowels.includes(letter)) this.vowel = true;
  }
  
  getLetter() {
    // Return random letter not used by another game hex
    while (true){
      const letter = getRndLet();
      if (!this.letters.includes(letter)) return letter;
    }
  }

  getAllWords () {
    // Return all words in scrabDic object that can be made from hex letters
    // Letter in hex-0 is required
    const fullDic = Object.keys(scrabDic);
    const words = fullDic.filter(word => this.isValidWord(word));
    return words;
  }

  isValidWord (word) {
    // Return false if word is too short, doesn't include hex-0 letter, or isn't in dictionary
    if (word.length < this.minLen) return false;
    const reqLetter = this.hex0;
    const letters = this.letters;
    const upperWord = word.toUpperCase();
    let reqExists = false;
    
    for (let i = 0; i < upperWord.length; i++) {
      const letter = upperWord[i];
      if (!letters.includes(letter)) return false;
      reqExists = (letter == reqLetter) || reqExists;
    }
    return reqExists;
  }

  getCookieArr () {
    // Return array of strings of form '<key>=<value>;'
    let cookieArr = [];

    // hexes
    for (let i = 0; i < 7; i++) {
      const key = 'hex' + i;
      cookieArr.push(`${key}=${this[key]}`);
    }

    // letters
    cookieArr.push(`letters=${this.letters}`);
    
    // words
    cookieArr.push(`words=${this.words}`);
    
    // score
    cookieArr.push(`score=${this.score}`);

    return cookieArr;
  }

  addWord (word) {
    this.score += this.getWordScore(word);
    this.words.push(word);
  }

  processWord (word) {
    // Return [<valid>, <message>] where <valid> is a boolean value
    if (word.length < this.minLen) {
      return [false, 'Word must be at least four letters'];
    } else if (!word.includes(this.hex0)) {
      return [false, 'Word must include middle letter'];
    } else if (!(word in scrabDic)) {
      return [false, 'Word is not in dictionary'];
    } else {
      return [true, 'Word is valid!'];
    }
  }

  getGameId (id) {
    // Given html id, return associated attribute name
    let gameId = id.replace('-outer-', '');
    gameId = gameId.replace('-', '');
    return gameId;
  }
  
}

