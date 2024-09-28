const N = 9;
let init_grid = [
	[5, 3, 0, 0, 7, 0, 0, 0, 0],
	[6, 0, 0, 1, 9, 5, 0, 0, 0],
	[0, 9, 8, 0, 0, 0, 0, 6, 0],
	[8, 0, 0, 0, 6, 0, 0, 0, 3],
	[4, 0, 0, 8, 0, 3, 0, 0, 1],
	[7, 0, 0, 0, 2, 0, 0, 0, 6],
	[0, 6, 0, 0, 0, 0, 2, 8, 0],
	[0, 0, 0, 4, 1, 9, 0, 0, 5],
	[0, 0, 0, 0, 8, 0, 0, 7, 9],
];

let grid = JSON.parse(JSON.stringify(init_grid));
let steps = [];
let currentStep = 0;
let intervalId;
let canvas;
let speed = 1000 - document.getElementById("speed-slider").value;
let currentCell = { row: -1, col: -1 };
let unsafeCell = { row: -1, col: -1 };
let reason = "";

function setup() {
	canvas = createCanvas(450, 480);
	canvas.parent("sudoku-grid");
	centerCanvas();
	drawGrid();
	document.getElementById("play-button").addEventListener("click", startVisualization);
	document.getElementById("pause-button").addEventListener("click", pauseVisualization);
	document.getElementById("next-button").addEventListener("click", nextStep);
	document.getElementById("previous-button").addEventListener("click", previousStep);
	document.getElementById("to-start").addEventListener("click", function () {
		currentStep = 1;
		previousStep();
	});
	document.getElementById("to-end").addEventListener("click", function () {
		currentStep = steps.length - 1;
		nextStep();
	});
	document.getElementById("speed-slider").addEventListener("input", function (event) {
		speed = 1000 - event.target.value;
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = setInterval(nextStep, speed);
		}
	});
}

function centerCanvas() {
	var x = (windowWidth - width) / 2;
	var y = (windowHeight - height) / 2;
	canvas.position(x, y);
}

function windowResized() {
	centerCanvas();
}

function drawGrid() {
	background(255);
	strokeWeight(2);

	// Draw the grid
	for (let i = 0; i <= 9; i++) {
		if (i % 3 === 0) {
			strokeWeight(4);
		} else {
			strokeWeight(1);
		}
		line(i * 50, 0, i * 50, 450);
		line(0, i * 50, 450, i * 50);
	}

	// Highlight the current cell
	if (currentCell.row !== -1 && currentCell.col !== -1) {
		fill(200, 200, 255);
		strokeWeight(2);
		rect(currentCell.col * 50, currentCell.row * 50, 50, 50);
	}

	// Fill in the numbers
	textSize(32);
	textAlign(CENTER, CENTER);
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (grid[row][col] !== 0) {
				if (unsafeCell && unsafeCell.row === row && unsafeCell.col === col) {
					fill(255, 0, 0); // Red color for unsafe cells
				} else if (init_grid[row][col] !== 0) {
					fill(150); // Gray color for initial grid values
				} else {
					fill(0); // Black color for solved values
				}
				text(grid[row][col], col * 50 + 25, row * 50 + 25);
			}
		}
	}

	// Display the reason for not accepting a cell value
	fill(0);
	textSize(16);
	textAlign(LEFT, TOP);
	text(reason, 10, 460);
}

function isSafe(grid, row, col, num) {
	for (let x = 0; x < N; x++) {
		if (grid[row][x] === num) {
			reason = `Number ${num} already in row ${row + 1}`;
			unsafeCell = { row, col: x };
			return false;
		}
		if (grid[x][col] === num) {
			reason = `Number ${num} already in column ${col + 1}`;
			unsafeCell = { row: x, col };
			return false;
		}
	}

	let startRow = row - (row % 3);
	let startCol = col - (col % 3);
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (grid[i + startRow][j + startCol] === num) {
				reason = `Number ${num} already in 3x3 box`;
				unsafeCell = { row: i + startRow, col: j + startCol };
				return false;
			}
		}
	}

	reason = "";
	return true;
}

