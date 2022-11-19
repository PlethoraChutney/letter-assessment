const wordsList = [
    'the', 'I', 'to', 'a', 'is', 'my',
    'go', 'me', 'like', 'on', 'in',
    'so', 'we', 'it', 'and', 'up', 'at',
    'see', 'he', 'do', 'you', 'an', 'can',
    'no', 'am', 'went', 'are', 'this', 'look',
    'for', 'get', 'come', 'got', 'play', 'was',
    'had', 'they', 'will', 'too', 'all', 'be',
    'as', 'ball', 'by', 'day', 'did', 'has',
    'her', 'him', 'fun'
];

function completeQuiz() {
    fetch(window.location, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
            'action': 'quiz_complete',
            'student': student,
            'correct_words': wordAnswers
        })
    })
}

let wordAnswers = {}

const bigWord = document.querySelector('#big-word');

let currWordInd = 0;
let incorrectAnswers = 0;
bigWord.innerHTML = wordsList[currWordInd];

quizComplete = false;

function markAndAdvance(correct) {
    wordAnswers[wordsList[currWordInd]] = correct;

    if (!correct) {
        incorrectAnswers += 1;
    }

    currWordInd += 1;
    
    if (incorrectAnswers >= 9 | currWordInd >= wordsList.length) {
        completeQuiz();
        quizComplete = true;
        bigWord.innerHTML = 'Done!';
    } else {
        bigWord.innerHTML = wordsList[currWordInd];
    }
}

function handleKeypress(keyEvent) {
    if (quizComplete) {
        return true;
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