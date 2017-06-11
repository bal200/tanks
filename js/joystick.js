
/**************************************************************************************/
/************************** JOYSTICK CLASS ********************************************/
/**************************************************************************************/
var Joystick = function ( player ) {
    Phaser.Group.call(this, game); /* create a Group, the parent Class */
    this.player = player;
    this.gun = player.gun; /* keep a ref to the gun we're controlling */

    this.long = 170; this.shrt = 40; /* used by the gun barels power slider drawing */
    this.center = {x:10,y:10}; /* the centre here means the segments centre, which is below left of the sprite */

    this.joystickBack = game.add.sprite(0,0, 'joypad');
    this.joystickBack.alpha = 0.4;
    this.joystickBack.anchor.set(0, 1.0);
    this.add( this.joystickBack );

    this.barrel = game.add.group();
    this.barrel.angle = this.gun.angle;
    this.barrel.power = this.gun.power; /* 0-100, controls the barrelBar length */

    this.barrelImg = game.add.sprite(0,0,'barrel');
    this.barrelImg.anchor.set(0.5, 1.0);
    this.barrel.add(this.barrelImg);

    this.barrelBar = game.add.sprite(0,0,'barrelBar');
    this.barrelBar.anchor.set(0.5, 1.0);
    this.barrel.add(this.barrelBar);

    this.add( this.barrel );
    this.updateJoypadBarrel();
    fadeIn(this);
//alert("th.gun.angle; " + th.gun.angle);
};
inheritPrototype(Joystick, Phaser.Group);

/* set the joystick graphic to reflect the current positions */
/* uses as input: this.barrel.angle & this.barrel.power */
Joystick.prototype.updateJoypadBarrel = function() {
    /* Draw the joypads gun-barrel graphic */
    //this.barrel.angle = this.gun.angle;
    var vec = angleToVector( this.barrel.angle );
    this.barrel.x = vec.x * (this.shrt );
    this.barrel.y = vec.y * (this.shrt );
    //this.barrelBar.length = ((this.gun.power-300)/(1200-300) * 130);
    var fullDist = this.long-this.shrt; /* 130 */
    this.barrelBar.length = (this.barrel.power /100) *fullDist;
    this.barrelBar.crop(new Phaser.Rectangle(0,  fullDist-this.barrelBar.length,
                                        15, fullDist ));
//console.log("barelBar.length "+this.barrelBar.length);
};

Joystick.prototype.onPointerDown = function( p ) {
  /* p is pointer position on screen, w is pointer in world coords */
  var s=new Phaser.Point(p.x, p.y);
  var centre=new Phaser.Point(this.center.x, game.height - this.center.y);
  var dist = Math.abs(s.distance(centre));
  var angle = Phaser.Math.radToDeg(Phaser.Math.angleBetweenPoints(centre, s));
  //console.log("angle = "+angle);
  if (dist > this.shrt && dist < this.long && /* is it in the joysticks semi-circle? */
      angle > -90 && angle < 0) {
    /* theyre in our joystick */
    this.pointerId = p.id;
    this.start = s; /* store the starting press position, (in screen coords) */
    this.centre = centre;
    this.last = new Phaser.Point(s.x, s.y); /* the position it was last time */
    this.lastAngle = angle; /* the angle of this press */
    this.lastDist = centre.distance( s ); /* distance from the circles centre */

    myGame.trace.turnTraceOn(); /* show the trace lines now were aiming the gun */
  }
};

Joystick.prototype.onPointerMove = function ( p ) {
  if (p.id == this.pointerId) {
    var s=new Phaser.Point(p.x, p.y);
    var centre=this.centre;

    var angle = Phaser.Math.radToDeg(Phaser.Math.angleBetweenPoints(centre, s));
    var dist = centre.distance( s );

    if (dist > 20)
      this.barrel.angle += (angle - this.lastAngle);
    var fullDist = this.long - this.shrt;
    this.barrel.power += ((dist - this.lastDist) /fullDist *100);

    if (this.barrel.angle>135) this.barrel.angle = 135; if (this.barrel.angle<-135) this.barrel.angle = -135;
    this.barrel.power = Phaser.Math.clamp(this.barrel.power, 0, 100);

    this.gun.angle = this.barrel.angle;
    this.gun.power = this.barrel.power;

    if ( Math.abs(angle - this.lastAngle) > 2)  myGame.learning.trigger( JOYSTICK_MOVE );
    if ( Math.abs(dist - this.lastDist) > 2)  myGame.learning.trigger( JOYSTICK_POWER_CHANGE );

    /* Draw the joypads gun-barrel graphic */
    this.updateJoypadBarrel();
    this.last = s;
    this.lastAngle = angle;
    this.lastDist = dist;
  }
};

/* jiggle the joystick after firing to mimic kick-back */
Joystick.prototype.drift = function () {
  var angDrift = game.rnd.between(-1, +2);
  if (angDrift==+2) angDrift=0;
  this.barrel.angle += angDrift;
  this.barrel.power += game.rnd.between(-1, +1);

  this.gun.angle = this.barrel.angle;
  this.gun.power = this.barrel.power;
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
