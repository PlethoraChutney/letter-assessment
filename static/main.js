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

const student = document.querySelector('#student-name').innerText;
let upperCase = {};
let lowerCase = {};
let numbers = {};
let quizComplete = false;

const letters = Array.from('abcdefghijklmnopqrstuvwxyz');

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

for (let letter of shuffle(letters)) {
    lowerCase[letter] = {'name': false, 'sound': false};
}

for (let letter of shuffle(letters)) {
    upperCase[letter.toUpperCase()] = {'name': false};
}

let integers = shuffle([...Array(21).keys()])
for (let i of integers) {
    numbers[`n${i}`] = {'name': false};
}

let upperCaseKeys = Object.keys(upperCase);
let lowerCaseKeys = Object.keys(lowerCase);
let numberKeys = Object.keys(numbers);

const bigText = document.querySelector('#quiz-target');
const targetType = document.querySelector('#target-type');

let currSet = 'upper';
let currTarget = 'name';
let currValue = upperCaseKeys.pop();
bigText.innerHTML = currValue;
targetType.innerHTML = 'Letter Name';

function markName(isCorrect) {
    switch (currSet) {
        case 'upper':
            upperCase[currValue]['name'] = isCorrect;
            break;
        case 'lower':
            lowerCase[currValue]['name'] = isCorrect;
            break;
        case 'number':
            numbers[`n${currValue}`]['name'] = isCorrect;
            break;
    }
}

function markSound(isCorrect) {
    if (currSet === 'lower') {
        lowerCase[currValue]['sound'] = isCorrect;
    }
}

function advanceText() {
    switch (currSet) {
        case 'number':
            if (numberKeys.length > 0) {
                currValue = numberKeys.pop().replace('n', '');
                bigText.innerHTML = currValue;
            } else {
                if (!quizComplete) {
                    quizComplete = true;
                    bigText.innerHTML = 'Finished.';
                    bigText.classList.add('finished');
                    targetType.innerHTML = '';
                    sendResults();
                }
            }
            break;

        case 'lower':
            if (lowerCaseKeys.length > 0) {
                currValue = lowerCaseKeys.pop();
                bigText.innerHTML = currValue;
                if (currValue === 'e') {
                    bigText.classList.add('arial');
                } else {
                    bigText.classList.remove('arial');
                }
            } else {
                bigText.classList.add('is-a-number');
                currSet = 'number';
                currValue = numberKeys.pop().replace('n', '');
                bigText.innerHTML = currValue;
                targetType.innerHTML = 'Number Name';
            }
            break;

        case 'upper':
            if (upperCaseKeys.length > 0) {
                currValue = upperCaseKeys.pop();
                bigText.innerHTML = currValue;
            } else {
                currSet = 'lower';
                currValue = lowerCaseKeys.pop();
                bigText.innerHTML = currValue;
            }
            break;
    }
}

function markAndAdvance(isCorrect) {
    if (currTarget === 'name') {
        markName(isCorrect);
        if (currSet === 'lower') {
            currTarget = 'sound';
            targetType.innerHTML = 'Letter Sound';
        } else {
            advanceText();
        }
    } else {
        markSound(isCorrect);
        currTarget = 'name';
        targetType.innerHTML = 'Letter Name';
        advanceText();
    }
}

function handleKeypress(keyEvent) {
    switch (keyEvent.code) {
        case 'ArrowUp':
            markAndAdvance(true);
            break;
        case 'ArrowDown':
            markAndAdvance(false);
            break;
    }
}

function sendResults() {
    sendRequest({
        'action': 'quiz_complete',
        'student': student,
        'upper': upperCase,
        'lower': lowerCase,
        'numbers': numbers
    });
}

document.addEventListener('keyup', handleKeypress);