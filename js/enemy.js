

/******* Class for the Array of Enemys ********************/
/***  has Enemy automated random firing and base building functions. startEnemyLogic(),
 ***  which will repeat enemyLogic() every 2 secs.
 ***
 **/
// this.enemy = new Enemy(level.enemy[0].x, level.enemy[0].y, this.bullets, this.land, this.zoomable);

/* Enemy types */
var TANK1 = 1;
var SLIDING_DOOR = 2;

var Enemys = function( data, myGame, group ) {
  this.arr = [];
  for (var n=0; n<data.length; n++) {
    if (data[n].type==TANK1) {
      this.arr[n] = new Enemy(data[n], myGame.bullets, myGame.land, /*display group*/group);
    }else if (data[n].type==SLIDING_DOOR) {
      this.arr[n] = new SlidingDoor(data[n], /*display group*/group);
      this.arr[n].startLogic();
    }
    if (data[n].autoBitmap===true) {
      myGame.land.createBitmapForEnemyTank( this.arr[n] );
    }
  }
  this.myGame=myGame;
};
Enemys.prototype.debug = function() {
  for (var n=0; n<this.arr.length; n++) {
    game.debug.body(this.arr[n]); }
};
Enemys.prototype.startLogic = function() {
  for (var n=0; n<this.arr.length; n++) {
    this.arr[n].startLogic(); }
};
Enemys.prototype.stopLogic = function() {
  for (var n=0; n<this.arr.length; n++) {
    this.arr[n].stopLogic(); }
};

/* used by the Learning routine to fire that first shot in training. */
Enemys.prototype.fireShot = function(angle,power) {
  this.arr[0].enemyFire(angle,power);
  myGame.audio.play('explosion2'); /* for the first shot of the game, use a bigger sound */
};
Enemys.prototype.collisionTankToLand = function(land) {
  for (var n=0; n<this.arr.length; n++) {
    if (this.arr[n].type==TANK1) collisionTankToLand( this.arr[n], land);
  }
};
/* Check if any Enemy tanks are still alive. returns true if any are still going */
Enemys.prototype.anyAlive = function() {
  for (var n=0; n<this.arr.length; n++) {
    if (this.arr[n].type==TANK1 && this.arr[n].alive) return true;
  }
  return false;
};

/******* Class for an Single Enemy Tank ***************************************/
/***  has automated random firing and base building functions. startLogic(),
 ***  which will repeat enemyLogic() every 2 secs.
 **/
var Enemy = function( data, bullets, land, group ) {
  /* create a Group, the parent Class */
  Phaser.Sprite.call(this, game, data.x, data.y, 'tank_left');
  this.type = data.type;
  this.anchor.set(0.5, 0.65);
  this.speed = 200;
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.allowGravity = true;
  this.body.drag = {x:300,y:300};
  //this.body.setSize(48,62, 16,5);
  this.onPlatform=false;
  this.health=100;
  this.events.onKilled.add(this.enemyOnKilled , this);

  group.add( this );
  this.bullets=bullets;
  this.land=land;
};
inheritPrototype(Enemy, Phaser.Sprite);

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
  this.stopLogic();
};

Enemy.prototype.enemyFire = function(angle, power) {
    var bullet = this.bullets.getFirstExists(false);
    if (bullet) {
      var vec = new Phaser.Point(0,-1);
      vec = vec.rotate(0,0, angle, true);

      bullet.reset(this.x + (vec.x*50), this.y + (vec.y*50));
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
  var x1 = game.rnd.between(this.x -80, this.x +90);/*200*/
  var y1 = game.rnd.between(this.y -250, this.y-120);
  var x2 = x1 - 200;
  var y2 = y1 + 70;
  this.land.drawDefence(x1,y1, x2,y2, '#827a6a', ENEMY_DRAWING); /* grey */

};

Enemy.prototype.startLogic = function() {
  if (!this.logicTimeout) {
      this.logicTimeout=game.time.events.add(5000, this.enemyLogic.bind(this), this);
    /* start off with a few defences */
    setTimeout(function(){
      this.enemyDrawRandomDefence(); this.enemyDrawRandomDefence();
      this.enemyDrawRandomDefence(); this.enemyDrawRandomDefence();
    }.bind(this), 2000);
  }
};
Enemy.prototype.stopLogic = function() {
  if (this.logicTimeout) {
    game.time.events.remove(this.logicTimeout);
    this.logicTimeout=null;
  }
};

/*************************************************************************************/
SlidingDoor = function(data, group) {
  Phaser.Sprite.call(this, game, data.x, data.y, 'sliding_door');
  
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable=true;
  this.body.allowGravity = false;
  this.frame = 1;
  this.angle = data.angle;
  this.anchor.set(0.5, 0);
  this.health = 10000;
  this.origHeight = data.length;
  this.spriteHeight = this.height;

  /* we'll use sprite Cropping to open and close the door */
  this.myCropRect = new Phaser.Rectangle(0,this.spriteHeight-this.origHeight, 
                               this.width,this.origHeight);
  this.crop(this.myCropRect);
  group.add(this);
//  this.flange1=game.add.sprite(data.x, data.y, 'bullets'); this.flange1.anchor.set(0.5,0);
//  this.flange1.frame=2; group.add(this.flange1);
//  this.flange2=game.add.sprite(data.x, data.y+data.length, 'bullets'); this.flange2.anchor.set(0.5,1);
//  this.flange2.frame=2; group.add(this.flange2);

  myGame.updateSignal.add(this.update, this); /* we need to update the crop each update, so subscribe */
};
inheritPrototype(SlidingDoor, Phaser.Sprite);

SlidingDoor.prototype.close = function() {
  game.add.tween(this.myCropRect).to({y: this.spriteHeight - this.origHeight,
                                      height: this.origHeight},
    /*duration*/500, Phaser.Easing.Quintic.InOut, /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
  
}
SlidingDoor.prototype.open = function() {
  game.add.tween(this.myCropRect).to({y: this.spriteHeight,
                                      height: 0},
    /*duration*/500, Phaser.Easing.Quintic.InOut, /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);

}
/* our callback for the update signal */
SlidingDoor.prototype.update = function() {
  this.updateCrop();
  /* @TODO: change body after crop */
  //this.body.setSize(48,62, 16,5);
} 

SlidingDoor.prototype.startLogic = function() {
  if (!this.logicTimeout) {
    this.logicTimeout=game.time.events.add(2000, this.enemyLogic.bind(this), this);
  }
};
SlidingDoor.prototype.enemyLogic = function() {
  if (this.height==0) this.close(); else this.open();
  this.logicTimeout=game.time.events.add(2000, this.enemyLogic.bind(this), this);  
}

SlidingDoor.prototype.stopLogic = function() {
  if (this.logicTimeout){
    game.time.events.remove(this.logicTimeout);
    this.logicTimeout=null;
  }
}


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
