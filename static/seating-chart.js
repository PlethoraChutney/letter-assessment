function sendRequest(dest, body) {
    return fetch(dest, {
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

const seatSlots = {
    'bluetable': {
        'x': 120,
        'y': 110
    },
    'table1': {
        'x': 270,
        'y': 260
    },
    'table2': {
        'x': 485,
        'y': 230
    },
    'yellowtable': {
        'x': 690,
        'y': 130
    },
    'yellowcarpet': {
        'x': 245,
        'y': 500
    },
    'shelf': {
        'x': 690,
        'y': 460
    }
}

const chartContainer = document.querySelector('#chart-container');
const studentDrawer = document.querySelector('#drag-holder');

const dragoverHandler = (event) => {
    event.preventDefault();
    event.target.classList.add('drop-hover');
    event.dataTransfer.dropEffect = 'move';
}
const dragLeaveHandler = (event) => {
    event.preventDefault();
    event.target.classList.remove('drop-hover');
}
const dropHandler = (event) => {
    if (event.currentTarget.firstChild) {
        studentDrawer.appendChild(event.currentTarget.firstChild);
    }
    event.preventDefault();
    event.currentTarget.classList.remove('drop-hover');
    const studentId = event.dataTransfer.getData('text/plain');
    event.currentTarget.appendChild(document.querySelector('#' + studentId));
}

for (let [seatName, seatSlot] of Object.entries(seatSlots)) {

    const offset = 50;

    if (seatName === 'shelf') {
        seatSlots[seatName]['seats'] = [
            {
                x: seatSlot.x + offset,
                y: seatSlot.y + offset
            },
            {
                x: seatSlot.x - offset,
                y: seatSlot.y - offset
            }
        ]
    } else {
        seatSlots[seatName]['seats'] = [
            {
                x: seatSlot.x - offset,
                y: seatSlot.y + offset
            },
            {
                x: seatSlot.x + offset,
                y: seatSlot.y + offset
            },
            {
                x: seatSlot.x + offset,
                y: seatSlot.y - offset
            },
            {
                x: seatSlot.x - offset,
                y: seatSlot.y - offset
            }
        ]
    }

    for (i = 0; i < seatSlots[seatName]['seats'].length; i++) {
        let tableSeat = seatSlots[seatName]['seats'][i];
        let newSlot = document.createElement('div');
        newSlot.classList.add('slot');
        newSlot.style.left = tableSeat.x + 'px';
        newSlot.style.top = tableSeat.y + 'px';
        newSlot.id = `slot-${seatName}-${i}`;

        newSlot.addEventListener('dragover', dragoverHandler);
        newSlot.addEventListener('drop', dropHandler);
        newSlot.addEventListener('dragleave', dragLeaveHandler);

        chartContainer.appendChild(newSlot);
    }
}

const updateSeatingChart = () => {
    for (let student of document.querySelectorAll('.student-name')) {
        seatingChart[student.id] = student.parentElement.id;
    }
    sendRequest('/api/update-seating-chart', seatingChart);
}

const dragHandler = (event) => {
    event.target.classList.add('hide');

    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.setData('text/plain', event.target.innerText);
}

const endDragHandler = (event) => {
    event.preventDefault();
    if (event.dataTransfer.dropEffect === 'none') {
        studentDrawer.appendChild(event.target);
    }
    event.target.classList.remove('hide');
    updateSeatingChart();
}

// seatingChart defined in flask template
for (let [student, position] of Object.entries(seatingChart)) {
    let newStudent = document.createElement('p');
    newStudent.innerHTML = student;
    newStudent.setAttribute('draggable', 'true');
    newStudent.setAttribute('data-name', student);
    newStudent.classList.add('student-name');
    newStudent.id = student;

    newStudent.addEventListener('dragstart', dragHandler);
    newStudent.addEventListener('dragend', endDragHandler);

    document.querySelector('#' + position).appendChild(newStudent);
}