const reportDiv = document.querySelector('#word-report');

for (let student of Object.keys(reportInfo)) {
    let studentName = document.createElement('p');
    studentName.innerHTML = `${student} got ${Object.values(reportInfo[student]).reduce((a, b) => (a + b))} words right.`;
    reportDiv.appendChild(studentName);
}