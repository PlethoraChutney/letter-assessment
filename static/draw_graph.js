const dashboard = document.querySelector('#dashboard');
const hoverContainer = document.querySelector('#hover-container');

function clearHover() {
    while(hoverContainer.firstChild) {
        hoverContainer.removeChild(hoverContainer.firstChild);
    }
}

// studentSuccess defined and passed in to the Flask template
const students = Object.keys(studentSuccess);

const headers = ['Student', ...Object.keys(studentSuccess[students[0]]['results'])]

for (let header of headers) {
    let newHeader = document.createElement('p');
    newHeader.innerHTML = header;
    dashboard.appendChild(newHeader);
}

for (let student of students) {
    let studentNameP = document.createElement('p');
    studentNameP.innerHTML = student;
    dashboard.appendChild(studentNameP);

    for (let [target, result] of Object.entries(studentSuccess[student]['results'])) {
        let newGridSquare = document.createElement('div');

        newGridSquare.setAttribute('data-student', student);
        newGridSquare.setAttribute('data-date', studentSuccess[student]['date']);
        newGridSquare.setAttribute('data-target', target);
        newGridSquare.setAttribute('data-name', result.name ? 'Correct' : 'Incorrect');

        if (target == 20 | target === 'z') {
            newGridSquare.classList.add('right-border');
        }

        if (!result.name) {
            newGridSquare.classList.add('missing-name');
        }
        if ('sound' in result) {
            newGridSquare.setAttribute('data-sound', result.sound ? 'Correct' : 'Incorrect');
            if (!result.sound) {
                newGridSquare.classList.add('missing-sound');
            }
        }

        newGridSquare.addEventListener('mouseover', event => {
            clearHover();

            for (dataType of ['Student', 'Date', 'Target', 'Name', 'Sound']) {
                let dataName = `data-${dataType.toLowerCase()}`;
                if (newGridSquare.hasAttribute(dataName)) {
                    let newP = document.createElement('p');
                    newP.innerHTML = `${dataType}: ${newGridSquare.getAttribute(dataName)}`;
                    hoverContainer.appendChild(newP);
                }
            }

            hoverContainer.style.top = event.pageY + 'px';
            hoverContainer.style.right = window.screen.width - event.pageX + 'px';

            hoverContainer.classList.remove('hidden');
        })

        newGridSquare.addEventListener('mousemove', (event) => {
            hoverContainer.style.top = event.pageY + 'px';
            hoverContainer.style.right = window.screen.width - event.pageX + 'px';
        })

        newGridSquare.addEventListener('mouseleave', () => {
            clearHover();
            hoverContainer.classList.add('hidden');
        })

        dashboard.appendChild(newGridSquare);
    }
}