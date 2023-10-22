function sendRequest(body) {
    return fetch(window.location, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(body)
    })
}

// from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const student = document.querySelector('#student-name').innerText;
const quizType = document.querySelector('#quiz-type').innerText;

// Make arrays to keep track of targets

const arrayLetters = Array.from('AMSTPFINODCUGBEKHRLWJYXQVZ');

let uppercaseLetterQuiz = {};
arrayLetters.forEach(letter => {
    uppercaseLetterQuiz[letter] = {
        'targetChar': letter,
        'success': { 'name': undefined, 'sound': undefined }
    };
})

let lowercaseLetterQuiz = {};
arrayLetters.forEach(letter => {
    letter = letter.toLocaleLowerCase();
    lowercaseLetterQuiz[letter] = {
        'targetChar': letter,
        'success': { 'name': undefined }
    };
})

let integerQuiz = {};
shuffle([...Array(21).keys()]).forEach(num => {
    numString = 'n' + num;
    integerQuiz[numString] = {
        'targetChar': num,
        'success': { 'name': undefined }
    };
})

// wordsDict defined in template
const wordArray = Object.keys(wordsDict.words);
let wordQuiz = {};
wordArray.forEach(word => {
    wordQuiz[word] = {
        'targetChar': word,
        'success': { 'name': false }
    };
})

const heartWordArray = wordsDict.heart_words
let heartWordQuiz = {};
heartWordArray.forEach(word => {
    heartWordQuiz[word] = {
        'targetChar': word,
        'success': { 'name': false }
    }
})

let targetQuiz;
switch (quizType.toLocaleLowerCase()) {
    case 'upper':
        targetQuiz = uppercaseLetterQuiz;
        break;
    case 'lower':
        targetQuiz = lowercaseLetterQuiz;
        break;
    case 'numbers':
        targetQuiz = integerQuiz;
        break;
    case 'words':
        targetQuiz = wordQuiz;
        break;
    case 'heart_words':
        targetQuiz = heartWordQuiz;
        break;
}

// Determine result format

function sendResults() {
    sendRequest({
        'action': 'quiz_complete',
        'student': student,
        'results': targetQuiz
    });
}

// Run the quiz

const bigText = document.querySelector('#quiz-target');
const targetType = document.querySelector('#target-type');
const quizKeys = Object.keys(targetQuiz);
let numberMissed = 0;
let missedEnoughWords = false;
let currIndex = 0;
let needSound = quizType.toLocaleLowerCase() === 'upper';
let currTarget = 'name';
let quizComplete = false;

bigText.innerHTML = targetQuiz[quizKeys[currIndex]].targetChar;
targetType.innerHTML = currTarget;

function markAndAdvance(success) {
    targetQuiz[quizKeys[currIndex]]['success'][currTarget] = success;
    numberMissed += !success;

    if (currTarget === 'name' && needSound) {
        currTarget = 'sound';
    } else {
        currTarget = 'name';
        currIndex++;
    }

    missedEnoughWords = quizType.toLocaleLowerCase() === 'words' && numberMissed === 3;

    if (currIndex == quizKeys.length || missedEnoughWords) {
        quizComplete = true;
        bigText.innerHTML = 'Finished.';
        targetType.innerHTML = '';
        sendResults();
        return;
    }

    const newTarget = targetQuiz[quizKeys[currIndex]];

    bigText.innerHTML = newTarget.targetChar;
    targetType.innerHTML = currTarget;

    // handle font types
    bigText.classList.remove('other-handwritten');
    bigText.classList.remove('arial');
    if (bigText.innerHTML === 'e') {
        bigText.classList.add('arial');
    } else if (bigText.innerHTML === 'q') {
        bigText.classList.add('other-handwritten');
    }
}

function handleKeypress(keyEvent) {
    if (quizComplete) {
        return;
    }

    switch (keyEvent.code) {
        case 'ArrowUp':
            markAndAdvance(true);
            break;
        case 'ArrowDown':
            markAndAdvance(false);
            break;
    }
}

document.addEventListener('keyup', handleKeypress);