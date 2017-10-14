
/************************ PLAYER CLASS ********************************************/
/**************************************************************************************/

var Player = function(x,y, grp) {
    Phaser.Group.call(this, game); /* create a Group, the parent Class */

    this.tank = game.add.sprite(x,y,'tanks');
    this.tank.frame = 0;
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
    this.tank.scale.set(0.79);
    grp.add(this); /* add the tank to the zoomable group */
    this.tank.onPlatform=false; /* used by my land-roving code */
    this.tank.health=100;
    this.tank.events.onKilled.add( this.onKilled ,this);

    /************ Gun *****************/
    this.gun = game.add.sprite(0,0,'turrets');
    this.gun.frame = 0;
    this.gun.anchor.set(0.5, 1.0);/* at the bottom */
    this.tank.addChild(this.gun); /* turret is always relative to the tank */

    /* accessed by the joystick routines */
    this.gun.angle = 76; /* 44 when joystick appears */
    this.gun.power = 45; //685
    this.updateTurret();
};
inheritPrototype(Player, Phaser.Group);

/* callback. burst your tank into flames, and trigger end game */
Player.prototype.onKilled = function(tank){
  myGame.fire.setFire(0,10, 0.80, tank);
  myGame.particles.createFlurry(tank.x, tank.y, 10);
  tank.frame = 1; /* burnt out */

  tank.exists=true; tank.visible=true; /* although its Killed, we need the charred remains to stay */
  myGame.audio.play('explosion3');
  myGame.finishPlay( LOOSE );
};

Player.prototype.updateTurret = function() {
  var vec = new Phaser.Point(0,-1);
  vec = vec.rotate(0,0, this.gun.angle, true);
  this.gun.x = (vec.x*15) - 5;
  this.gun.y = (vec.y*15) - 10;
};

Player.prototype.updatePlayer = function() {
  /* nothing needed here yet */
  this.updateTurret();
};

/* handle my land roving algorithm.  tank can be the player, or an enemy tank */
function collisionTankToLand( tank, land ) {
  var x=Math.floor(tank.x), y=Math.floor(tank.y);
  if ( land.getPixel( x, y+24 )==1 ) {
    if ( land.getPixel( x, y+23 )==1 ) tank.body.y--;
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
