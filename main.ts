let snakePartsX: number[] = [];
let snakePartsY: number[] = [];

let gamePause = 250;

let autoPlay = false;

let mazeSize = 8;
let score = 0

let candyX = 0;
let candyY = 0;
let candyLedX = 0;
let candyLedY = 0;

let compassesX = 0;
let compassesY = 0;

let viewPointX = 0;
let viewPointY = 0;

let gameInProgress: boolean = false;

enum Dir { UP, DOWN, LEFT, RIGHT };

let currentDirection: number;

function isBorder(x: number,y: number) {
    if ( x == 0 || x == mazeSize-1) { 
        return true;
    }
    if ( y==0 || y == mazeSize -1) {
        return true;
    }
    return false;
}

function drawViewPort() {
    let center = getSnakeHead()
    
    let x = center[0]-2;
    let y = center[1]-2;

    if (x < 0) {
        x = 0
    }
    if ( x + 5 > mazeSize ) {
        x = x - (x+5-mazeSize);
    }
    if (y - 2 < 0) {
        y = 0
    }
    if (y + 5 > mazeSize) {
        y = y - (y +5 - mazeSize)
    }
    viewPointX = x
    viewPointY = y

    let i = 0
    let j = 0
    for (i=0; i < 5; i++) {
        for (j=0; j<5; j++) {
            if (isBorder(x+i,y+j)) {
                led.plotBrightness(i,j, 10)
            } else {
                led.unplot(i,j)
                // led.brightness(i,j, 255)
            }
        }
    }
}

function getRandomOrdinate() {
    return Math.randomRange(1, mazeSize - 2);
}

function getRandomPoint() {
    let x = getRandomOrdinate();
    let y = getRandomOrdinate();
    while (isBorder(x,y) || partOfSnake([x,y])) {
        x = getRandomOrdinate();
        y = getRandomOrdinate();
    }
    return [x, y]
}

function drawCompassess() {
    // Candy to the left
    if ( candyLedX < 0 ) {
        if ( candyLedY < 0 ) {
            compassesX = 0;
            compassesY = 0;
            return;
        }
        if (candyLedY > 4) {
            compassesX = 0;
            compassesY = 4;
            return;
        }
        compassesX = 0;
        compassesY = 2;
        return
    }

    // Candy to the right
    if (candyLedX > 4 ) {
        if (candyLedY < 0) {
            compassesX = 4;
            compassesY = 0;
            return;
        }
        if (candyLedY > 4) {
            compassesX = 4;
            compassesY = 4;
            return;
        }
        compassesX = 4;
        compassesY = 2;
        return
    }

    if (candyLedY < 0 ) {
        compassesX = 2;
        compassesY = 0;
        return
    }
    if (candyLedY > 4) {
        compassesX = 2;
        compassesY = 4;
        return
    }
    compassesX = -1;
    compassesY = -1;
}

function removeSnake() {
    let i = 0;

    for (i = 0; i < snakePartsX.length; i++) {
        led.unplot(snakePartsX[i] - viewPointX, snakePartsY[i] - viewPointY)
    }
}

function drawSnake() {
    let i = 0;

    for (i = 0; i < snakePartsX.length; i++) {
        let brightness = 10
        if ( i == snakePartsX.length - 1 ) { brightness = 255 }
        led.plotBrightness(snakePartsX[i] - viewPointX, snakePartsY[i] - viewPointY, brightness)
    }
}

function drawGame() {
    drawSnake()

    candyLedX = candyX - viewPointX
    candyLedY = candyY - viewPointY

    drawCompassess();
}

function getSnakeHead() {
    let length = snakePartsX.length;
    return [snakePartsX[length - 1], snakePartsY[length - 1]]
}

function partOfSnake(t: number[]) {
    let i = 0
    for (i=0; i < snakePartsX.length; i++) {
        if (snakePartsX[i] == t[0] && snakePartsY[i]==t[1]) {
            return true
        }
    }
    return false;
}

function illegalPosition(t: number[]) {
    // Do I collide with wall?
    if (isBorder(t[0], t[1])) {
        return true;
    }

    // Do I collide with myself?
    if (partOfSnake(t)) {
        return true;
    }

    return false;
}

function moveSnake(headPosition: number[]) {
    snakePartsX.push(headPosition[0])
    snakePartsY.push(headPosition[1])
    let x = snakePartsX.shift()
    let y = snakePartsY.shift()
}

function getNewPosition(headPosition: number[], direction: number) {
    let newPosition = headPosition
    if (direction == Dir.UP) {
        newPosition[1]--;
    }
    if (direction == Dir.DOWN) {
        newPosition[1]++;
    }
    if (direction == Dir.LEFT) {
        newPosition[0]--;
    }
    if (direction == Dir.RIGHT) {
        newPosition[0]++;
    }
    return newPosition
}

