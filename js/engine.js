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
		bird: {
			image: new Image(),
			width: 38,
			height: 26,
			frame: 0,
			frames: 3,
			direction: 1
		},
		pipe: [],
		score: 0,
		state: STATES.PAUSE,
		highScore: Cookies.get('high-score'),
		gravity: 1.5
	};
	gameContext.highScore = gameContext.highScore === undefined || gameContext.highScore == null ? 0 : gameContext.highScore;

	gameContext.bird.image.src = "textures/bird.png";

	// Массив блоков
	restart(canvas, gameContext);

	const bg = new Image();
	bg.src = "textures/bg.png";

	const fg = new Image();
	fg.src = "textures/fg.png";

	const pipeUp = new Image();
	pipeUp.src = "textures/pipeUp.png";

	const pipeBottom = new Image();
	pipeBottom.src = "textures/pipeBottom.png";

	// Звуковые файлы
	const scoreAudio = new Audio("audio/score.mp3");

	const gap = 90;
	let frames = 0;

	// При нажатии на какую-либо кнопку прыгаем
	$(document).keydown(function (e) {
		if(gameContext.state === STATES.PAUSE) {
			gameContext.state = STATES.PLAY;
		} else if(gameContext.state === STATES.OVER && e.key === 'Enter') {
			restart(canvas, gameContext);
			gameContext.state = STATES.PAUSE;
		} else if(gameContext.state === STATES.PLAY) {
			moveUp(gameContext.bird);
		}
	});

	draw();

	function draw() {
		context.drawImage(bg, 0, 0);

		for (let i = 0; i < gameContext.pipe.length; i++) {
			if(gameContext.pipe[i].x + pipeUp.width < -10) {
				gameContext.pipe.splice(i, 1);
				i--;
				continue;
			}
			context.drawImage(pipeUp, gameContext.pipe[i].x, gameContext.pipe[i].y);
			context.drawImage(pipeBottom, gameContext.pipe[i].x, gameContext.pipe[i].y + pipeUp.height + gap);

			if (gameContext.state === STATES.PLAY) {
				gameContext.pipe[i].x--;

				//если текущий блок появляется на экране
				if (gameContext.pipe[i].x === (canvas.width / 2)) {
					//делаем не сильно большой разброс
					let min = 0.55 - gameContext.score * 0.003;
					min = min < 0 ? 0 : min;
					const delta = Math.random() * (1 - min) + min;
					gameContext.pipe.push({
						x: canvas.width,
						y: Math.floor(delta * pipeUp.height) - pipeUp.height
					});
				}

				// Отслеживание прикосновений
				if (gameContext.bird.x + gameContext.bird.width >= gameContext.pipe[i].x
					&& gameContext.bird.x <= gameContext.pipe[i].x + pipeUp.width
					&& (gameContext.bird.y <= gameContext.pipe[i].y + pipeUp.height
						|| gameContext.bird.y + gameContext.bird.height >= gameContext.pipe[i].y + pipeUp.height + gap)
					|| gameContext.bird.y + gameContext.bird.height >= canvas.height - fg.height) {
					if (gameContext.highScore < gameContext.score) {
						gameContext.highScore = gameContext.score;
						Cookies.set('high-score', gameContext.highScore);
					}
					gameContext.state = STATES.OVER;
					break;
				}

				//Если пролетели блок
				if (gameContext.pipe[i].x === 5) {
					gameContext.score++;
					scoreAudio.play();
				}
			}
		}

		if(gameContext.state !== STATES.OVER) {
			//Сбрасываем в ноль нижнюю часть
			if (Math.abs(--fgXOffset) > fg.width) {
				fgXOffset = 0;
			}
		}

		//рисуем "землю"
		context.drawImage(fg, fgXOffset, canvas.height - fg.height);
		context.drawImage(fg, fgXOffset + fg.width, canvas.height - fg.height);

			//рисуем питцу
			context.drawImage(gameContext.bird.image,
				gameContext.bird.frame * (gameContext.bird.image.width / gameContext.bird.frames),
				0,
				gameContext.bird.image.width / gameContext.bird.frames,
				gameContext.bird.image.height,
				gameContext.bird.x,
				gameContext.bird.y,
				gameContext.bird.width,
				gameContext.bird.height);

		if(gameContext.state !== STATES.OVER) {
			if (++frames > 10) {
				gameContext.bird.frame += gameContext.bird.direction;
				if (gameContext.bird.frame === 2) {
					gameContext.bird.direction = -1;
				} else if (gameContext.bird.frame === 0) {
					gameContext.bird.direction = 1;
				}
				frames = 0;
			}
		}

		showStat(canvas, context, gameContext);

		requestAnimationFrame(draw);
	}
});