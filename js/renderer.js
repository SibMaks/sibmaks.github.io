// init 3D stuff
function makePlatform( url ) {
    let placeholder = new THREE.Object3D();
    let loader = new THREE.ObjectLoader();
    loader.load( url, function ( platform ) {
        placeholder.add( platform );
    } );
    return placeholder;
}

let resize = function (renderer, camera) {
    let viewport = gameViewportSize();
    renderer.setSize( viewport.width, viewport.height );
    camera.aspect = viewport.width / viewport.height;
    camera.updateProjectionMatrix();
};

let updateCamera = ( function () {
    let euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
    return function (camera) {
        euler.x = camera.rotation.x;
        euler.y = camera.rotation.y;
        camera.quaternion.setFromEuler( euler );
        camera.position.copy( motion.position );
        camera.position.y += 3.0;
    };
} )();

let gameViewportSize = function () {
    return {
        width: window.innerWidth, height: window.innerHeight
    };
};

function makeFloor() {
	// floor
				var floorGeometry = new THREE.PlaneBufferGeometry( 2000, 2000, 100, 100 );
				floorGeometry.rotateX( - Math.PI / 2 );
				// vertex displacement
				
			var vertex = new THREE.Vector3();
			var color = new THREE.Color();

				var position = floorGeometry.attributes.position;
				for ( var i = 0, l = position.count; i < l; i ++ ) {
					vertex.fromBufferAttribute( position, i );
					vertex.x += Math.random() * 20 - 10;
					vertex.y += Math.random() * 2;
					vertex.z += Math.random() * 20 - 10;
					position.setXYZ( i, vertex.x, vertex.y, vertex.z );
				}
				floorGeometry = floorGeometry.toNonIndexed(); // ensure each face has unique vertices
				position = floorGeometry.attributes.position;
				var colors = [];
				for ( var i = 0, l = position.count; i < l; i ++ ) {
					color.setHSL( Math.random() * 0.3 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
					colors.push( color.r, color.g, color.b );
				}
				floorGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
				var floorMaterial = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );
				var floor = new THREE.Mesh( floorGeometry, floorMaterial );
	return floor;
}

function getRendererContext() {
    let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    let controls = new THREE.PointerLockControls( camera );
    let blocker = $( '#blocker' );
    let instructions = $( '#instructions' );
    instructions.on('click', function () {
        controls.lock();
    });
    controls.addEventListener( 'lock', function () {
        instructions.css('display', 'none');
        blocker.css('display', 'none');
    } );
    controls.addEventListener( 'unlock', function () {
        instructions.css('display', '');
        blocker.css('display', 'block');
    } );

    let scene = new THREE.Scene();
    //Подгружаем SkyBox
    let envMap = new THREE.CubeTextureLoader().load([
        'textures/cube/skybox/px.jpg', // right
        'textures/cube/skybox/nx.jpg', // left
        'textures/cube/skybox/py.jpg', // top
        'textures/cube/skybox/ny.jpg', // bottom
        'textures/cube/skybox/pz.jpg', // back
        'textures/cube/skybox/nz.jpg' // front
    ]);
    envMap.format = THREE.RGBFormat;
    scene.background = envMap;
    //Туман
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );
    //scene.add(makePlatform(
    //    'models/json/platform/platform.json'
    //));
	scene.add(makeFloor());
    scene.add(controls.getObject());

    let renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', function() {resize(renderer, camera);}, false);

    resize(renderer, camera);
    return {renderer: renderer, scene: scene, camera: camera, controls: controls};
}