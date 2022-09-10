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

const studentDrawer = document.querySelector('#drag-holder');

// seatingChart defined in flask template
for (let [student, position] of Object.entries(seatingChart)) {
    let newStudent = document.createElement('p');
    newStudent.innerHTML = student;
    newStudent.setAttribute('draggable', 'true');
    newStudent.setAttribute('data-name', student);
    newStudent.classList.add('student-name');

    newStudent.addEventListener('dragstart', () => {
        console.log(newStudent.getAttribute('data-name'));
    })

    if (position === 'drawer') {
        studentDrawer.appendChild(newStudent);
    }
}