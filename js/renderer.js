function fillCenter(canvas, context, text) {
    let textSize = context.measureText(text);
    const lines = text.split('\n');
    let y = (canvas.height - lines.length * 24) / 2;
    lines.forEach(function(line) {
        textSize = context.measureText(line);
        context.fillText(line, (canvas.width - textSize.width) / 2, y);
        y += 28;
    });
}

function fillMiddle(canvas, context, text, y) {
    const textSize = context.measureText(text);
    context.fillText(text, (canvas.width - textSize.width) / 2, y);
}

function showStat(canvas, context, gameContext) {
    if(gameContext.state === STATES.PLAY) {
        context.fillStyle = "#000";
        context.font = "24px 'Back to 1982'";
        fillMiddle(canvas, context, gameContext.score, 28);
        context.font = "12px 'Back to 1982'";
        fillMiddle(canvas, context, gameContext.highScore, 54);
    } else if(gameContext.state === STATES.OVER) {
        context.font = "24px 'Back to 1982'";
        fillCenter(canvas, context, "GAME OVER\nPRESS ENTER");
        context.fillStyle = "#000";
        context.font = "24px 'Back to 1982'";
        fillMiddle(canvas, context, gameContext.highScore, canvas.height - 48);
    } else if(gameContext.state === STATES.PAUSE) {
        if(gameContext.highScore > 0) {
            context.fillStyle = "#000";
            context.font = "24px 'Back to 1982'";
            fillMiddle(canvas, context, gameContext.highScore, canvas.height - 48);
        }
    }
}