const reportDiv = document.querySelector('#word-report');

for (let student of Object.keys(reportInfo)) {

    let studentName = document.createElement('p');
    const numCorrect = Object.values(reportInfo[student]).reduce((a, b) => (a + b));
    studentName.innerHTML = `${student} got ${numCorrect} words right.`;
    reportDiv.appendChild(studentName);

    if (numCorrect > 0) {
        // make list of words
        let wordContainer = document.createElement('div');
        for (word of Object.keys(reportInfo[student])) {
            if (reportInfo[student][word]) {
                let wordEntry = document.createElement('p');
                wordEntry.innerHTML = word;
                wordContainer.appendChild(wordEntry);
            }
        }
        reportDiv.appendChild(wordContainer);
    }
}