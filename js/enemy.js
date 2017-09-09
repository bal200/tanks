

/******* Class for the Array of Enemys ********************/
/***  has Enemy automated random firing and base building functions. startEnemyLogic(),
 ***  which will repeat enemyLogic() every 2 secs.
 ***
 **/
// this.enemy = new Enemy(level.enemy[0].x, level.enemy[0].y, this.bullets, this.land, this.zoomable);

var Enemys = function( data, myGame, group ) {
  this.arr = [];
  for (var n=0; n<data.length; n++) {
    this.arr[n] = new Enemy(data[n], myGame.bullets, myGame.land, /*display group*/group);
    if (data[n].autoBitmap===true) {
      myGame.land.createBitmapForEnemyTank( this.arr[n].tank );
    }
  }
  this.myGame=myGame;
};
Enemys.prototype.startLogic = function() {
  for (var n=0; n<this.arr.length; n++) {
    this.arr[n].startEnemyLogic(); }
};
Enemys.prototype.stopLogic = function() {
  for (var n=0; n<this.arr.length; n++) {
    this.arr[n].stopEnemyLogic(); }
};

/* used by the Learning routine to fire that first shot in training. */
Enemys.prototype.fireShot = function(angle,power) {
  this.arr[0].enemyFire(angle,power);
  myGame.audio.play('explosion2'); /* for the first shot of the game, use a bigger sound */
};
Enemys.prototype.collisionTankToLand = function(land) {
  for (var n=0; n<this.arr.length; n++) {
    collisionTankToLand( this.arr[n].tank, land);
  }
};
/* Check if any Enemy tanks are still alive. returns true if any are still going */
Enemys.prototype.anyAlive = function() {
  for (var n=0; n<this.arr.length; n++) {
    if (this.arr[n].tank.alive) return true;
  }
  return false;
};

/******* Class for an Single Enemy Tank ***************************************/
/***  has automated random firing and base building functions. startEnemyLogic(),
 ***  which will repeat enemyLogic() every 2 secs.
 **/
var Enemy = function( data, bullets, land, group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  this.type = data.type;
  t = this.tank = game.add.sprite(data.x,data.y,'tank_left');
  this.tank.anchor.set(0.5, 0.65);
  this.tank.speed = 200;
  this.tank.enableBody = true;
  this.tank.physicsBodyType = Phaser.Physics.ARCADE;
  game.physics.enable(this.tank, Phaser.Physics.ARCADE);
  this.tank.body.allowGravity = true;
  this.tank.body.drag = {x:300,y:300};
  //this.tank.body.setSize(48,62, 16,5);
  this.tank.onPlatform=false;
  this.tank.health=100;
  this.tank.events.onKilled.add(this.enemyOnKilled , this);

  this.add( this.tank );
  group.add( this );

  this.bullets=bullets;
  this.land=land;
};
inheritPrototype(Enemy, Phaser.Group);

/* onKilled callback */
Enemy.prototype.enemyOnKilled = function(tank) {
  myGame.fire.setFire(/*xy*/ 0,3, /*size*/ 0.85, /*Attach it to:*/ tank);
  myGame.particles.createFlurry(tank.x, tank.y, 10);
  /* TODO: change sprite to charred remains frame */
  /* tank.alive will now be false */
  tank.exists=true; tank.visible=true; /* although its Killed, we need the charred remains to stay */
  myGame.audio.play('explosion3');
  /* check the array of tanks for more alive */
  if (myGame.enemys.anyAlive() === false)
     myGame.finishPlay( WIN );
  this.stopEnemyLogic();
};

Enemy.prototype.enemyFire = function(angle, power) {
    var bullet = this.bullets.getFirstExists(false);
    if (bullet) {
      var vec = new Phaser.Point(0,-1);
      vec = vec.rotate(0,0, angle, true);

      bullet.reset(this.tank.x + (vec.x*50), this.tank.y + (vec.y*50));
      bullet.body.velocity.x = vec.x * power;
      bullet.body.velocity.y = vec.y * power;
      bullet.whos = ENEMY; /* Enemy fired it */
      bullet.type=BAZOOKA; bullet.frame=0;
      //audio1.play('gunshot', 0.6);
      myGame.audio.play('explosion4');
    }
};

Enemy.prototype.enemyLogic = function() {
  var what = game.rnd.between(0, 4);
  switch (what) {
    case 1: /* shoot a front shot*/
      this.enemyFire( game.rnd.between(-40,-60), game.rnd.between(680, 875) );
      break;
    case 2: /* shoot a back shot */
      this.enemyFire( game.rnd.between(-20, -25), game.rnd.between(850, 1100) );
      break;
    case 3: /* shoot a flurry */
      var a=game.rnd.between(-20, -25), b=game.rnd.between(850, 1100);
      this.enemyFire( a, b );
      setTimeout( function(){this.enemyFire(game.rnd.between(a+1, a+1),
                                            game.rnd.between(b-1,b+1));}.bind(this), 150);
      setTimeout( function(){this.enemyFire(game.rnd.between(a+1, a+1),
                                            game.rnd.between(b-1,b+1));}.bind(this), 300);
      break;
    case 4: /* Build defence */
      this.enemyDrawRandomDefence();
      break;
    default:
      break;
  }
  /* call this func again in a random time */
  this.enemyLogicTimeout=setTimeout(this.enemyLogic.bind(this), game.rnd.between(100, 3000));
};

Enemy.prototype.enemyDrawRandomDefence = function() {
  //var x1 = game.rnd.between(1200, 1500);
  //var y1 = game.rnd.between(350, 540);
  var x1 = game.rnd.between(this.tank.x -80, this.tank.x +90);/*200*/
  var y1 = game.rnd.between(this.tank.y -250, this.tank.y-120);
  var x2 = x1 - 200;
  var y2 = y1 + 70;
  this.land.drawDefence(x1,y1, x2,y2, '#827a6a', ENEMY_DRAWING); /* grey */

};

Enemy.prototype.startEnemyLogic = function() {
  this.enemyLogicTimeout=setTimeout(this.enemyLogic.bind(this), 5000);
  /* start off with a few defences */
  //var th=this;
  setTimeout(function(){
    this.enemyDrawRandomDefence(); this.enemyDrawRandomDefence();
    this.enemyDrawRandomDefence(); this.enemyDrawRandomDefence();
  }.bind(this), 2000);
};
Enemy.prototype.stopEnemyLogic = function() {
  if (this.enemyLogicTimeout !== null){
    clearTimeout(this.enemyLogicTimeout);
    this.enemyLogicTimeout=null;
  }
};

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };
}
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}
