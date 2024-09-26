// JavaScript for dynamically managing the decision table and calculating criteria

// Add a new row (decision)
function addRow() {
    let table = document.getElementById("decisionTable");
    let newRow = table.insertRow(-1);
    let cell = newRow.insertCell(0);
    cell.innerHTML = `s${table.rows.length - 1}`;

    for (let i = 1; i < table.rows[0].cells.length; i++) {
        let cell = newRow.insertCell(i);
        cell.innerHTML = `<input type="number">`;
    }
}

// Remove the last row
function removeRow() {
    let table = document.getElementById("decisionTable");
    if (table.rows.length > 2) {
        table.deleteRow(-1);
    }
}

// Add a new column (state)
function addColumn() {
    let table = document.getElementById("decisionTable");
    let header = table.rows[0];
    let newCell = header.insertCell(-1);
    newCell.innerHTML = `A${header.cells.length - 1}`;

    for (let i = 1; i < table.rows.length; i++) {
        let cell = table.rows[i].insertCell(-1);
        cell.innerHTML = `<input type="number">`;
    }
}

// Remove the last column
function removeColumn() {
    let table = document.getElementById("decisionTable");
    if (table.rows[0].cells.length > 2) {
        for (let i = 0; i < table.rows.length; i++) {
            table.rows[i].deleteCell(-1);
        }
    }
}

// Function to transpose the table (swap rows and columns)
function transposeTable() {
    let table = document.getElementById("decisionTable");
    let rows = Array.from(table.rows);

    // Collect the current table data into a matrix
    let data = rows.map(row => Array.from(row.cells).map(cell => {
        // Check if the cell contains an input field
        if (cell.firstElementChild && cell.firstElementChild.tagName === "INPUT") {
            return cell.firstElementChild.value; // Use value from input
        } else {
            return cell.innerText; // Use text otherwise
        }
    }));

    // Clear the existing table
    table.innerHTML = '';

    // Rebuild the table with transposed data
    for (let i = 0; i < data[0].length; i++) {
        let newRow = table.insertRow(-1);
        for (let j = 0; j < data.length; j++) {
            let newCell = newRow.insertCell(-1);
            if (i === 0 || j === 0) {
                newCell.innerText = data[j][i]; // Set text for headers and first column
            } else {
                // Create a new input element for decision/state values
                let input = document.createElement("input");
                input.type = "number";
                input.value = data[j][i];
                newCell.appendChild(input);
            }
        }
    }
}

// Calculate decision criteria and check for indifference
function calculate() {
    let table = document.getElementById("decisionTable");
    let decisions = [];

    // Extract decision table data
    for (let i = 1; i < table.rows.length; i++) {
        let row = [];
        for (let j = 1; j < table.rows[i].cells.length; j++) {
            let value = table.rows[i].cells[j].getElementsByTagName('input')[0].value;
            row.push(parseFloat(value) || 0);
        }
        decisions.push(row);
    }

    function checkIndifference(values) {
        // Check if all elements in an array are the same
        return new Set(values).size === 1;
    }

    // MaxiMax
    let maximaxValues = decisions.map(row => Math.max(...row));
    let maximaxResult = Math.max(...maximaxValues);
    document.getElementById("maximax").innerHTML = `MaxiMax: ${maximaxResult}` +
        (checkIndifference(maximaxValues) ? " (indifferent)" : "");

    // MaxiMin
    let maximinValues = decisions.map(row => Math.min(...row));
    let maximinResult = Math.max(...maximinValues);
    document.getElementById("maximin").innerHTML = `MaxiMin: ${maximinResult}` +
        (checkIndifference(maximinValues) ? " (indifferent)" : "");

    // miniMax Regret
    let states = decisions[0].length;
    let maxInState = [];
    for (let j = 0; j < states; j++) {
        let max = -Infinity;
        for (let i = 0; i < decisions.length; i++) {
            max = Math.max(max, decisions[i][j]);
        }
        maxInState.push(max);
    }
    let maxRegretValues = decisions.map(row =>
        Math.max(...row.map((value, index) => maxInState[index] - value))
    );
    let minMaxRegretResult = Math.min(...maxRegretValues);
    document.getElementById("minimaxRegret").innerHTML = `miniMax Regret: ${minMaxRegretResult}` +
        (checkIndifference(maxRegretValues) ? " (indifferent)" : "");

    // Hurwicz’s optimism (α from user input)
    let alpha = parseFloat(document.getElementById("alpha").value);
    let hurwiczValues = decisions.map(row => alpha * Math.max(...row) + (1 - alpha) * Math.min(...row));
    let hurwiczResult = Math.max(...hurwiczValues);
    document.getElementById("hurwicz").innerHTML = `Hurwicz Optimism (α = ${alpha}): ${hurwiczResult}` +
        (checkIndifference(hurwiczValues) ? " (indifferent)" : "");

    // Laplace's principle
    let laplaceValues = decisions.map(row => row.reduce((a, b) => a + b, 0) / row.length);
    let laplaceResult = Math.max(...laplaceValues);
    document.getElementById("laplace").innerHTML = `Laplace's Principle: ${laplaceResult}` +
        (checkIndifference(laplaceValues) ? " (indifferent)" : "");
}
