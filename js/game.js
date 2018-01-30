var fieldSize = 2.5;
var numGrid = 10;
var playerRadius = 0.05;
var radiusOverSpeed = 2; // how much to advance in each time slot in terms of radius
var eggRadius = 0.05;
var eggX, eggY;
var newEgg = true;
var tailEggs = [];
var halfGrid = fieldSize / numGrid / 2;
var eggSpace = 3 // the space between eggs in terms of radius
var scene = new THREE.Scene();
var inGame = false;
var neverStarted = true;
var frozen = false;

container = document.getElementById('game');
var camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
camera.position.z = 1.8;
camera.position.y = -1.5;
camera.position.x = 1;
camera.rotateZ(Math.PI * 1 / 8);
camera.rotateX(Math.PI * 1 / 6);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(container.offsetWidth, container.offsetHeight);
container = document.getElementById('game');
container.appendChild(renderer.domElement);

// update window size on resize
window.addEventListener("resize", function() {
  var width = document.getElementById('game').offsetWidth;
  var height = document.getElementById('game').offsetHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

class Player {
  constructor(radius) {
    this.radius = radius;
    // this.x = - fieldSize / radiusOverSpeed + halfGrid;
    // this.y = - fieldSize / radiusOverSpeed + halfGrid;
    this.x = 0;
    this.y = 0;
    this.speed = this.radius / 2
    this.speedX = this.speed;
    this.speedY = 0;
  }

  checkBoundary(pos) {
    if (pos + this.radius > fieldSize / 2 || pos -  this.radius< - fieldSize / 2) {
      return false;
    }
    return true;
  }

  updatePosition() {
    var nextX = this.x + this.speedX;
    var nextY = this.y + this.speedY;

    if (this.checkBoundary(nextX)) {
      this.x += this.speedX;
    } else {
      return false;
    }
    if (this.checkBoundary(nextY)) {
      this.y += this.speedY;
    } else {
      return false;
    }
    return true;
  }

}

var player = new Player(playerRadius);

// the plane geometry
var geometry = new THREE.PlaneGeometry(fieldSize, fieldSize);

// plane texture
// grassTexture = new THREE.TextureLoader().load("img/grass.jpg");
var material = new THREE.MeshLambertMaterial({
  color: 0xf1e7de,
  // map: grassTexture,
  side: THREE.FrontSide
});
var plane = new THREE.Mesh(geometry, material);
scene.add(plane);

//White directional light at half intensity shining from the top.
var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(0, -1, 2);
directionalLight.target = plane;
scene.add(directionalLight);
//ambientLight
var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
scene.add(ambientLight);

// sphere geometry for player
var playerGeometry = new THREE.SphereGeometry(playerRadius, 6, 6);
//var eggTexture = new THREE.TextureLoader().load("img/egg-texture.jpg");
var material = new THREE.MeshLambertMaterial({
  // map: eggTexture,
  color: 0xefa93a,
  side: THREE.FrontSide
});
var playerSphere = new THREE.Mesh(playerGeometry, material);
playerSphere.position.set(player.x, player.y, 0);
scene.add(playerSphere);

// sphere for new egg
var eggSphere = new THREE.Mesh(new THREE.SphereGeometry(eggRadius, 6, 6),
  new THREE.MeshLambertMaterial({
    // map: eggTexture,
    color: 0x5fd0d4,
    side: THREE.FrontSide
  }));
scene.add(eggSphere);

function onKeydown(event) {
  if (event.key != undefined) {
    if (inGame) {
      switch (event.keyCode) {
        case 40: //arrow down
        case 83: //s
          if (player.speedY === 0) {
            player.speedY = -player.speed;
            player.speedX = 0;
          }
          break;
        case 87: //w
        case 38: //arrow up
          if (player.speedY == 0) {
            player.speedY = player.speed;
            player.speedX = 0;
          }
          break;
        case 65: //a
        case 37: //arrow left
          if (player.speedX == 0) {
            player.speedX = -player.speed;
            player.speedY = 0;
          }
          break;
        case 68: //d
        case 39: //arrow right
          if (player.speedX == 0) {
            player.speedX = player.speed;
            player.speedY = 0;
          }
          break;
      }
    } else if (event.keyCode == 32){
      inGame = true;
      if (neverStarted) {
        neverStarted = false;
        document.getElementById('info').innerHTML = "";
        animate();
      } else {
        reset();
      }
    }
    event.preventDefault();
  }
}

window.addEventListener("keydown", onKeydown);


// generate next egg position randomly
function randGen(min, max) {
  var randNum = Math.floor((Math.random() * (max - min)) + min);
  if (randNum < 0) {
    randNum += 0.5;
  } else {
    randNum -= 0.5;
  }
  return randNum;
}

// player hits new egg
function eggCollision() {
  if (Math.abs(player.x - eggX) < halfGrid && Math.abs(player.y - eggY) < halfGrid) {
    return true;
  }
  return false;
}

function appendTail() {
  var tailEggX = 0;
  var tailEggY = 0;
  var previousSpeedX = 0;
  var previousSpeedY = 0;
  var x, y;
  if (tailEggs.length == 0) {
    previousSpeedX = player.speedX;
    previousSpeedY = player.speedY;
    x = player.x;
    y = player.y;
  } else {
    previousSpeedX = tailEggs[tailEggs.length - 1].speed.x;
    previousSpeedY = tailEggs[tailEggs.length - 1].speed.y;
    x = tailEggs[tailEggs.length - 1].obj.position.x;
    y = tailEggs[tailEggs.length - 1].obj.position.y;
  }
  // use the speed of the egg/player in front to determine where to place the egg
  if (previousSpeedX > 0) {
    tailEggX = x - playerRadius * eggSpace;
    tailEggY = y;
  } else if (previousSpeedX < 0) {
    tailEggX = x + playerRadius * eggSpace;
    tailEggY = y;
  } else if (previousSpeedY > 0) {
    tailEggY = y - playerRadius * eggSpace;
    tailEggX = x;
  } else if (previousSpeedY < 0) {
    tailEggY = y + playerRadius * eggSpace;
    tailEggX = x;
  }
  var eggSphere = new THREE.Mesh(new THREE.SphereGeometry(eggRadius, 6, 6),
    new THREE.MeshLambertMaterial({
      // map: eggTexture,
      color: 0x5fd0d4,
      side: THREE.FrontSide
    }));
  eggSphere.position.set(tailEggX, tailEggY, 0);
  // add to scene
  scene.add(eggSphere);
  var path = []; // the array of future locations of this egg
  var finalPosX, finalPosY; // the last location in the path
  var speedX, speedY; // the speed of this egg
  if (tailEggs.length == 0) {
    finalPosX = player.x;
    finalPosY = player.y;
    speedX = player.speedX;
    speedY = player.speedY;
  } else {
    var preEgg = tailEggs[tailEggs.length - 1];
    finalPosX = preEgg.obj.position.x;
    finalPosY = preEgg.obj.position.y;
    speedX = preEgg.speed.x;
    speedY = preEgg.speed.y;
  }
  // construct the array of locations that the egg must follow
  for (i = 1; i < eggSpace * radiusOverSpeed; i++) {
    path.push(new THREE.Vector3(tailEggX + speedX * i, tailEggY + speedY * i, 0));
  }
  // the next egg or the player is the end of the path
  path.push(new THREE.Vector3(finalPosX, finalPosY, 0));
  // push the egg, its path, its speed to the array of eggs
  tailEggs.push({
    path: path, // the future locations of this egg
    obj: eggSphere, // the mesh
    speed: new THREE.Vector3(speedX, // the speed of this egg, used to place next egg
      speedY, 0)
  });
}

// update tail eggs' positions using their next location in path
function updateTailEggs() {
  // do no
  if (frozen) {
    return;
  }
  if (tailEggs.length > 0) {
    var nextX, nextY;
    for (i = 0; i < tailEggs.length; i++) {
      if (i == 0) {
        nextX = player.x;
        nextY = player.y;
      } else {
        nextX = tailEggs[i - 1].obj.position.x;
        nextY = tailEggs[i - 1].obj.position.y;
      }
      var nextPos = tailEggs[i].path.shift();
      tailEggs[i].speed.x = nextPos.x - tailEggs[i].obj.position.x;
      tailEggs[i].speed.y = nextPos.y - tailEggs[i].obj.position.y;
      // add a new location to the tail, which is the current position of the next egg/player
      tailEggs[i].obj.position.set(nextPos.x, nextPos.y, nextPos.z);
      tailEggs[i].path.push(new THREE.Vector3(nextX, nextY, 0));

    }
  }
}

// collide with the tail of eggs
function collideWithPath(x, y) {
  var threshold = 0.0001;
  // check if collide with the path of any egg
  for (i = 1; i < tailEggs.length - 1; i++) {
    if ((Math.abs(x - tailEggs[i].obj.position.x) < threshold &&
        (y - tailEggs[i].obj.position.y) * ((y - tailEggs[i + 1].obj.position.y)) < 0) ||
      (Math.abs(y - tailEggs[i].obj.position.y) < threshold &&
        (x - tailEggs[i].obj.position.x) * ((x - tailEggs[i + 1].obj.position.x)) < 0)) {
      return true;
    }
  }
  // check if directly collide with current location of any egg
  for (i = 1; i < tailEggs.length; i++) {
    if (Math.abs(x - tailEggs[i].obj.position.x) < threshold &&
      Math.abs(y - tailEggs[i].obj.position.y) < threshold) {
      return true;
    }
  }
  return false;
}

// after game over, stop moving the eggs and player
function freeze() {
  frozen = true;
  player.speedX = 0;
  player.speedY = 0;
}

var fps = 40;

function animate() {
  var timeout = setTimeout(function() {
    if (eggCollision()) {
      newEgg = true;
      appendTail();
    }
    if (newEgg) {
      do {
        eggX = (randGen(-numGrid / 2, numGrid / 2)) * fieldSize / numGrid;
        eggY = (randGen(-numGrid / 2, numGrid / 2)) * fieldSize / numGrid;
      } while (collideWithPath(eggX, eggY));
      eggSphere.position.set(eggX, eggY, 0);
      newEgg = false;
    }
    if (collideWithPath(player.x, player.y)) {
      //exit game
      inGame = false;
      document.getElementById('info').innerHTML = "Game over, press space to restart";
      freeze();
    }
    if (!player.updatePosition()) {
      //exit game
      inGame = false;
      document.getElementById('info').innerHTML = "Game over, press space to restart";
      freeze();
    }
    updateTailEggs();
    playerSphere.position.set(player.x, player.y, 0);
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }, 1000 / fps);
}

// dispose meshes in tailEggs, reset player position and speed
function reset() {
  frozen = false;
  document.getElementById('info').innerHTML = "";
  player.x = 0;
  player.y = 0;
  player.speedX = player.speed;
  player.speedY = 0;
  var newEgg = true;
  for (egg of tailEggs) {
    scene.remove(egg.obj);
    egg.obj.geometry.dispose();
    egg.objmyMesh = undefined;
  }
  tailEggs.splice(0, tailEggs.length);
}
