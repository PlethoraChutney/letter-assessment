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
let words = {};
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
    lowerCase[letter] = {'name': false};
}

for (let letter of shuffle(letters)) {
    upperCase[letter.toUpperCase()] = {'name': false, 'sound': false};
}

let integers = shuffle([...Array(21).keys()])
for (let i of integers) {
    numbers[`n${i}`] = {'name': false};
}

// reverse word order, because we use pop() from the back
let wordEntries = ['because', 'think', 'flip', 'cat'];
for (let word of wordEntries) {
    words[word] = {'read': false};
}

let upperCaseKeys = Object.keys(upperCase);
let lowerCaseKeys = Object.keys(lowerCase);
let numberKeys = Object.keys(numbers);
let wordKeys = Object.keys(words);

const bigText = document.querySelector('#quiz-target');
const targetType = document.querySelector('#target-type');

// track which set of targets we're using
let currSet = 'upper';

// what feature of the question we're targeting
let currTarget = 'name';

// what target is displayed
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
    if (currSet === 'upper') {
        upperCase[currValue]['sound'] = isCorrect;
    }
}

function markRead(isCorrect) {
    words[currValue]['read'] = isCorrect;
}

function advanceText() {
    switch (currSet) {
        case 'words':
            if (wordKeys.length > 0) {
                currValue = wordKeys.pop();
                bigText.innerHTML = currValue;
            } else {
                if (!quizComplete) {
                    quizComplete = true;
                    bigText.innerHTML = 'Finished.';
                    bigText.classList.add('finished');
                    bigText.classList.remove('is-a-word');
                    targetType.innerHTML = '';
                    sendResults();
                }
            }
            break;
        case 'number':
            if (numberKeys.length > 0) {
                currValue = numberKeys.pop().replace('n', '');
                bigText.innerHTML = currValue;
            } else {
                currSet = 'words';
                bigText.classList.remove('is-a-number');
                bigText.classList.add('is-a-word');
                currTarget = 'read';
                targetType.innerHTML = 'Read';
                currValue = wordKeys.pop();
                bigText.innerHTML = currValue;
            }
            break;

        case 'lower':
            if (lowerCaseKeys.length > 0) {
                currValue = lowerCaseKeys.pop();
                bigText.innerHTML = currValue;
                if (currValue === 'e') {
                    bigText.classList.remove('other-handwritten');
                    bigText.classList.add('arial');
                } else if (currValue === 'q') {
                    bigText.classList.remove('arial');
                    bigText.classList.add('other-handwritten');
                } else {
                    bigText.classList.remove('other-handwritten');
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
        if (currSet === 'upper') {
            currTarget = 'sound';
            targetType.innerHTML = 'Letter Sound';
        } else {
            advanceText();
        }
    } else if (currTarget === 'sound') {
        markSound(isCorrect);
        currTarget = 'name';
        targetType.innerHTML = 'Letter Name';
        advanceText();
    } else if (currTarget === 'read') {
        markRead(isCorrect);
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
        'numbers': numbers,
        'words': words
    });
}

document.addEventListener('keyup', handleKeypress);