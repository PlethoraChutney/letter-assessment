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
};

console.log(studentList);
const studentContainer = document.querySelector('#student-list-holder');

function clearList() {
    while(studentContainer.firstChild) {
        studentContainer.removeChild(studentContainer.firstChild);
    }
};

function refreshList() {
    clearList();
    let header = document.createElement('h1');
    header.innerHTML = 'New quiz for which student?';
    studentContainer.appendChild(header);

    for (let student of studentList) {
        let newLink = document.createElement('a');
        newLink.href = `/quiz/${student}`
        newLink.innerHTML = student;
        studentContainer.appendChild(newLink);
    }
}

// inital page setup
refreshList();

function newStudent() {
    let studentName = prompt("New student's name:");

    sendRequest('/api/add-student', {
        'student': studentName
    }).then(() => {
        studentList.push(studentName);
        refreshList();
    });

}

function deleteStudent() {
    let studentName = prompt('Student to delete (case sensitive):');

    while (studentName.length > 0 & studentList.indexOf(studentName) == -1) {
        console.log(studentList);
        console.log(studentName);
        console.log(studentName in studentList);
        studentName = prompt(`${studentName} not found. Try again:`);
    }

    if (studentName.length == 0) {
        return
    }

    sendRequest('/api/delete-student', {
        'student': studentName
    }).then(() => {
        studentList.splice(studentList.indexOf(studentName), 1);
        refreshList();
    });

}