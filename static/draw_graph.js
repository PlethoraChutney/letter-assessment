const dashboard = document.querySelector('#dashboard');
const hoverContainer = document.querySelector('#hover-container');

const updaterContainer = document.querySelector('#updater-container');
const updaterTitle = document.querySelector('#updater-title');
const buttonCorrect = document.querySelector('#button-correct');
const buttonIncorrect = document.querySelector('#button-incorrect');
const buttonName = document.querySelector('#button-name');
const buttonSound = document.querySelector('#button-sound');

const words = ['cat', 'flip', 'think', 'because'];

let updateDate;
let updateTarget;
let updateStudent;
let updateAssessment = 'name';

setNameTarget = () => {
    updateAssessment = 'name';
    buttonSound.classList.remove('selected');
    buttonName.classList.add('selected');
}

function studentStats(event) {
    studentName = event.target.getAttribute('data-student');
    const results = studentSuccess[studentName]['results'];
    const canv = new OffscreenCanvas(475, 280);
    let numbers = 0;
    let lower = 0;
    let upper = 0;
    let sounds = 0;

    for (number of [...Array(20).keys()]) {
        if (results[number]['name']) {
            numbers += 1;
        }
    }

    for (letter of 'abcdefghijklmnopqrstuvwxyz'.split('')) {
        if (results[letter]['name']) {
            lower += 1;
        }

        if (results[letter]['sound']) {
            sounds += 1;
        }

        if (results[letter.toUpperCase()]['name']) {
            upper += 1;
        }
    }

    numbers = Math.round(numbers / 20 * 100);
    lower = Math.round(lower / 26 * 100);
    sounds = Math.round(sounds / 26 * 100);
    upper = Math.round(upper / 26 * 100);

    let canv2d = canv.getContext('2d');
    canv2d.imageSmoothingEnabled = false;
    canv2d.clearRect(0, 0, canv.width, canv.height);
    canv2d.fillStyle = 'white';
    canv2d.fillRect(0,0,canv.width, canv.height);

    canv2d.fillStyle = 'black';
    canv2d.font = '36pt Montserrat';
    canv2d.fillText(`Report for ${studentName}:`, 10, 50);

    canv2d.font = '20pt Montserrat';
    canv2d.fillText(`${numbers}% of number identification`, 55, 100);
    canv2d.fillText(`${lower}% of lowercase names`, 55, 150);
    canv2d.fillText(`${upper}% of uppercase names`, 55, 200);
    canv2d.fillText(`${sounds}% of letter sounds`, 55, 250);

    canv.convertToBlob().then(blob => {
        window.open(URL.createObjectURL(blob), target = '_blank');
    });

    navigator.clipboard.writeText(`In early September, ${studentName} successfully identified ${lower}% of lowercase letter names, ${upper}% of uppercase letter names, and ${sounds}% of letter sounds.`);
}

buttonName.addEventListener('click', setNameTarget);
buttonSound.addEventListener('click', () => {
    updateAssessment = 'sound';
    buttonSound.classList.add('selected');
    buttonName.classList.remove('selected');
});

buttonCorrect.addEventListener('click', () => {
    let update = {
        'date': updateDate,
        'student': updateStudent,
        'target': updateTarget,
        'assess': updateAssessment,
        'correct': true
    }

    sendRequest(update).then(
        data => {
            if (data) {
                let updatedSq = document.querySelector(`#sq-${updateStudent}-${updateTarget}`);
                switch (updateAssessment) {
                    case 'name':
                        updatedSq.classList.remove('missing-name');
                        updatedSq.classList.remove('missing-read');
                        break;
                    case 'sound':
                        updatedSq.classList.remove('missing-sound');
                        break;
                }

                if (updatedSq.classList.length == 1) {
                    updatedSq.classList.add('all-correct');
                }
            }
        }
    )
})
buttonIncorrect.addEventListener('click', () => {
    let update = {
        'date': updateDate,
        'student': updateStudent,
        'target': updateTarget,
        'assess': updateAssessment,
        'correct': false
    }

    sendRequest(update).then(
        data => {
            if (data) {
                let isWord = words.includes(updateTarget);

                if (isWord & updateAssessment === 'name') {
                    updateAssessment = 'read';
                }

                let updatedSq = document.querySelector(`#sq-${updateStudent}-${updateTarget}`);
                updatedSq.classList.remove('all-correct');
                switch (updateAssessment) {
                    case 'name':
                        updatedSq.classList.add('missing-name');
                        break;
                    case 'read':
                        updatedSq.classList.add('missing-read');
                        break;
                    case 'sound':
                        updatedSq.classList.add('missing-sound');
                        break;
                }
            }
        }
    )
})

document.querySelector('#button-done').addEventListener('click', () => {
    updaterContainer.classList.add('hidden');
})

