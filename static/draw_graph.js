const dashboard = document.querySelector('#dashboard');
const hoverContainer = document.querySelector('#hover-container');

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
        if ('name' in result) {
            newGridSquare.setAttribute('data-name', result.name ? 'Correct' : 'Incorrect');
        }

        if (target == 20 | target === 'z') {
            newGridSquare.classList.add('right-border');
        }

        if ('name' in result & !result.name) {
            newGridSquare.classList.add('missing-name');
        }
        if ('sound' in result) {
            newGridSquare.setAttribute('data-sound', result.sound ? 'Correct' : 'Incorrect');
            if (!result.sound) {
                newGridSquare.classList.add('missing-sound');
            }
        }

        if ('read' in result) {
            newGridSquare.setAttribute('data-read', result.read ? 'Correct' : 'Incorrect');
            if (!result.read) {
                newGridSquare.classList.add('missing-read');
            }
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

    dashboard.appendChild(rightStudent);
}