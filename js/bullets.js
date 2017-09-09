/****** Bullets and Trace markers Classes ************/

/**** The "Bullet" class controls a Group of bullets that are any of the in game weapoens.
 **** Their characteristics are controlled by setting their "Type"
 ****/

var BAZOOKA=1, GRENADE=2;
var Bullets = function ( land, group, myCam ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */

  this.enableBody = true;
  this.physicsBodyType = Phaser.Physics.ARCADE;
  group.add( this );

  this.bulletTime=0;
  this.land = land;
  this.myCam = myCam;
  this.z = 40;
  for (var i = 0; i < 50; i++)
  {
      var b = this.create(0, 0, 'bullets');
      //b.body.drag = {x:70.5, y:70.5};
      b.exists = false;  b.visible = false;
      b.checkWorldBounds = true;
      b.anchor.set(0.5, 0.5);
      b.lastX=0; b.lastY=0;
      b.whos=0; /* 1=Players, 2=Enemies */
      b.type=BAZOOKA; /* bullet or grenade */
      b.frame=1;
      b.events.onOutOfBounds.add(function(bullet) {
        bullet.kill();
      } /*, th*/ );
  }

  /******* Small Explosions group ********/
  this.explosions = game.add.group();
  this.explosions.z = 45;
  this.explosions.createMultiple(10, 'boom');
  group.add( this.explosions );
  this.explosions.forEach(function(exp) {
    exp.anchor.set(0.5, 0.5);
    exp.animations.add('boom');
  });

};
inheritPrototype(Bullets, Phaser.Group);


Bullets.prototype.updateBullets = function(myCam) {
  //var player = th.player;

  /********** Bullets ***************************************/
  /* check if any of the bullets have hit the destructable landscape */
  this.checkBulletsToLand(myCam);
  /* set the bullets angles to their direction of travel */
  this.forEachExists(function(bullet) {
    if (bullet.type==BAZOOKA)
      bullet.angle = Phaser.Math.radToDeg(
                   Phaser.Math.angleBetween(0,0, bullet.body.deltaX(), bullet.body.deltaY()));
  }, this);

};

function playerFireBazooka() { myGame.bullets.playerFire( BAZOOKA ); }
function playerFireGrenade() { myGame.bullets.playerFire( GRENADE ); }

/*  Player Shoots off a new bullet */
Bullets.prototype.playerFire = function( type ) {
  var player = myGame.player;
  var gun = player.gun;  /* just to shorten some variable names */
  if (type==undefined) type=BAZOOKA;
  drawOff(); /* turn off drawing mode now were shootin' */
  if (myGame.joystick && myGame.joystick.pointerId==null)  myGame.trace.turnTraceOff(); /* get rid of the trace lines now too */
  var bullet = this.getFirstExists(false);
  if (bullet) {
    var vec = angleToVector( gun.angle );
    bullet.reset(player.tank.x + (vec.x*50), player.tank.y + (vec.y*50));
    var power = (gun.power *9) +300; /* gun.power is 0-100 */
    bullet.body.velocity.x = vec.x * power;
    bullet.body.velocity.y = vec.y * power;
    bullet.whos = PLAYER;/* the player fired it */
    bullet.type = type;
    bullet.frame = type-1;
    //audio1.play('gunshot'); /* gunshot noise */
    myGame.audio.play('explosion5');
    //bulletTime = game.time.now + 200;
    if (myGame.joystick) {
      myGame.joystick.drift();
      myGame.joystick.updateJoypadBarrel();
    }
  }
  myGame.learning.trigger( FIRE_BUTTON_PRESS );
}

/* check through the group of bullets to see if any have hit our foreground land,
 *  using the bitmap getPixel command to look for solid ground */
