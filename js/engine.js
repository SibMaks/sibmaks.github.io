let moveUp = (function () {
	let fly = new Audio("audio/fly.mp3");
	return function (bird) {
		bird.y -= 25;
		fly.play();
	}
}) ();

const STATES = {PAUSE: 'PAUSE', OVER: 'OVER', PLAY: 'PLAY'};

function restart(canvas, context) {
	context.bird.x = 10;
	context.bird.y = 150;
	context.pipe.splice(0, context.pipe.length);

	context.pipe.push(
		{
			x : canvas.width,
			y : 0
		}
	);
	context.score = 0;
}

$(function () {
	let canvas = $("#game-canvas")[0];
	let context = canvas.getContext("2d");
	let fgXOffset = 0;

	let gameContext = {
		bird: {image: new Image()},
		pipe: [],
		score: 0,
		state: STATES.PAUSE,
		highScore: 0,
		gravity: 1.5
	};
	gameContext.bird.image.src = "textures/bird.png";

	// Массив блоков
	restart(canvas, gameContext);

	let bg = new Image();
	bg.src = "textures/bg.png";

	let fg = new Image();
	fg.src = "textures/fg.png";

	let pipeUp = new Image();
	pipeUp.src = "textures/pipeUp.png";

	let pipeBottom = new Image();
	pipeBottom.src = "textures/pipeBottom.png";

	// Звуковые файлы
	let scoreAudio = new Audio("audio/score.mp3");

	let gap = 90;

	// При нажатии на какую-либо кнопку прыгаем
	$(document).keydown(function (e) {
		if(gameContext.state === STATES.PAUSE) {
			gameContext.state = STATES.PLAY;
		} else if(gameContext.state === STATES.OVER && e.key === 'Enter') {
			gameContext.state = STATES.PLAY;
		} else if(gameContext.state === STATES.PLAY) {
			moveUp(gameContext.bird);
		}
	});

	draw();

	function draw() {
		context.drawImage(bg, 0, 0);

		if(gameContext.state === STATES.PLAY) {
			for (let i = 0; i < gameContext.pipe.length; i++) {
				context.drawImage(pipeUp, gameContext.pipe[i].x, gameContext.pipe[i].y);
				context.drawImage(pipeBottom, gameContext.pipe[i].x, gameContext.pipe[i].y + pipeUp.height + gap);

				gameContext.pipe[i].x--;

				//если текущий блок появляется на экране
				if (gameContext.pipe[i].x === (canvas.width / 2)) {
					//делаем не сильно большой разброс
					const min = 0.6;
					const delta = Math.random() * (1 - min) + min;
					gameContext.pipe.push({
						x: canvas.width,
						y: Math.floor(delta * pipeUp.height) - pipeUp.height
					});
				}

				// Отслеживание прикосновений
				if (gameContext.bird.x + gameContext.bird.image.width >= gameContext.pipe[i].x
					&& gameContext.bird.x <= gameContext.pipe[i].x + pipeUp.width
					&& (gameContext.bird.y <= gameContext.pipe[i].y + pipeUp.height
						|| gameContext.bird.y + gameContext.bird.image.height >= gameContext.pipe[i].y + pipeUp.height + gap)
					|| gameContext.bird.y + gameContext.bird.image.height >= canvas.height - fg.height) {
					if (gameContext.highScore < gameContext.score) {
						gameContext.highScore = gameContext.score;
					}
					gameContext.state = STATES.OVER;
					restart(canvas, gameContext);
					break;
				}

				//Если пролетели блок
				if (gameContext.pipe[i].x === 5) {
					gameContext.score++;
					scoreAudio.play();
				}
			}
		}

		//Сбрасываем в ноль нижнюю часть
		if(Math.abs(--fgXOffset) > fg.width) {
			fgXOffset = 0;
		}

		//рисуем "землю"
		context.drawImage(fg, fgXOffset, canvas.height - fg.height);
		context.drawImage(fg, fgXOffset + fg.width, canvas.height - fg.height);

		//рисуем питцу
		context.drawImage(gameContext.bird.image, gameContext.bird.x, gameContext.bird.y);

		showStat(canvas, context, gameContext);

		requestAnimationFrame(draw);
	}
});