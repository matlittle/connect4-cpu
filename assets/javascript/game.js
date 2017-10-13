// Variable for grid matrix

var gridMatrix = [[,,,,,],[,,,,,],[,,,,,],[,,,,,],[,,,,,],[,,,,,]];

// Function to create the grid system and assign X/Y coordinates
function buildGrid() {
	var boardDiv = $("#board");
	for(var y = 5; y >= 0; y -= 1) {
		var rowDiv = $("<div>").addClass("row");
		for(var x = 0; x <= 5; x += 1) {
			var colDiv = $("<div>").addClass("col-xs-2 cell");
			$(colDiv).attr("x", x).attr("y",y);
			$(rowDiv).append(colDiv);
		}
		$(boardDiv).append(rowDiv);
	}

	// Click event for entire grid to determine drop column
	$(".cell").click(function() {
		cellClicked(this);
	})

	$("#pageDiv").keyup(function() {
		return;
	});
}

buildGrid();

// Function to toggle active player
var currentPlayer = "r";
var redWins = 0, blackWins = 0;

function togglePlayer() {
	if(currentPlayer === "r") {
		currentPlayer = "b";
		$("#player").css("background-color","black");
		$("#currPlayer").text("Black");
		$("#board").css("border-bottom","10px solid black");
		
	} else if(currentPlayer === "b") {
		currentPlayer = "r";
		$("#player").css("background-color","red");
		$("#currPlayer").text("Red");
		$("#board").css("border-bottom","10px solid red");

	}
}

// Function will add piece to the clicked column in lowest index position.  Lower left is [0] [0]
function cellClicked(cell) {

	var x = parseInt($(cell).attr("x"));

	for(var y = 0; y <= 5; y += 1) {

		if(gridMatrix[x][y] == undefined) {
			addPiece(x,y);
			return;
		}
	}

	return;
}

// Populate piece color
function addPiece(x,y) {
	var currentCell = $(".cell[x='"+x+"'][y='"+y+"']");

	$(currentCell).addClass(currentPlayer);
	$(currentCell).removeClass("cell");

	if(currentPlayer === "r") {
		gridMatrix[x][y] = "r";
	} else {
		gridMatrix[x][y] = "b";
	}

	// update possible moves array
	ai.possMoves[x] += 1;

	determineMove();


	if(winCheck(x,y)) {
		console.log("win");
		updateScore();
		promptWin();
	} else {
		togglePlayer();
	}
}

// Function to check if the game is won
function winCheck(x, y) {
	//console.log(x);
	//console.log(y);
	// row and column check
	var row = 0, column = 0;
	for(var i = 0; i <= 5; i += 1) {
		if(gridMatrix[x][i] === currentPlayer) {
			column += 1;
		} else {
			column = 0;
		}

		if(gridMatrix[i][y] === currentPlayer) {
			row += 1;
		} else {
			row = 0;
		}

		if(row === 4 || column === 4) {
			return true;
		}
	}

	var lx = x, ly = y, hx = x, hy = y;

	while(lx > 0 && ly > 0) {
		lx -= 1;
		ly -= 1;
	}

	while(hx > 0 && hy < 5) {
		hx -= 1;
		hy += 1;
	}

	// Low Diagonal Check
	if(lx <= 2) {
		var diag = 0
		while(lx <= 5 && ly <= 5) {
			if(gridMatrix[lx][ly] === currentPlayer) {
				diag += 1;
			} else {
				diag = 0;
			}

			if(diag === 4) {
				return true;
			}

			lx += 1;
			ly += 1;
		}
	}

	// High Diagonal Check
	if(hx <= 2) {
		var diag = 0
		while(hx <= 5 && hy >= 0) {
			if(gridMatrix[hx][hy] === currentPlayer) {
				diag += 1;
			} else {
				diag = 0;
			}

			if(diag === 4) {
				return true;
			}

			hx += 1;
			hy -= 1;
		}
	}
}

// If game is won, add score to proper color and reset board
function updateScore() {
	if(currentPlayer === "r") {
		redWins += 1;
	} else {
		blackWins +=1;
	}
	$("#redCount").text(redWins);
	$("#blackCount").text(blackWins);
}

// Prompt if the user wins
function promptWin() {
	var pageDiv = $("<div>").attr("id","pageDiv");

	var winDiv = $("<div>").attr("id", "winDiv");
	if(currentPlayer === "r") {
		var winText = $("<h1>").attr("id","winText").text("Red Wins!");
	} else {
		var winText = $("<h1>").attr("id","winText").text("Black Wins!");
	}

	var keyDiv = $("<p>").attr("id","keyDiv");

	var pressKey = "Press Any Key to Play Again";

	$(winDiv).append(winText);
	$(winDiv).append("<br>");
	$(keyDiv).append(pressKey);
	$(winDiv).append(keyDiv);
	$(pageDiv).append(winDiv);

	$("#board").append(pageDiv);

	$("#pageDiv").keyup(function() {
		resetGame();
	});

	$("#pageDiv").click(function() {
		resetGame();
	})
}

