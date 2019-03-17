// позиция игрока, ускорение, поворот, вектор вращения
let motion = {
				airborne: false,
				position: new THREE.Vector3(), velocity: new THREE.Vector3(),
				direction: new THREE.Vector3(), spinning: new THREE.Vector2()
			};

motion.position.y = - 150;

let keys = { SP: 32, W: 87, A: 65, S: 83, D: 68 };
let keysPressed = {};
	
//Игровые объекты
var objects = [];

// сброс позиции игрока
let resetPlayer = function (context) {
	//motion.position.copy( context.camera.position );
	context.camera.position.copy( motion.position );
	if ( motion.position.y < - 123 ) {
		motion.position.set( - 2, 7.7, 25 );
		motion.velocity.multiplyScalar( 0 );
	}
};

let keyboardControls = ( function () {
	//let keysPressed = {};
	( function ( watchedKeyCodes ) {
		let handler = function ( down ) {
			return function ( e ) {
				let index = watchedKeyCodes.indexOf( e.keyCode );
				if ( index >= 0 ) {
					keysPressed[ watchedKeyCodes[ index ] ] = down;
					e.preventDefault();
				}
			};
		};
		window.addEventListener( "keydown", handler( true ), false );
		window.addEventListener( "keyup", handler( false ), false );
	} )( [
		keys.SP, keys.W, keys.A, keys.S, keys.D
	] );
	let forward = new THREE.Vector3();
	let sideways = new THREE.Vector3();
	return function (context) {
		if ( motion.airborne ) {
			return;
		}
		// move around
		forward.set( Math.sin( context.camera.rotation.y ), 0, Math.cos( context.camera.rotation.y ) );
		sideways.set( forward.z, 0, - forward.x );
		forward.multiplyScalar( keysPressed[ keys.W ] ? - 0.1 : ( keysPressed[ keys.S ] ? 0.1 : 0 ) );
		sideways.multiplyScalar( keysPressed[ keys.A ] ? - 0.1 : ( keysPressed[ keys.D ] ? 0.1 : 0 ) );
		let combined = forward.add( sideways );
		//if ( Math.abs( combined.x ) >= Math.abs( motion.velocity.x ) ) motion.velocity.x = combined.x;
		//if ( Math.abs( combined.y ) >= Math.abs( motion.velocity.y ) ) motion.velocity.y = combined.y;
		//if ( Math.abs( combined.z ) >= Math.abs( motion.velocity.z ) ) motion.velocity.z = combined.z;
		//jump
		let vy = keysPressed[ keys.SP ] ? 0.7 : 0;
		//motion.velocity.y += vy;
	};
} )();

let jumpPads = ( function () {
	let pads = [ new THREE.Vector3( - 17.5, 8, - 10 ), new THREE.Vector3( 17.5, 8, - 10 ), new THREE.Vector3( 0, 8, 21 ) ];
	let temp = new THREE.Vector3();
	return function () {
		if (motion.airborne ) {
			return;
		}
		for ( let j = 0, n = pads.length; j < n; j ++ ) {
			if ( pads[ j ].distanceToSquared( motion.position ) < 2.3 ) {
				// calculate velocity towards another side of platform from jump pad position
				temp.copy( pads[ j ] );
				temp.y = 0;
				temp.setLength( - 0.8 );
				temp.y = 0.7;
				motion.airborne = true;
				motion.velocity.copy( temp );
				break;
			}
		}
	};
} )();

let applyPhysics = ( function () {
	let timeStep = 5;
	let raycaster = new THREE.Raycaster();
	let prevTime = performance.now();
	raycaster.ray.direction.set( 0, - 1, 0 );
	return function ( dt, context ) {
		//let platform = context.scene.getObjectByName( "platform", true );
		if ( context.controls.isLocked ) {
			raycaster.ray.origin.copy( context.controls.getObject().position );
			raycaster.ray.origin.y -= 10;
			var intersections = raycaster.intersectObjects( objects );
			var onObject = intersections.length > 0;
			var time = performance.now();
			var delta = ( time - prevTime ) / 1000;
			motion.velocity.x -= motion.velocity.x * 10.0 * delta;
			motion.velocity.z -= motion.velocity.z * 10.0 * delta;
			motion.velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
			motion.direction.z = Number( keysPressed[ keys.W ] ) - Number( keysPressed[ keys.S ] );
			motion.direction.x = Number( keysPressed[ keys.A ] ) - Number( keysPressed[ keys.D ] );
			motion.direction.normalize(); // this ensures consistent movements in all directions
			if ( keysPressed[ keys.W ] || keysPressed[ keys.S ] ) motion.velocity.z -= motion.direction.z * 400.0 * delta;
			if ( keysPressed[ keys.A ] || keysPressed[ keys.D ] ) motion.velocity.x -= motion.direction.x * 400.0 * delta;
			if ( onObject === true ) {
				motion.velocity.y = Math.max( 0, motion.velocity.y );
				//canJump = true;
			}
			context.controls.getObject().translateX( motion.velocity.x * delta );
			context.controls.getObject().translateY( motion.velocity.y * delta );
			context.controls.getObject().translateZ( motion.velocity.z * delta );
			if ( context.controls.getObject().position.y < 10 ) {
				motion.velocity.y = 0;
				context.controls.getObject().position.y = 10;
				//canJump = true;
			}
			prevTime = time;
		}
	};
} )();

$(function() {
	let rendererContext = getRendererContext();

	let gameLoop = function ( dt ) {
		resetPlayer(rendererContext);
		keyboardControls(rendererContext);
		//jumpPads();
		applyPhysics( dt, rendererContext );
		updateCamera(rendererContext.camera);
		//console.log(motion.position.x + ", " + motion.position.y + ", " + motion.position.z);
	};

	// start the game
	let lastTimeStamp;
	let render = function ( timeStamp ) {
		let timeElapsed = lastTimeStamp ? timeStamp - lastTimeStamp : 0;
		lastTimeStamp = timeStamp;
		// call our game loop with the time elapsed since last rendering, in ms
		gameLoop( timeElapsed );
		rendererContext.renderer.render( rendererContext.scene, rendererContext.camera );
		requestAnimationFrame( render );
	};
	requestAnimationFrame( render );
});