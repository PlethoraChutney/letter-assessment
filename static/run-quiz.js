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

// Make arrays to keep track of targets

const arrayLetters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');

let uppercaseLetterArray = []
shuffle(arrayLetters).forEach(letter => {
    uppercaseLetterArray.push({
        'targetChar': letter,
        'targetType': 'name',
        'handwritten': false,
        'success': false
    });
    uppercaseLetterArray.push({
        'targetChar': letter,
        'targetType': 'sound',
        'handwritten': false,
        'success': false
    });
})

let lowercaseLetterArray = [];
shuffle(arrayLetters).forEach(letter => {
    letter = letter.toLocaleLowerCase();
    lowercaseLetterArray.push({
        'targetChar': letter,
        'targetType': 'name',
        'handwritten': letter === 'e' || letter === 'q',
        'success': false
    });
})

let integerArray = [];
shuffle([...Array(21).keys()]).forEach(number => {
    integerArray.push({
        'targetChar': number,
        'targetType': 'number',
        'handwritten': false,
        'success': false
    });
})

let wordArray = [];
// we don't want words to be shuffled
['because', 'think', 'flip', 'cat'].forEach(word => {
    wordArray.push({
        'targetChar': word,
        'targetType': 'word',
        'handwritten': false,
        'success': false
    });
})

const targetArray = [
    uppercaseLetterArray,
    lowercaseLetterArray,
    integerArray,
    wordArray
].reduce((accumulator, currentValue) => {
    return accumulator.concat(currentValue);
});

// Determine result format

function sendResults() {
    sendRequest({
        'action': 'quiz_complete',
        'student': student,
        'results': targetArray
    });
}

// Run the quiz

const bigText = document.querySelector('#quiz-target');
const targetType = document.querySelector('#target-type');
let currIndex = 0;
let quizComplete = false;

bigText.innerHTML = targetArray[currIndex].targetChar;
targetType.innerHTML = targetArray[currIndex].targetType;

function markAndAdvance(success) {
    targetArray[currIndex]['success'] = success;
    currIndex++;

    const newTarget = targetArray[currIndex];

    bigText.innerHTML = newTarget.targetChar;
    targetType.innerHTML = newTarget.targetType;

    // handle font types
    bigText.classList.remove('other-handwritten');
    bigText.classList.remove('arial');
    if (newTarget.handwritten) {
        switch (newTarget.targetChar) {
            case 'e':
                bigText.classList.add('arial');
                break;
            case 'q':
                bigText.classList.add('other-handwritten');
                break;
        }
    }

    if (currIndex == targetArray.length - 1) {
        quizComplete = true;
        bigText.innerHTML = 'Finished.';
        targetType.innerHTML = '';
        sendResults();
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