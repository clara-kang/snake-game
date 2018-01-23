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
    this.preSpeedX = this.speed;
    this.preSpeedY = 0;
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
