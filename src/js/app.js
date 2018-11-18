import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as codeTable from './codeTable';

let myTable;

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        myTable = codeTable.buildTable(parsedCode);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
        draw(myTable);
    });
});

function draw(myTable) {
    document.getElementById('myTable').innerHTML = '';
    let tableView = '';
    myTable.forEach(cell => {
        tableView += `<tr><td>${cell.line}</td><td>${cell.type}</td><td>${cell.name}</td><td>${cell.condition}</td><td>${cell.value}</td></tr>`;
    });
    document.getElementById('myTable').innerHTML = tableView;
}