function solveSudoku(grid) {
	let row = 0,
		col = 0;
	let emptyCell = false;

	for (row = 0; row < N; row++) {
		for (col = 0; col < N; col++) {
			if (grid[row][col] === 0) {
				emptyCell = true;
				break;
			}
		}
		if (emptyCell) {
			break;
		}
	}

	if (!emptyCell) {
		return true;
	}

	for (let num = 1; num <= 9; num++) {
		if (isSafe(grid, row, col, num)) {
			grid[row][col] = num;
			steps.push({
				grid: JSON.parse(JSON.stringify(grid)),
				currentCell: { row, col },
			}); // Save the current state
			if (solveSudoku(grid)) {
				return true;
			}
			grid[row][col] = 0;
			steps.push({
				grid: JSON.parse(JSON.stringify(grid)),
				currentCell: { row, col },
				reason: "Backtracking",
			}); // Save the backtrack state
		} else {
			grid[row][col] = num;
			steps.push({
				grid: JSON.parse(JSON.stringify(grid)),
				currentCell: { row, col },
				unsafeCell: { row: unsafeCell.row, col: unsafeCell.col },
				reason: reason,
			}); // Save the state with reason
			grid[row][col] = 0;
		}
	}

	return false;
}

let isPlaying = false;

function startVisualization() {
	isPlaying = true;
	document.getElementById("play-button").style.display = "none";
	document.getElementById("pause-button").style.display = "inline-block";
	document.getElementById("next-button").disabled = true;
	document.getElementById("previous-button").disabled = true;
	document.getElementById("to-start").disabled = true;
	document.getElementById("to-end").disabled = true;
	if (intervalId) {
		clearInterval(intervalId);
	}
	intervalId = setInterval(nextStep, speed); // Adjust the interval as needed
}

function pauseVisualization() {
	isPlaying = false;
	document.getElementById("play-button").style.display = "inline-block";
	document.getElementById("pause-button").style.display = "none";
	document.getElementById("next-button").disabled = false;
	document.getElementById("previous-button").disabled = false;
	document.getElementById("to-start").disabled = false;
	document.getElementById("to-end").disabled = false;
	if (intervalId) {
		clearInterval(intervalId);
	}
}

function nextStep() {
	if (currentStep < steps.length) {
		let step = steps[currentStep];
		grid = step.grid;
		currentCell = step.currentCell;
		reason = step.reason;
		unsafeCell = step.unsafeCell;
		drawGrid();
		currentStep++;
	}
	if (!isPlaying) {
		if (currentStep === steps.length) {
			document.getElementById("next-button").disabled = true;
			document.getElementById("to-end").disabled = true;
		} else {
			document.getElementById("next-button").disabled = false;
			document.getElementById("to-end").disabled = false;
		}
		if (currentStep === 0) {
			document.getElementById("previous-button").disabled = true;
			document.getElementById("to-start").disabled = true;
		} else {
			document.getElementById("previous-button").disabled = false;
			document.getElementById("to-start").disabled = false;
		}
	} else {
		if (currentStep === steps.length) {
			clearInterval(intervalId);
			isPlaying = false;
			document.getElementById("play-button").style.display = "inline-block";
			document.getElementById("pause-button").style.display = "none";
			document.getElementById("next-button").disabled = true;
			document.getElementById("to-end").disabled = true;
			document.getElementById("previous-button").disabled = false;
			document.getElementById("to-start").disabled = false;
			currentStep = 0;
		}
	}
}

function previousStep() {
	if (currentStep > 0) {
		currentStep--;
		let step = steps[currentStep];
		grid = step.grid;
		currentCell = step.currentCell;
		reason = step.reason;
		unsafeCell = step.unsafeCell;
		drawGrid();
	}
	if (!isPlaying) {
		if (currentStep === steps.length) {
			document.getElementById("next-button").disabled = true;
			document.getElementById("to-end").disabled = true;
		} else {
			document.getElementById("next-button").disabled = false;
			document.getElementById("to-end").disabled = false;
		}
		if (currentStep === 0) {
			document.getElementById("previous-button").disabled = true;
			document.getElementById("to-start").disabled = true;
		} else {
			document.getElementById("previous-button").disabled = false;
			document.getElementById("to-start").disabled = false;
		}
	}
}

document.getElementById("pause-button").style.display = "none";
document.getElementById("previous-button").disabled = true;
document.getElementById("to-start").disabled = true;
document.addEventListener("DOMContentLoaded", function () {
	// wait 2 seconds before executing the function
	setTimeout(function () {
		steps = [];
		currentStep = 0;
		steps.push({
			grid: JSON.parse(JSON.stringify(init_grid)),
			currentCell: { row: -1, col: -1 },
		});
		if (solveSudoku(grid)) {
			steps.push({
				grid: JSON.parse(JSON.stringify(grid)),
				currentCell: { row: -1, col: -1 },
			});
		} else {
			console.log("No solution exists");
		}
	}, 2000);
});
//document.getElementById("solve-button").addEventListener("click", function () {});