Bullets.prototype.checkBulletsToLand = function (myCam) {
  var over=0;
  var land = this.land;
  this.forEachExists(function(bullet) {
    var x = Math.floor(bullet.x);
    var y = Math.floor(bullet.y);
    /* screen zoom out trigger */
    if (bullet.whos==1) {
      var o=myCam.checkBulletForCameraMove(x,y);
      if (o>over) over=o; /* find the furthest bullets x coord */
    }
    if (land.checkBitmapForHit(x,y, bullet.whos) > 0) { /* HIT */
      var bitmap=land.getPixelWhichBitmap(x,y);
      var p=this.correctHitPosition(bullet, land, /*crater depth*/0);
      var pRaised=this.correctHitPosition(bullet, land, /*crater depth*/2);
      bullet.x=p.x; bullet.y=p.y; /* raise it up above the ground a bit */

      if (bullet.type==BAZOOKA) { /* bullet, so blow up */
        this.explodeBulletLand(bullet, land, pRaised, bitmap);

      }else if (bullet.type==GRENADE) { /* bouncing grenade */
        var surfaceNormal = land.getSurfaceNormal(p.x,p.y);
        var bulletAngle = vectorToAngle( bullet.body.deltaX(), bullet.body.deltaY() );
        //console.log("bullet angle "+bulletAngle );
        //console.log("surfaceNormal "+surfaceNormal );
        var bounce = bounceAngle( bulletAngle, surfaceNormal );
        //console.log("newAngle "+bounce);
        var pow = (new Phaser.Point(0,0)).distance(bullet.body.velocity);
        pow *= 0.60; /* Bouncyness: .95=rubber ball, .5-.10=wet fish */
        //console.log("pow "+pow);
        if (pow < 40)  this.explodeBulletLand(bullet, land, pRaised, bitmap);
        bullet.body.reset(pRaised.x,pRaised.y);
        bullet.body.velocity = newVector(pow, /*angle*/bounce);
        //console.log("new velocity: "+bullet.body.velocity.x +","+ bullet.body.velocity.y)
      }
    }
    bullet.lastX = x;
    bullet.lastY = y;
  }, this);
  /* If bullets are far over the page, we may need to zoom out a bit to see all action */
  myCam.changeScaleMode(over);
};

/* Execute the list of things that happen when a bullet hits land or defences */
Bullets.prototype.explodeBulletLand = function(bullet, land, p, bitmap) {
  this.explode(bullet); /* small explosion graphic */
  /* Erase a Circle in the land to make a crater */
  land.drawCrater(p.x, p.y, 16, /*exclude*/LAND);
  /* let the sparks fly! */
  if (bitmap.type == LAND) {
    myGame.particles.createFlurry (p.x, p.y, 1, bullet.body/*used for direction angle*/);
  }else{ /*Defences*/
    myGame.particles.createFlurry (p.x, p.y, 4, bullet.body/*used for direction angle*/);
  }
  game.camera.shake(0.0010, 100); /* shake the screen a bit! */
};

/** The bullets can go too deep when the colision is detected.  This can make uneven holes.
 ** correctHitPosition() will pull the bullets x,y back to the lands surface, so the explosion
 ** circle is correct.
 **/
Bullets.prototype.correctHitPosition = function(bullet, land, depth) {
  /* get the direction angle the bullet is going in */
  var vec=new Phaser.Point(bullet.body.deltaX(), bullet.body.deltaY());
  vec.normalize();
  vec.rotate(0,0, 180,true); /* then point it backwards */
  /* step backwards from the collision detected point, until you hit air */
  var p = new Phaser.Point(bullet.x, bullet.y);
  do{
    p.x += vec.x;  p.y += vec.y;
  }while( land.checkBitmapForHit(Math.floor(p.x), Math.floor(p.y), bullet.whos) > 0 );
  /* move back a few more pixels to lessen the crater depth */
  for (n=0; n<depth; n++) { p.x += vec.x;  p.y += vec.y; }
  return p;
};

/* handles a bullet exploding, create its explosion graphic, and sound effect */
Bullets.prototype.explode = function ( bullet) {
  if (exp=this.explosions.getFirstExists(false)) {
    exp.reset(Math.floor(bullet.x), Math.floor(bullet.y));
    exp.play('boom', /*framerate*/30, /*loop*/false, /*killoncomplete*/true);
    //audio1.play('boom'); /* boom noise */
    myGame.audio.play('explosion1');
  }
  bullet.kill();
};

function tankToBulletsHandler(tank, bullet) {
  /* Weve hit a tank ! */
  //if (tank.alive) {
    tank.damage(40);
    game.camera.shake(0.0020, 250); /* shake the screen a bit! */
  //}
  this.bullets.explode(bullet);
}



