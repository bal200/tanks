//var cursors;    /* keyboard inputs */
var firebutton; /* space bar */


/************************ PLAYER CLASS ********************************************/
/**************************************************************************************/

var Player = function(x,y, grp) {
    Phaser.Group.call(this, game); /* create a Group, the parent Class */

    this.tank = game.add.sprite(x,y,'tank2_right');
    this.tank.anchor.set(0.5, 0.5);
    this.tank.speed = 200;
    this.add( this.tank );

    this.tank.enableBody = true;
    this.tank.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.allowGravity = true;
    this.tank.body.drag = {x:300,y:300};
    //this.tank.body.bounce.setTo(0.5, 0.5);
    this.tank.body.mass=20;
    //this.tank.body.setSize(54,40, 10,5);
    this.tank.scale.set(0.5);

    grp.add(this); /* add the tank to the zoomable group */
    this.tank.onPlatform=false; /* used by my land-roving code */
    this.tank.health=100;

    /************ Gun *****************/
    this.gun = {
      angle : 44,
    //  angleVelocity:0,
      power : 685
    //  powerVelocity:0
    };

};
inheritPrototype(Player, Phaser.Group);

Player.prototype.updatePlayer = function( land ) {



};

function collisionTankToLand( tank, land ) {
  var x=Math.floor(tank.x), y=Math.floor(tank.y);
  if ( land.getPixel( x, y+22 )==1 ) {
    if ( land.getPixel( x, y+21 )==1 ) tank.body.y--;
    if (tank.body.velocity.y > 0)
      tank.body.velocity.y = 0;
    tank.body.allowGravity = false;
    tank.body.drag.x = 3000; /* friction against the ground */
    tank.onPlatform=true;
  }else {
    tank.body.allowGravity = true;
    tank.body.drag.x = 300;
    tank.onPlatform=false;
  }
}

/******* Enemy Tank ********************/
var Enemy = function( bullets, land, group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  t = this.tank = game.add.sprite(1400,607,'tank_left');
  this.tank.anchor.set(0.5, 0.5);
  this.tank.speed = 200;
  this.tank.enableBody = true;
  this.tank.physicsBodyType = Phaser.Physics.ARCADE;
  game.physics.enable(this.tank, Phaser.Physics.ARCADE);
  this.tank.body.allowGravity = true;
  this.tank.body.drag = {x:300,y:300};
  //this.tank.body.setSize(48,62, 16,5);
  this.tank.onPlatform=false;
  this.tank.health=100;
  this.add( this.tank );
  group.add( this );

  this.bullets=bullets;
  this.land=land;
};
inheritPrototype(Enemy, Phaser.Group);

Enemy.prototype.enemyFire = function(angle, power) {
    var bullet = this.bullets.getFirstExists(false);
    if (bullet) {
      var vec = new Phaser.Point(0,-1);
      vec = vec.rotate(0,0, angle, true);

      bullet.reset(this.tank.x + (vec.x*50), this.tank.y + (vec.y*50));
      bullet.body.velocity.x = vec.x * power;
      bullet.body.velocity.y = vec.y * power;
      bullet.whos = ENEMY; /* Enemy fired it */
      audio1.play('gunshot', 0.6);
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
  var x1 = game.rnd.between(1200, 1500);
  var y1 = game.rnd.between(350, 540);
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
        function F() {
        }
        F.prototype = o;
        return new F();
    };
}
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}
