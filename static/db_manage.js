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

const studentContainer = document.querySelector('#student-list-holder');
const quizTypeDropdown = document.querySelector('#quiz-type-selector');

function clearList() {
    while (studentContainer.firstChild) {
        studentContainer.removeChild(studentContainer.firstChild);
    }
};

function refreshList() {
    clearList();

    for (let student of studentList) {
        let newLink = document.createElement('a');
        newLink.href = 'javascript:;';
        newLink.innerHTML = student;
        newLink.addEventListener('click', () => {
            window.location.href = `/quiz/${quizTypeDropdown.value}/${student}`;
        })
        studentContainer.appendChild(newLink);
    }
}

// inital page setup
refreshList();

function newKid() {
    let kidName = prompt("New student's name:");

    if (kidName.length > 0) {
        sendRequest('/api/add-kid', {
            'kid_name': kidName
        }).then(() => {
            studentList.push(kidName);
            refreshList();
        });
    }
}

function deleteKid() {
    let kidName = prompt('Student to delete (case sensitive):');

    while (kidName.length > 0 & studentList.indexOf(kidName) == -1) {
        kidName = prompt(`${kidName} not found. Try again:`);
    }

    if (kidName.length == 0) {
        return
    }

    sendRequest('/api/delete-kid', {
        'kid_name': kidName
    }).then(() => {
        studentList.splice(studentList.indexOf(kidName), 1);
        refreshList();
    });

}