function makeCandy() {
    let startCandy = getRandomPoint();
    candyX = startCandy[0]
    candyY = startCandy[1]
}

function resetGame() {
    led.plotAll()
    led.toggleAll()

    gamePause = 1000
    score = 0

    snakePartsX = []
    snakePartsY = []

    snakePartsX.push(1)
    snakePartsY.push(Math.floor(mazeSize/2))

    gameInProgress = true;

    currentDirection = Dir.RIGHT

    makeCandy();
}

resetGame()

basic.forever(function () {
    if (gameInProgress) {
        led.plotBrightness(candyLedX, candyLedY, 255)
        basic.pause(100);
        led.plotBrightness(candyLedX, candyLedY, 0);
        basic.pause(100);
    }
})

basic.forever(function () {
    if (gameInProgress) {
        led.plotBrightness(compassesX, compassesY, 10)
        basic.pause(50);
        led.plotBrightness(compassesX, compassesY, 50);
        basic.pause(50);
        led.plotBrightness(compassesX, compassesY, 100)
        basic.pause(50);
    }
})

input.onButtonPressed(Button.A, function() {
    if (currentDirection == Dir.UP) {
        currentDirection = Dir.LEFT
        return
    }
    if (currentDirection == Dir.LEFT) {
        currentDirection = Dir.DOWN
        return
    }
    if (currentDirection == Dir.DOWN) {
        currentDirection = Dir.RIGHT
        return
    }
    if (currentDirection == Dir.RIGHT) {
        currentDirection = Dir.UP
        return
    }
})

input.onButtonPressed(Button.B, function () {
    if (currentDirection == Dir.UP) {
        currentDirection = Dir.RIGHT
        return
    }
    if (currentDirection == Dir.RIGHT) {
        currentDirection = Dir.DOWN
        return
    }
    if (currentDirection == Dir.DOWN) {
        currentDirection = Dir.LEFT
        return
    }
    if (currentDirection == Dir.LEFT) {
        currentDirection = Dir.UP
        return
    }
})

input.onButtonPressed(Button.AB, function() {
    autoPlay = !autoPlay

    gamePause = 1000
})

function gameOver() {
    gameInProgress = false;
    led.unplot(candyX, candyY)
    basic.showNumber(score)
    basic.pause(2000)
    resetGame();
}

function getPossibleDirections() {
    let myPossibleDirections: number[] = []
    let allDirections = [Dir.RIGHT, Dir.LEFT, Dir.UP, Dir.DOWN]
    let i = 0;
    for (i = 0; i < 4; i++) {
        let dir = allDirections[i]
        let newPosition = getNewPosition(getSnakeHead(), dir)
        if (!illegalPosition(newPosition)) {
            myPossibleDirections.push(dir)
        }
    }
    return myPossibleDirections
}

function suggestDirection(possibleDirections: number[]) {
    let headPosition = getSnakeHead()
    let i = 0
    let newdirection = -1;

    for (i = 0; i < possibleDirections.length; i++) {
        let dir = possibleDirections[i]
        if (dir == Dir.LEFT && candyX < headPosition[0]) {
            newdirection = dir;
        }
        if (dir == Dir.RIGHT && candyX > headPosition[0]) {
            newdirection = dir;
        }
        if (dir == Dir.UP && candyY < headPosition[1]) {
            newdirection = dir;
        }
        if (dir == Dir.DOWN && candyY > headPosition[1]) {
            newdirection = dir;
        }
    }
    return newdirection;
}

basic.forever(function () {
    drawViewPort()
    drawGame()
    music.playTone(262, music.beat(BeatFraction.Eighth))
    basic.pause(gamePause)
    removeSnake()
    basic.pause(50)
    
    let headPosition = getSnakeHead()
    let newPosition : number[]
    
    if (!autoPlay) {
        newPosition = getNewPosition(headPosition, currentDirection)
        if (illegalPosition(newPosition)) {
            return gameOver();
        }
    } else {
        let possibleDirections = getPossibleDirections()
        if (possibleDirections.length == 0) {
            return gameOver();
        }

        let newdirection = suggestDirection(possibleDirections)
        if (newdirection == -1) {
            newdirection = possibleDirections[Math.randomRange(0, possibleDirections.length)]
        }

        newPosition = getNewPosition(headPosition, newdirection)

        gamePause = 150
    }
       
    moveSnake(newPosition)
    if (newPosition[0] == candyX && newPosition[1] == candyY) {
        music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), SoundExpressionPlayMode.UntilDone)
        snakePartsX.push(newPosition[0])
        snakePartsY.push(newPosition[1])
        makeCandy();
        if (gamePause>500) {
            gamePause-=55;
        }
        score ++
    }
})