/*********************** Trace Lines ******************************************/
/******************************************************************************/
var Trace = function( group ) {
  /****** Trace Lines ****************/
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  this.z = 48;
  group.add( this );
  for ( i = 0; i < 70; i++)
  {
      var t = this.create(0, 0, 'bullets');
      t.frame = 2; /* trace image */
      t.exists = false;  t.visible = false;
      t.anchor.set(0.5, 0.5);
  }
  this.traceOn=false;
};
inheritPrototype(Trace, Phaser.Group);

Trace.prototype.updateTrace = function(player, land) {
  var gun = player.gun;  /* just to shorten some variable names */

  if ( this.traceOn) {
    /* this will animate the trace line, by slightly moving the start point every second */
    var startNudge = 4+ ((new Date()).getSeconds() % 2) * 15;

          var vec = new Phaser.Point(0,-1);
          vec = vec.rotate(0,0, gun.angle, true);

                              /* end of gun barrel */
    var p = new Phaser.Point(player.tank.x +(vec.x*50), player.tank.y +(vec.y*50));
    var last = new Phaser.Point(p.x, p.y);
    var power = (gun.power *9) +300;
    var deltaX = (vec.x * power) / 100;
    var deltaY = (vec.y * power) / 100;
    var collision=false;
    var changeWorldScale=1;
    this.forEach(function(t) { t.kill(); });
    /* Lets redraw all the trace marks in place */
    do {
      deltaY += (game.physics.arcade.gravity.y / 100)/100;
      p.x += deltaX;
      p.y += deltaY;
    }while(Math.abs(last.distance(p)) < startNudge);
    for (n=0; n<70; n++) { /* go through each of the trace dots */
      var t = this.next(); /* t is our next trace dot sprite */
      if (collision){
        //t.exists=false; t.visible=false; /* we're finished, but we still must erase all the remaining dots */
      }else{
        t.reset(p.x, p.y); /* place the next dot on the line */
        //t.bringToTop();
        //t.angle = vectorToAngle(deltaX, deltaY);
        t.angle=Phaser.Math.radToDeg(  Phaser.Math.angleBetween(0,0, deltaX, deltaY) );
        last.x=p.x; last.y=p.y;
        do{ /* an inner loop, to slowly step along the line until we advance 20 pixels, ready for next dot */
          deltaY += (game.physics.arcade.gravity.y / 100)/100;
          p.x += deltaX;
          p.y += deltaY;
          /* Check for land collision */
          if (land.checkBitmapForHit(Math.floor(p.x), Math.floor(p.y), 1))
              collision=true;
          if ((p.x > level.x2) || (p.x < level.x) || (p.y > level.y2) || (p.y < level.y))
              collision=true;
        }while(Math.abs(last.distance(p)) < 30);
      }
    }
    /* jump to different zoom points, depending on where the trace marks are pointing */
    var new_scale=myGame.myCam.checkBulletForCameraMove(p.x,p.y);
    //var newScale=1;
    //if (p.x > 800) newScale=2;
    //if (p.x > 1600 && p.y<970) newScale=3;
    myGame.myCam.changeScaleMode(new_scale);
  }
};


Trace.prototype.turnTraceOn = function() {
  this.traceOn=true;
};
Trace.prototype.turnTraceOff = function() {
  if (this.traceOn==false) return;
  this.forEach(function(t) { t.kill(); });
  this.traceOn=false;
};

function newVector( power, angle ){
  var vec = new Phaser.Point(0,-1 * power);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
/* bounce an angle off a surface like a rubber ball would */
function bounceAngle ( angle, surfaceNormal ) {
  angle += 180; if (angle>360) angle-=360; /* rotate it first */
  var bounce = surfaceNormal + (surfaceNormal - angle);
  if (bounce>=360) bounce-=360;
  if (bounce<0) bounce += 360;
  return bounce;
}
/* convert an angle (degrees) into a vector.  Assumes 0 degrees is pointing up */
function angleToVector( angle ) {
  var vec = new Phaser.Point(0,-1);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
/* convert a Vector to an Angle (degrees). the vector doesnt have to be normalised */
function vectorToAngle( x,y ) {
  ang = (Phaser.Math.radToDeg(
            Phaser.Math.angleBetween(0,0, x,y /*vec.x, vec.y*/) )) + 90;
  if (ang<0) ang+=360;
  return ang;
}
