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
	$(".cell").on("click", function() {
		$(".cell").off('click');

		cellClicked(this);
	});

	$("#pageDiv").keyup(function() {
		return;
	});
}

buildGrid();

// Function to toggle active player
var currentPlayer = "r";
var redWins = 0, blackWins = 0;
var processingClick = false;

function togglePlayer() {
	if(currentPlayer === "r") {
		currentPlayer = "b";
		$("#player").css("background-color","black");
		$("#currPlayer").text("Black");
		$("#board").css("border-bottom","10px solid black");

		cpuMove();
		
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


// Function to determine cpu move
function cpuMove() {

	var xPos = determineMove();
	var yPos = ai.possMoves[xPos];

	setTimeout(function() {
		addPiece(xPos, yPos);

		setTimeout(function() {
			$(".cell").on("click", function() {
				$(".cell").off('click');

				cellClicked(this);
			});
		}, 100);
		
	}, 1000 * 1);

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
	},
	redBlocks: {
		possTwo: [0,0,0,0,0,0],
		possThree: [0,0,0,0,0,0],
		possFour: [0,0,0,0,0,0]
	},
	redAfter: {
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
		}
		ai.black = {
			possTwo: [0,0,0,0,0,0],
			possThree: [0,0,0,0,0,0],
			possFour: [0,0,0,0,0,0]
		}
		ai.redBlocks = {
			possTwo: [0,0,0,0,0,0],
			possThree: [0,0,0,0,0,0],
			possFour: [0,0,0,0,0,0]
		}
		ai.redAfter = {
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
		this.redBlocks = {
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
		this.redAfter = {
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


	function possibleStraightMove(x, y, color) {

		/* x/y = position of possible move */
		/* type = type of check (row, col) */
		/* color = color of player (red, black) */

		/* set possible grid position to color we want to check */
		if(color !== "redBlocks") {
			possGrid[x][y] = color[0];
		}
		
		if(color === "black" && y < 5 ) {
			possibleStraightMove(x, y+1, "redAfter");
			possibleDiagMove(x, y+1, "redAfter");

			possibleStraightMove(x, y, "redBlocks");
			possibleDiagMove(x, y, "redBlocks");
		}

		types = ["row", "col"];

		types.forEach(function(type) {

			var moves = new MoveConstructor();

			for(var i = 0; i <= 5; i += 1) {

				if(type === "row") {
					var currPosition = possGrid[i][y];
				}else if(type === "col") {
					var currPosition = possGrid[x][i];
				}

				/* loop through check, increment "in" and "poss" moves where the current color is found in that position. Increment only "poss" moves when the positionis blank. Reset "in" and "poss" moves when the alternate color is found */
				if(currPosition === color[0]) {
					moves[color].in[type] += 1;
					moves[color].poss[type] += 1;
				} else if(currPosition == undefined) {
					moves[color].poss[type] += 1;
				}else {
					moves[color].in[type] = 0;
					moves[color].poss[type] = 0;
				}

				/* if there's a possibility of four moves in a row, increment the appropriate ai array to show that the current color played at this position would result in a "possible nth number" in a row */
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
			}

		});

		/* revert possible move to null */
		if(color !== "redBlocks") {
			possGrid[x][y] = null;
		}
	}

	function possibleDiagMove(x, y, color) {

		/* set possible grid position to color we want to check */
		if(color !== "redBlocks") {
			possGrid[x][y] = color[0];
		}

		var lx = x, ly = y, hx = x, hy = y;

		/* check validity for diag up check */
		while(lx > 0 && ly > 0) {
			lx -= 1;
			ly -= 1;
		}
		if(lx <= 2 && ly <= 2){
			processMove(lx, ly, "diagU", x);
		}

		/* check validity for diag down check */
		while(hx > 0 && hy < 5) {
			hx -= 1;
			hy += 1;
		}
		if(hx <= 2 && hy >= 3){
			processMove(hx, hy, "diagD", x);
		}

		if(color !== "redBlocks") {
			possGrid[x][y] = null;
		}
		
		function processMove(x, y, type, ox) {

			var moves = new MoveConstructor();

			/* check for diag moving up from low coords, keep performing while not at the right edge or top*/	
			while(x <= 5 && (y <= 5 && y >=0)) {

				currPosition = possGrid[x][y];

				/* loop through check, increment "in" and "poss" moves where the current color is found in that position. Increment only "poss" moves when the position is blank. Reset "in" and "poss" moves when the alternate color is found */
				if(currPosition === color[0]) {
					moves[color].in[type] += 1;
					moves[color].poss[type] += 1;
				} else if(currPosition == undefined) {
					moves[color].poss[type] += 1;
				}else {
					moves[color].in[type] = 0;
					moves[color].poss[type] = 0;
				}


				/* if there's a possibility of four moves in a row, increment the appropriate ai array to show that the current color played at this position would result in a "possible nth number" in a row */
				if(moves[color].poss[type] === 4){
					if(moves[color].in[type] === 2){
						ai[color].possTwo[ox] += 1;
					}else if(moves[color].in[type] === 3) {
						ai[color].possThree[ox] += 1;
					}else if(moves[color].in[type] === 4) {
						ai[color].possFour[ox] += 1;
					}

					/* decrement "possible" moves by 1 if it's equal to 4*/
					moves[color].poss[type] -= 1;

					/* only decrement "in" moves if the previous 4th position was that color */
					if(type === "diagU") {
						if(possGrid[x-3][y-3] === color[0]) {
							moves[color].in[type] -= 1;
						}
					} else if(type === "diagD") {
						if(possGrid[x-3][y+3] === color[0]) {
							moves[color].in[type] -= 1;
						}
					}
				}


				/* increment/decrement x and y based on type of check */
				if(type === "diagU"){
					x += 1;
					y += 1;
				} else if (type === "diagD") {
					x += 1;
					y -= 1;
				}
			}
		}
	}


	function weighPossibleMoves() {
		var weight = [0,0,0,0,0,0];


		for(var i = 0; i < weight.length; i += 1) {

			for(var color in ai) {
				if(color === "red") {
					
					weight[i] -= ai[color].possTwo[i];
					weight[i] -= ai[color].possThree[i] * 10;
					weight[i] -= ai[color].possFour[i] * 100;

				} else if(color === "black") {
					
					weight[i] += ai[color].possTwo[i];
					weight[i] += ai[color].possThree[i] * 10;
					weight[i] += ai[color].possFour[i] * 1000;

				} else if(color === "redBlocks") {
					
					weight[i] += ((ai.red.possTwo[i] * 2) - ai[color].possTwo[i]);
					weight[i] += (ai.red.possThree[i] - ai[color].possThree[i]) * 20;
					weight[i] += (ai.red.possFour[i] - ai[color].possFour[i]) * 500;

				} else if(color === "redAfter") {
					
					weight[i] -= ai[color].possTwo[i];
					weight[i] -= ai[color].possThree[i] * 15;
					weight[i] -= ai[color].possFour[i] * 1000;

				}
			}
		}

		/* favor moves in middle two columns */
		weight[3] += 2;
		weight[4] += 2;

		/* get rid of invalid moves */
		for (var i = 0; i < ai.possMoves.length; i += 1) {
			if (ai.possMoves[i] === 6) {
				weight[i] -= 5000;
			}
		}


		var heighest = Math.max(...weight);
		var position = weight.indexOf(heighest);

		return position;
	}

	/* loop through possible moves array */
	for(var i = 0; i <= 5; i += 1) {
		/* only process if column isn't full */
		if(ai.possMoves[i] < 6) {
			/* get x and y coords */
			var x = i;
			var y = ai.possMoves[i];

			possibleStraightMove(x, y, "red");
			possibleStraightMove(x, y, "black");

			possibleDiagMove(x, y, "red");
			possibleDiagMove(x, y, "black");

		}

	}

	/*console.log("Red:       "+JSON.stringify(ai.red));*/
	/*console.log("Black:     "+JSON.stringify(ai.black));*/
	/*console.log("RedBlocks: "+JSON.stringify(ai.redBlocks));*/
	/*console.log("RedAfter:  "+JSON.stringify(ai.redAfter));*/
	/*console.log("----------------------------------------");*/

	var nextMove = weighPossibleMoves();

	return nextMove;
}