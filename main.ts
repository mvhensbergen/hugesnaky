/* kop = rechts */
let snakePartsX: number[] = [];
let snakePartsY: number[] = [];

let gameSpeed = 1000;

let mazeSize = 12;
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
                led.plot(i,j)
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
    let compassessBrightness = 10;

    let headX = getSnakeHead()[0]
    let headY = getSnakeHead()[1]

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

function drawSnakeAndCandy() {
    let i = 0;
    
    for (i = 0; i < snakePartsX.length; i++) {
        led.plotBrightness(snakePartsX[i]-viewPointX, snakePartsY[i]-viewPointY, (i + 1) / snakePartsX.length * 255)
    }

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
    // Do I collide with candy?
    if (t[0] == candyX && t[1] == candyY) {
        return false;
    }

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

    gameSpeed = 1000
    score = 0

    gameInProgress = true;

    snakePartsX = []
    snakePartsY = []

    // let startSnake = getRandomPoint()
    snakePartsX.push(1)
    snakePartsY.push(mazeSize/2)

    currentDirection = Dir.RIGHT

    makeCandy();
}

resetGame()

basic.forever(function () {
    if (gameInProgress) {
        led.plotBrightness(candyLedX, candyLedY, 255)
        basic.pause(100);
        led.plotBrightness(candyLedX, candyLedY, 10);
        basic.pause(100);
    }
})

basic.forever(function () {
    if (gameInProgress) {
        led.plotBrightness(compassesX, compassesY, 10)
        basic.pause(50);
        led.plotBrightness(compassesX, compassesY, 30);
        basic.pause(50);
        led.plotBrightness(compassesX, compassesY, 50)
        basic.pause(50);
        led.plotBrightness(compassesX, compassesY, 70);
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

basic.forever(function () {
    gameInProgress = true
    drawViewPort()
    drawSnakeAndCandy()
    music.playTone(262, music.beat(BeatFraction.Eighth))
    basic.pause(gameSpeed)
    
    let headPosition = getSnakeHead()
    let newPosition = getNewPosition(headPosition, currentDirection)
    //currentDirection = Math.randomRange(0, 3)

    let count = 0;
    if (illegalPosition(newPosition)) {    
        gameInProgress = false;
        led.unplot(candyX, candyY)
        //led.setBrightness(candyLedX,candyLedY,255)
        basic.showNumber(score)
        basic.pause(2000)
        resetGame();
    } else {
        moveSnake(newPosition)
        if (newPosition[0] == candyX && newPosition[1] == candyY) {
            music.playSoundEffect(music.createSoundEffect(WaveShape.Sine, 5000, 0, 255, 0, 500, SoundExpressionEffect.None, InterpolationCurve.Linear), SoundExpressionPlayMode.UntilDone)
            snakePartsX.push(newPosition[0])
            snakePartsY.push(newPosition[1])
            makeCandy();
            gameSpeed-=55;
            score ++
        }
    }
    
})


