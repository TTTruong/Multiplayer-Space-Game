var scene, camera, keyboard, clock, spaceship, missle, renderer, missleStatus;
var asteroids = [];
var asteroidNum = 200;
var asteroidRad = 20;
var skybox;
var skyboxSize = 10000;
var sun;
var sunRad = 1000;
var shipRad = 10;

var allPlayersData = [];
var allPlayerShips = [];
var allPlayerMissles = [];

var playerID = "0";

var loadWorld = function(){

	function init()
	{
		scene = new THREE.Scene();
		keyboard = new THREEx.KeyboardState();
		clock = new THREE.Clock();
		spaceship = new THREE.Object3D();
		missle = new THREE.Object3D();
		missleStatus = new THREE.Object3D();

		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild(renderer.domElement);

		var imagePrefix = "images/";
		var directions  = ["skybox", "skybox", "skybox", "skybox", "skybox", "skybox"];
		var imageSuffix = ".png";
		var skyGeometry = new THREE.CubeGeometry(skyboxSize, skyboxSize, skyboxSize);

		camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, skyboxSize*2);
   		camera.position.set(spaceship.position.x-50,spaceship.position.y+20,spaceship.position.z+0);
    
    	camera.lookAt(spaceship.position);
    	scene.add(camera);

		var materialArray = [];
   			for (var i=0; i<6; i++)
    			materialArray.push( new THREE.MeshBasicMaterial({
    				map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
    				side: THREE.BackSide
    			}));
		var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
		skybox = new THREE.Mesh(skyGeometry, skyMaterial);
		scene.add( skybox );

		var alight = new THREE.AmbientLight(0x404040);
		var plight = new THREE.PointLight(0xffffff);
		plight.position.set(0,0,0);

		scene.add(alight);
		scene.add(plight);

 		sun = new THREE.Object3D();
		var sunGeometry = new THREE.SphereGeometry(sunRad, 100, 100, 0, Math.PI * 2, 0, Math.PI * 2);
		var sunMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/sunmap.jpg")});
		sun = new THREE.Mesh(sunGeometry, sunMaterial);
		scene.add(sun);

		for (var i=0; i<asteroidNum; i++) {
			asteroids[i] = new THREE.Object3D();
			var asteroidGeometry = new THREE.SphereGeometry(asteroidRad, 30, 30, 0, Math.PI * 2, 0, Math.PI * 2);
			var asteroidMaterial = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("images/asteroidmap.jpg")});
			asteroids[i] = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
			asteroids[i].translateX(randAsteroidPos(asteroidRad-(skyboxSize/2), (skyboxSize/2)-asteroidRad));
			asteroids[i].translateZ(randAsteroidPos(asteroidRad-(skyboxSize/2), (skyboxSize/2)-asteroidRad));
			asteroids[i].translateY(randAsteroidPos(asteroidRad-(skyboxSize/2), (skyboxSize/2)-asteroidRad));
			scene.add(asteroids[i]);
		}

		missleStatus = new THREE.Object3D();
		var geometry = new THREE.SphereGeometry(1, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
		var material = new THREE.MeshBasicMaterial({color:0x00ff00});
		missleStatus = new THREE.Mesh(geometry, material);
		scene.add(missleStatus);

		var loader = new THREE.OBJLoader(); 
		loader.load('Vaisseau.obj',

		function(object) {
			spaceship = object;
			spaceship.userData = {alive:true, size:10};
			
			// Testing spawn point (Beside each other).
			//spaceship.translateX(-2000 + Math.random()*100);
			//spaceship.translateY(Math.random()*100);
			//spaceship.translateZ(Math.random()*100);

			// Random spawn point (Actual game spawn points).
			spaceship.translateX(randSpawn(sunRad+shipRad, (skyboxSize/2)-shipRad));
			spaceship.translateY(randSpawn(sunRad+shipRad, (skyboxSize/2)-shipRad));
			spaceship.translateZ(randSpawn(sunRad+shipRad, (skyboxSize/2)-shipRad));

			spaceship.lookAt(sun);
     		scene.add(spaceship);
 		});
	}

	function randSpawn(min, max) {
		if (Math.random() < 0.5) {
			return Math.random() * (max - min) + min;
		} else {
			return -(Math.random() * (max - min) + min);
		}
	}

	function randAsteroidPos(min, max)
	{
		return Math.random() * (max - min) + min;
	}

	function collide(object)
	{
 		var dx, dy, dz, d;

 		dx = sun.position.x - object.position.x;
 		dy = sun.position.y - object.position.y;
 		dz = sun.position.z - object.position.z;
 		d = Math.sqrt(dx*dx + dy*dy +dz*dz);
 		if(d <(sunRad + object.userData.size)) {
 			object.userData.alive = false;
 			scene.remove(object);
 		}

 		for (var i=0; i<asteroidNum; i++) {
 			dx = asteroids[i].position.x - object.position.x;
 			dy = asteroids[i].position.y - object.position.y;
 			dz = asteroids[i].position.z - object.position.z;
 			d = Math.sqrt(dx*dx + dy*dy +dz*dz);
 			if(d <(asteroidRad + object.userData.size)) {
 				object.userData.alive = false;
 				scene.remove(object);
 			}
 		}

 		if(object.position.x + object.userData.size > skyboxSize/2 || object.position.x - object.userData.size < -(skyboxSize/2) ||
 	   	   object.position.y + object.userData.size > skyboxSize/2 || object.position.y - object.userData.size < -(skyboxSize/2) ||
 	   	   object.position.z + object.userData.size > skyboxSize/2 || object.position.z - object.userData.size < -(skyboxSize/2)) {
 			object.userData.alive = false;
 			scene.remove(object);
 		}
	}

	function displayData() {

		for (var s=0; s<allPlayerShips.length; s++) {
			scene.remove(allPlayerShips[s]);
		}
		for (var j=0; j<allPlayerMissles.length; j++) {
			scene.remove(allPlayerMissles[j]);
		}

		for (var p=0; p<allPlayersData.length; p++) {

			if (allPlayersData[p].playerID != playerID && allPlayersData[p].alive) {

				var shipExists = false;
				var missleExists = false;
				var shipIndex;
				var missleIndex;
				var pos = allPlayersData[p].position;
				var rot = allPlayersData[p].rotation;

				for (var t=0; t<allPlayerShips.length; t++) {
					if (allPlayerShips[t].playerID == allPlayersData[p].playerID) {
						shipExists = true;
						shipIndex = t;
					}
				}

				if (shipExists) {
					allPlayerShips[shipIndex].position.x = pos.x;
					allPlayerShips[shipIndex].position.y = pos.y;
					allPlayerShips[shipIndex].position.z = pos.z;
					allPlayerShips[shipIndex].setRotationFromMatrix(rot);
					scene.add(allPlayerShips[shipIndex]);
				} else {
					var loader = new THREE.OBJLoader(); 
					loader.load('Vaisseau.obj', function(object) {
						newShip = object;
						newShip.position.x = pos.x;
						newShip.position.y = pos.y;///
						newShip.position.z = pos.z;
						newShip.setRotationFromMatrix(rot);

     					scene.add(newShip);
     					allPlayerShips.push(newShip);
 					});
				}

				if (allPlayersData[p].missleFired) {
					for (var t=0; t<allPlayerMissles.length; t++) {
						if (allPlayerMissles[t].playerID == allPlayersData[p].playerID) {
							missleExists = true;
							missleIndex = t;
						}
					}

					if (missleExists) {
						allPlayerMissles[missleIndex].position.x = pos.x;
						allPlayerMissles[missleIndex].position.y = pos.y;
						allPlayerMissles[missleIndex].position.z = pos.z;
						allPlayerMissles[missleIndex].setRotationFromMatrix(rot);
						scene.add(allPlayerMissles[missleIndex]);
					} else {
						var geometry = new THREE.SphereGeometry(1, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
						var material = new THREE.MeshBasicMaterial({color:0xff0000});
						newMissle = new THREE.Mesh(geometry, material);
						newMissle.userData = {alive:true, size:1};
						scene.add(newMissle);

						newMissle.position.x = allPlayersData[p].misslePos.x;
						newMissle.position.y = allPlayersData[p].misslePos.y;
						newMissle.position.z = allPlayersData[p].misslePos.z;

						allPlayerMissles.push(newMissle);
					}
				}
			}
		}
	}

	function update()
	{
		var delta = clock.getDelta();
		var moveDistance = 200*delta;
		var rotateAngle = Math.PI / 2 * delta;

		missle.translateX(30);

		if (keyboard.pressed("W")) {
			spaceship.translateX(moveDistance);
		}
		if (keyboard.pressed("S")) {
			spaceship.translateX(-moveDistance);
		}
		if ( keyboard.pressed("Q") ) {
			spaceship.translateZ( -moveDistance );
		}
		if ( keyboard.pressed("E") ) {
			spaceship.translateZ(  moveDistance );
		}
		
		if (keyboard.pressed("A")) {
			spaceship.rotateOnAxis(new THREE.Vector3(0,1,0), rotateAngle);
		}
		if (keyboard.pressed("D"))
			spaceship.rotateOnAxis(new THREE.Vector3(0,1,0), -rotateAngle);
		if (keyboard.pressed("R"))
			spaceship.rotateOnAxis(new THREE.Vector3(0,0,1), rotateAngle);
		if (keyboard.pressed("F"))
			spaceship.rotateOnAxis(new THREE.Vector3(0,0,1), -rotateAngle);

		if (keyboard.pressed("space")) {
			if (missle.userData.alive != true) {
				missle = new THREE.Object3D();
				var geometry = new THREE.SphereGeometry(1, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
				var material = new THREE.MeshBasicMaterial({color:0xff0000});
				missle = new THREE.Mesh(geometry, material);
				missle.userData = {alive:true, size:1};
				scene.add(missle);

				missle.position.x = spaceship.position.x;
				missle.position.y = spaceship.position.y;
				missle.position.z = spaceship.position.z;
				missle.setRotationFromMatrix(spaceship.matrix);
			}
		}

		if (spaceship.userData.alive == true) {
			scene.remove(missleStatus);
			missleStatus = new THREE.Object3D();
			var geometry = new THREE.SphereGeometry(1, 10, 10, 0, Math.PI * 2, 0, Math.PI * 2);
			var material;

			if (missle.userData.alive == true) {
				material = new THREE.MeshBasicMaterial({color:0xff0000});
			} else {
				material = new THREE.MeshBasicMaterial({color:0x00ff00});
			}

			missleStatus = new THREE.Mesh(geometry, material);
			scene.add(missleStatus);

			missleStatus.position.x = spaceship.position.x;
			missleStatus.position.y = spaceship.position.y;
			missleStatus.position.z = spaceship.position.z;
			missleStatus.setRotationFromMatrix(spaceship.matrix);
		} else {
			scene.remove(missleStatus);
		}

		var relativeCameraOffset = new THREE.Vector3(-50, 10, 0);
    	var cameraOffset= relativeCameraOffset.applyMatrix4(spaceship.matrixWorld);

    	camera.position.x = cameraOffset.x;
    	camera.position.y = cameraOffset.y;
    	camera.position.z = cameraOffset.z;

    	camera.lookAt(spaceship.position);

    	var playerData = {position:spaceship.position, rotation:spaceship.matrix,
    		              misslePos:missle.position, missleFired:missle.userData.alive};
    	socket.emit('locationUpdate', playerData);	

    	if (spaceship.userData.alive == false) {
    		window.location = "/Death.html";
    	}

    	displayData();
	}

	function animate()
	{
		collide(spaceship);
		collide(missle);
    	requestAnimationFrame(animate);
		render();
		update();
	}

	var render = function ()
	{
		renderer.render(scene, camera);
	}

	init();
    animate();
}

function initialize(data) {
	playerID = data;
}

function updatePlayers(data) {
	allPlayersData = data;
}

function death() {
	window.location = "/Death.html";
}