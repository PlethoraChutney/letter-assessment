// studentSuccess is defined in the template dashboard.html
// dashboardType is defined in the template dashboard.html
// lessonNumbers is defined in template
const students = Object.keys(studentSuccess.students);
const dashboard = document.querySelector('#dashboard');
const hoverContainer = document.querySelector('#hover-container');

if (dashboardType === 'words' || dashboardType === 'heart_words') {
    dashboard.style.gridTemplateColumns = `75px repeat(${studentSuccess.unique_vals.length}, 2.5rem) 75px`;
} else {
    dashboard.style.gridTemplateColumns = `75px repeat(${studentSuccess.unique_vals.length}, 30px) 75px`;
}

headers = studentSuccess.unique_vals;
if (dashboardType === 'numbers') {
    headers = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20
    ]
}
headers.unshift('Student');
headers.push('Student');

headers.forEach(header => {
    let newHeader = document.createElement('p');
    newHeader.innerHTML = header;
    newHeader.classList.add('header');
    newHeader.setAttribute('data-target', header);

    newHeader.addEventListener('mouseover', () => {
        for (let square of document.querySelectorAll('div.grid-square')) {
            if (square.getAttribute('data-target') !== newHeader.getAttribute('data-target')) {
                square.classList.add('lowlight');
            } else {
                square.classList.remove('lowlight');
                if (dashboardType !== 'words' && dashboardType !== 'heart_words') {
                    square.classList.add('wider');
                }
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
});

function clearHover() {
    while (hoverContainer.firstChild) {
        hoverContainer.removeChild(hoverContainer.firstChild);
    }
    hoverContainer.classList.remove("missing");
}

function studentMouseover(e) {
    for (let square of document.querySelectorAll('div.grid-square')) {
        if (square.getAttribute('data-student') !== e.target.getAttribute('data-student')) {
            square.classList.add('lowlight');
        } else {
            square.classList.remove('lowlight');
        }
    }
}

function studentMouseleave() {
    for (let square of document.querySelectorAll('div.grid-square')) {
        square.classList.remove('lowlight');
    }
}

function setHoverOffset(xCoord, yCoord) {
    let boxWidth = hoverContainer.offsetWidth;
    let boxHeight = hoverContainer.offsetHeight;
    if (xCoord >= (boxWidth + scrollX + 20)) {
        hoverContainer.style.right = window.innerWidth - xCoord + 'px';
        hoverContainer.style.removeProperty('left');
    } else {
        hoverContainer.style.removeProperty('right');
        hoverContainer.style.left = xCoord + 'px';
    }

    if (yCoord >= (boxHeight + scrollY + 20)) {
        hoverContainer.style.removeProperty('top');
        hoverContainer.style.bottom = window.innerHeight - yCoord + 'px';
    } else {
        hoverContainer.style.removeProperty('bottom');
        hoverContainer.style.top = yCoord + 'px';
    }
}

function dashboardSquareHover(event) {
    clearHover();

    for (dataType of ['Student', 'Date', 'Target', 'Name', 'Sound', 'Read']) {
        let dataName = `data-${dataType.toLowerCase()}`;
        if (event.target.hasAttribute(dataName)) {
            let newP = document.createElement('p');
            newP.innerHTML = `${dataType}: ${event.target.getAttribute(dataName)}`;
            hoverContainer.appendChild(newP);
        }
    }

    setHoverOffset(event.pageX, event.pageY);

    hoverContainer.classList.remove('hidden');
}


function dashboardMissingHover(event) {
    clearHover();
    hoverContainer.classList.add("missing");

    let newP = document.createElement("p");
    newP.innerHTML = "Missing result.";
    hoverContainer.appendChild(newP);

    setHoverOffset(event.pageX, event.pageY);

    hoverContainer.classList.remove('hidden');
}

function dashboardSquareMousemove(event) {
    setHoverOffset(event.pageX, event.pageY);
}

function dashboardSquareMouseleave() {
    clearHover();
    hoverContainer.classList.add('hidden');
}

students.forEach(student => {
    // initial student name

    let studentNameP = document.createElement('p');
    studentNameP.innerHTML = student;
    studentNameP.id = `student-name-${student}`;
    studentNameP.setAttribute('data-student', student);

    studentNameP.addEventListener('mouseover', studentMouseover);

    studentNameP.addEventListener('mouseleave', studentMouseleave);

    dashboard.appendChild(studentNameP);

    // actual dashboard data

    for (let header of headers) {
        if (header === 'Student') {
            continue;
        }
        if (dashboardType === 'numbers') {
            header = 'n' + header;
        }

        let newGridSquare = document.createElement('div');
        newGridSquare.classList.add('grid-square');

        newGridSquare.setAttribute('data-student', student);
        newGridSquare.setAttribute('data-date', studentSuccess['students'][student]['date']);
        if (dashboardType === 'numbers') {
            newGridSquare.setAttribute('data-target', header.replace('n', ''));
        } else {
            newGridSquare.setAttribute('data-target', header);
        }
        newGridSquare.id = `sq-${student}-${header}`;
        let result;
        try {
            result = studentSuccess['students'][student]['results'][header]['success'];
        } catch (error) {
            newGridSquare.addEventListener('mouseover', dashboardMissingHover);
            newGridSquare.addEventListener('mousemove', dashboardSquareMousemove);
            newGridSquare.addEventListener('mouseleave', dashboardSquareMouseleave);
            dashboard.appendChild(newGridSquare);
            continue;
        }
        if (dashboardType === 'words') {
            result = { 'read': result['name'] };
        }

        let allCorrect = true;
        if ('name' in result) {
            newGridSquare.setAttribute('data-name', result.name ? 'Correct' : 'Incorrect');
            if (!result.name) {
                newGridSquare.classList.add('missing-name');
                allCorrect = false;
            }
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
            newGridSquare.setAttribute('data-lesson', lessonNumbers[header]);
        }
        if (allCorrect) {
            newGridSquare.classList.add('all-correct');
        }

        newGridSquare.addEventListener('mouseover', dashboardSquareHover);
        newGridSquare.addEventListener('mousemove', dashboardSquareMousemove);
        newGridSquare.addEventListener('mouseleave', dashboardSquareMouseleave);

        dashboard.appendChild(newGridSquare);
    }

    // ending student name

    let endStudentNameP = document.createElement('p');
    endStudentNameP.innerHTML = student;
    endStudentNameP.id = `student-name-${student}`;
    endStudentNameP.setAttribute('data-student', student);

    endStudentNameP.addEventListener('mouseover', studentMouseover);

    endStudentNameP.addEventListener('mouseleave', studentMouseleave);

    dashboard.appendChild(endStudentNameP);
})

const exampleSquares = document.querySelectorAll('div.example-square');
exampleSquares.forEach(square => {
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
})