function sendRequest(body) {
    return fetch('/api/update-quiz', {
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

function clearHover() {
    while(hoverContainer.firstChild) {
        hoverContainer.removeChild(hoverContainer.firstChild);
    }
}

// studentSuccess defined and passed in to the Flask template
const students = Object.keys(studentSuccess);
students.sort();

const headers = ['Student', ...Object.keys(studentSuccess[students[0]]['results']), 'Student'];
const wordConversion = {
    'cat': '😸',
    'flip': '🔄',
    'think': '🧠',
    'because': '⚙️'
}

for (let header of headers) {
    let newHeader = document.createElement('p');
    if (['cat', 'flip', 'think', 'because'].includes(header)) {
        newHeader.innerHTML = wordConversion[header];
    } else {
        newHeader.innerHTML = header;
    }
    newHeader.classList.add('header');
    newHeader.setAttribute('data-target', header);

    newHeader.addEventListener('mouseover', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            if (square.getAttribute('data-target') !== newHeader.getAttribute('data-target')) {
                square.classList.add('lowlight');
            } else {
                square.classList.remove('lowlight');
                square.classList.add('wider');
            }
        }
    })

    newHeader.addEventListener('mouseleave', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            square.classList.remove('lowlight');
            square.classList.remove('wider');
        }
    })
    

    dashboard.appendChild(newHeader);
}

for (let student of students) {
    let studentNameP = document.createElement('p');
    studentNameP.innerHTML = student;
    studentNameP.id = `student-name-${student}`
    studentNameP.setAttribute('data-student', student);

    studentNameP.addEventListener('mouseover', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            if (square.getAttribute('data-student') !== studentNameP.getAttribute('data-student')) {
                square.classList.add('lowlight');
            } else {
                square.classList.remove('lowlight');
            }
        }
    })

    studentNameP.addEventListener('click', studentStats);

    studentNameP.addEventListener('mouseleave', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            square.classList.remove('lowlight');
        }
    }) 

    dashboard.appendChild(studentNameP);

    for (let [target, result] of Object.entries(studentSuccess[student]['results'])) {
        let newGridSquare = document.createElement('div');
        newGridSquare.classList.add('grid-square');

        newGridSquare.setAttribute('data-student', student);
        newGridSquare.setAttribute('data-date', studentSuccess[student]['date']);
        newGridSquare.setAttribute('data-target', target);
        newGridSquare.id = `sq-${student}-${target}`;
        if ('name' in result) {
            newGridSquare.setAttribute('data-name', result.name ? 'Correct' : 'Incorrect');
        }

        if (target == 20 | target === 'z') {
            newGridSquare.classList.add('right-border');
        }

        let allCorrect = true;
        if ('name' in result & !result.name) {
            newGridSquare.classList.add('missing-name');
            allCorrect = false;
        }
        if ('sound' in result) {
            newGridSquare.setAttribute('data-sound', result.sound ? 'Correct' : 'Incorrect');
            if (!result.sound) {
                newGridSquare.classList.add('missing-sound');
                allCorrect = false;
            }
        }
        if ('read' in result) {
            newGridSquare.setAttribute('data-read', result.read ? 'Correct' : 'Incorrect');
            if (!result.read) {
                newGridSquare.classList.add('missing-read');
                allCorrect = false;
            }
        }

        if (allCorrect) {
            newGridSquare.classList.add('all-correct');
        }

        newGridSquare.addEventListener('mouseover', event => {
            clearHover();

            for (dataType of ['Student', 'Date', 'Target', 'Name', 'Sound', 'Read']) {
                let dataName = `data-${dataType.toLowerCase()}`;
                if (newGridSquare.hasAttribute(dataName)) {
                    let newP = document.createElement('p');
                    newP.innerHTML = `${dataType}: ${newGridSquare.getAttribute(dataName)}`;
                    hoverContainer.appendChild(newP);
                }
            }

            hoverContainer.style.top = event.pageY + 'px';
            hoverContainer.style.right = window.innerWidth - event.pageX + 'px';

            hoverContainer.classList.remove('hidden');
        })

        newGridSquare.addEventListener('mousemove', (event) => {
            hoverContainer.style.top = event.pageY + 'px';
            hoverContainer.style.right = window.innerWidth - event.pageX + 'px';
        })

        newGridSquare.addEventListener('mouseleave', () => {
            clearHover();
            hoverContainer.classList.add('hidden');
        })

        newGridSquare.addEventListener('click', () => {
            setNameTarget();
            updateTarget = newGridSquare.getAttribute('data-target');
            updateDate = newGridSquare.getAttribute('data-date');
            updateStudent = newGridSquare.getAttribute('data-student');

            updaterTitle.innerHTML = `Update for ${student}: ${target}`;
            updaterContainer.classList.remove('hidden');
        })

        dashboard.appendChild(newGridSquare);
    }

    let rightStudent = document.querySelector(`#student-name-${student}`).cloneNode(deep = true);
    rightStudent.id = `student-name${student}-right`;

    rightStudent.addEventListener('mouseover', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            if (square.getAttribute('data-student') !== rightStudent.getAttribute('data-student')) {
                square.classList.add('lowlight');
            } else {
                square.classList.remove('lowlight');
            }
        }
    })

    rightStudent.addEventListener('mouseleave', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            square.classList.remove('lowlight');
        }
    })

    rightStudent.addEventListener('click', studentStats);

    dashboard.appendChild(rightStudent);

    const exampleSquares = document.querySelectorAll('div.example-square');

    for (let square of exampleSquares) {
        const squareType = square.getAttribute('data-example-of').split(',');

        square.addEventListener('mouseover', () => {
            for (let cell of document.querySelectorAll('div.grid-square')) {
                for (let type of squareType) {
                    if (!cell.classList.contains(type)) {
                        cell.classList.add('lowlight');
                    }
                }
            }
        })

        square.addEventListener('mouseleave', () => {
            for (let cell of document.querySelectorAll('div.grid-square')) {
                cell.classList.remove('lowlight');
            }
        })
    }
}