// Reset game on win
function resetGame() {
	$("#board").html("");
	buildGrid();

	currentPlayer = "r";
	gridMatrix = [[,,,,,],[,,,,,],[,,,,,],[,,,,,],[,,,,,],[,,,,,]];

	$("#pageDiv").keyup(function() {
		return;
	});

	$("#pageDiv").click(function() {
		return;
	})
}


var ai = {
	possMoves: [0,0,0,0,0,0],
	threat: [0,0,0,0,0,0],
	offense: [0,0,0,0,0,0],
	red: {
		possTwo: [0,0,0,0,0,0],
		possThree: [0,0,0,0,0,0],
		possFour: [0,0,0,0,0,0]
	},
	black: {
		possTwo: [0,0,0,0,0,0],
		possThree: [0,0,0,0,0,0],
		possFour: [0,0,0,0,0,0]
	}
}

// determine next move
function determineMove() {

	/* get copy of current grid 
	have to use slice() method, since arrays are passed by reference not value.*/
	var possGrid = gridMatrix.slice();


	function resetAIPossibilities() {
		ai.red = {
			possTwo: [0,0,0,0,0,0],
			possThree: [0,0,0,0,0,0],
			possFour: [0,0,0,0,0,0]
		},
		ai.black = {
			possTwo: [0,0,0,0,0,0],
			possThree: [0,0,0,0,0,0],
			possFour: [0,0,0,0,0,0]
		}
	}
	resetAIPossibilities();


	function MoveConstructor() {
		this.red = {
			in: {
				row: 0, 
				col: 0, 
				diagD: 0, 
				diagU: 0
			},
			poss: {
				row: 0, 
				col: 0, 
				diagD: 0, 
				diagU: 0
			}
		}
		this.black = {
			in: {
				row: 0, 
				col: 0, 
				diagD: 0, 
				diagU: 0
			},
			poss: {
				row: 0, 
				col: 0, 
				diagD: 0, 
				diagU: 0
			}
		}
	}


	function possibleMove(x, y, type, color) {

		/* takes x/y position of possible move
		type of check (row, col, diagU, DiagD) 
		color of player (red, black) */

		/* set possible grid position to color we want to check */
		possGrid[x][y] = color[0];

		console.log(JSON.stringify(possGrid));
		console.log(possGrid[x][y]);
		console.log(`x: ${x}  y: ${y}`);

		var moves = new MoveConstructor();

		for(var i = 0; i <= 5; i += 1) {

			if(type === "row") {
				var currPosition = possGrid[i][y];
			}else if(type === "col") {
				var currPosition = possGrid[x][i];
			}

			/* loop through check, increment "in" and "poss" moves where the current 
			color is found in that position. Increment only "poss" moves when the position
			is blank. Reset "in" and "poss" moves when the alternate color is found */
			if(currPosition === color[0]) {
				moves[color].in[type] += 1;
				moves[color].poss[type] += 1;
			} else if(currPosition === undefined) {
				console.log("undefined");
				moves[color].poss[type] += 1;
			}else {
				moves[color].in[type] = 0;
				moves[color].poss[type] = 0;
			}

			/* if there's a possibility of four moves in a row, increment the appropriate 
			ai array to show that the current color played at this position would result 
			in a "possible nth number" in a row */
			if(moves[color].poss[type] === 4) {
				if(moves[color].in[type] === 2){
					ai[color].possTwo[x] += 1;
				}else if(moves[color].in[type] === 3) {
					ai[color].possThree[x] += 1;
				}else if(moves[color].in[type] === 4) {
					ai[color].possFour[x] += 1;
				}

				/* decrement "possible" moves by 1 if it's equal to 4*/
				moves[color].poss[type] -= 1;

				/* only decrement "in" moves if the previous 4th position was that color */
				if(type === "row") {
					if(possGrid[i-3][y] === color[0]) {
						moves[color].in[type] -= 1;
					}
				} else if(type === "col") {
					if(possGrid[x][i-3] === color[0]) {
						moves[color].in[type] -= 1;
					}
				}
			}

			console.log( JSON.stringify(moves[color]) )
		}



		/* revert possible move to null */
		possGrid[x][y] = null;

		console.log(JSON.stringify(ai[color]));
	}


	/* loop through possible moves array */
	for(var i = 0; i <= 0; i += 1) {
		/* only process if column isn't full */
		if(ai.possMoves[i] < 6) {
			/* get x and y coords */
			var x = i;
			var y = ai.possMoves[i];

			console.log("possible move -> X: "+x+" Y: "+y);

			possibleMove(x, y, "row", "red");
			//possibleMove(x, y, "col", "red");

		}
	}
}