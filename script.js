const canvas            = document.getElementById('game-canvas');
const backgroundCanvas  = document.getElementById('background-canvas');
const scoreDisplay      = document.getElementById('score');
const gameOverlay       = document.getElementById('game-overlay');

const ctx               = canvas.getContext('2d');
const bgCtx             = backgroundCanvas.getContext('2d');

const canvasW           = canvas.width;
const canvasH           = canvas.height;

var deltaTime;
var previousFrameEndTime;

var moveDirX;
var moveDirY;

var timeToMove;
var timeSinceLastMove;

var foodEaten;
var foodPos;

var imageData;

document.onkeydown = function (event) {
    switch (event.key) {
        case 'ArrowUp':     moveDirY = -1; moveDirX = 0; break;
        case 'ArrowRight':  moveDirX =  1; moveDirY = 0; break;
        case 'ArrowDown':   moveDirY =  1; moveDirX = 0; break;
        case 'ArrowLeft':   moveDirX = -1; moveDirY = 0; break;
    }
}

function setScore (score) {
    scoreDisplay.textContent = score;
}

function drawPixel (x, y, r, g, b) {
    imageData.data[ ( y * ( canvasW ) * 4 ) + ( x * 4 )     ] = r;
    imageData.data[ ( y * ( canvasW ) * 4 ) + ( x * 4 ) + 1 ] = g;
    imageData.data[ ( y * ( canvasW ) * 4 ) + ( x * 4 ) + 2 ] = b;
    imageData.data[ ( y * ( canvasW ) * 4 ) + ( x * 4 ) + 3 ] = 255;
}

function SnakePiece (x, y, previous) {
    this.x = x;
    this.y = y;

    this.previous = previous;
}

function Pos (x, y) {
    this.x = x;
    this.y = y;
}

function startGame() {
    moveDirX = 0;
    moveDirY = -1;

    timeToMove = 150;
    timeSinceLastMove = 0;
    foodEaten = 0;

    availablePos = [];
    for (var i = 1; i < canvasH - 1; i++) {
        for (var j = 1; j < canvasW - 1; j++) {
            availablePos.push(new Pos(j, i));
        }
    }

    head = new SnakePiece(15, 15, new SnakePiece(14, 15, new SnakePiece(13, 15, null)));
    removeAvailablePos(15, 15);
    removeAvailablePos(14, 15);
    removeAvailablePos(13, 15); 

    foodPos = [];

    spawnFood();

    gameOverlay.classList.remove('visible');

    deltaTime = 0;

    setScore(0);

    previousFrameEndTime = Date.now();
    window.requestAnimationFrame(gameLoop);
}

function removeAvailablePos (x, y) {
    for (var i = 0; i < availablePos.length; i++) { 
        if (availablePos[i].x === x && availablePos[i].y === y) {
            availablePos.splice(i, 1);
        }
    }
}

function endGame() {
    gameOverlay.classList.add('visible');
}

function spawnFood () {
    foodPos = availablePos[Math.round(Math.random() * (availablePos.length - 1))];

    removeAvailablePos(foodPos.x, foodPos.y);
}

bgCtx.strokeStyle = 'black';
bgCtx.strokeRect(0.5, 0.5, backgroundCanvas.width - 1, backgroundCanvas.height - 1);

const gameLoop = function () {
    deltaTime = Date.now() - previousFrameEndTime;
    imageData = ctx.createImageData(canvasW, canvasH);

    timeSinceLastMove += deltaTime;
    if (timeSinceLastMove > timeToMove) {
        timeSinceLastMove = 0;

        var prevPieceX = head.x;
        var prevPieceY = head.y;

        head.x += moveDirX;
        head.y += moveDirY;

        if (head.x < 1 || head.x > canvasW - 2 || head.y < 1 || head.y > canvasW - 2) {
            endGame();
            return;
        }

        var snakePiece = head.previous;
        while (snakePiece) {

            if (head.x === snakePiece.x && head.y === snakePiece.y) {
                if ( snakePiece === head.previous ) {
                    moveDirX *= -1;
                    moveDirY *= -1;

                    head.x = prevPieceX + moveDirX;
                    head.y = prevPieceY + moveDirY;

                    break;
                }
                endGame();
                return;
            }

            snakePiece = snakePiece.previous;
        } 

        var hasEaten = false;
        if (foodPos.x === head.x && foodPos.y === head.y ) {
            setScore(++foodEaten);
            spawnFood();
            
            timeToMove = ( 400 / Math.log( foodEaten + 15 ));
            
            hasEaten = true;
        }

        removeAvailablePos(head.x, head.y);

        var snakePiece = head.previous;
        while (snakePiece) {
            var auxX = snakePiece.x;
            var auxY = snakePiece.y;

            snakePiece.x = prevPieceX;
            snakePiece.y = prevPieceY;

            prevPieceX = auxX;
            prevPieceY = auxY;

            if (!snakePiece.previous) {
                if (hasEaten) {
                    snakePiece.previous = new SnakePiece(auxX, auxY, null);
                    break;
                }
                else {
                    availablePos.push(new Pos(auxX, auxY));
                }
            }

            snakePiece = snakePiece.previous;
        }
    }

    var curSnakePiece = head;
    while(curSnakePiece) {
        drawPixel(curSnakePiece.x, curSnakePiece.y, 0, 0, 0);
        curSnakePiece = curSnakePiece.previous;
    }

    drawPixel(foodPos.x, foodPos.y, 255, 0, 0);

    ctx.putImageData(imageData, 0, 0);

    keyPressed = null;
    previousFrameEndTime = Date.now();
    window.requestAnimationFrame(gameLoop);
}


startGame();