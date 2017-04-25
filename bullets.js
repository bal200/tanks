
/****** Bullets and Trace markers ************/

/***** Bullets **********/

var Bullets = function ( land ) {
//function createBullets(th) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  //bullets = game.add.group();

  this.enableBody = true;
  this.physicsBodyType = Phaser.Physics.ARCADE;

  this.bulletTime=0;
//var bullets;
//var trace;
//var explosions;
  this.land = land;

  for (var i = 0; i < 40; i++)
  {
      var b = this.create(0, 0, 'bullet');
      b.name = 'bullet' + i;
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.anchor.set(0.5, 0.5);
      b.lastX=0; b.lastY=0;
      b.whos=0; /* 1=Players, 2=Enemies */
      b.events.onOutOfBounds.add(function(bullet) {
        bullet.kill();
      } /*, th*/ );
  }


  /******* Explosions group ********/
  this.explosions = game.add.group();
  this.explosions.createMultiple(10, 'boom');
  this.explosions.forEach(function(exp) {
    exp.anchor.x = 0.5; exp.anchor.y = 0.5;
    exp.animations.add('boom');
  });


};
inheritPrototype(Bullets, Phaser.Group);


Bullets.prototype.updateBullets = function() {
  //var player = th.player;

  /********** Bullets ***************************************/
  /* check if any of the bullets have hit the destructable landscape */
  this.checkBulletsToLand();
  /* set the bullets angles to their direction of travel */
  this.forEachExists(function(bullet) {
    bullet.angle = Phaser.Math.radToDeg(
                   Phaser.Math.angleBetween(0,0, bullet.body.deltaX(), bullet.body.deltaY()));
  }, this);


};

function fire() {
  var player = this.player;
  var gun = this.player.gun;  /* just to shorten some variable names */

  drawOff(); /* turn off drawing mode now were shootin' */
  if (this.joystick.pointerId==null)  this.trace.turnTraceOff(); /* get rid of the trace lines now too */
  var bullet = this.bullets.getFirstExists(false);
  if (bullet) {
    var vec = angleToVector( gun.angle );

    bullet.reset(player.tank.x + (vec.x*50), player.tank.y + (vec.y*50));
    bullet.body.velocity.x = vec.x * gun.power;
    bullet.body.velocity.y = vec.y * gun.power;
    bullet.whos=1;/* the player fired it */
    //bulletTime = game.time.now + 200;
    var angDrift = game.rnd.between(-1, +2);
    if (angDrift==+2) angDrift=0;
    gun.angle += angDrift;
    gun.power += game.rnd.between(-1, +1);
    this.joystick.updateJoypadBarrel();
  }
}

/* check through the group of bullets to see if any have hit our foreground land,
 *  using the bitmap getPixel command to look for solid ground */
Bullets.prototype.checkBulletsToLand = function () {
//function checkBulletsToLand(bullets, bitmap) {
  var over=1;
  var land = this.land;
  var explosions = this.explosions;
  this.forEachExists(function(bullet) {
    var x = Math.floor(bullet.x);
    var y = Math.floor(bullet.y);
    /* screen zoom out trigger */
    if (bullet.whos==1) {
      var o=checkBulletForCameraMove(x,y);
      if (o>over) over=o;
    }
    if (land.bitmap){
      //var rgba = bitmap.getPixel(x, y);
      //console.log( "rgba rga "+rgba.r+" "+rgba.g+" "+rgba.a );
      if (land.checkBitmapForHit(x,y, bullet.whos) > 0) {
        if (exp=explosions.getFirstExists(false)) {
          exp.reset(x, y);
          exp.play('boom', 30, false, true);
        }
        /* Erase a Circle in the land to make a crater */
        land.drawCrater(bullet.lastX, bullet.lastY, 16);

        bullet.kill();
        game.camera.shake(0.0010, 100); /* shake the screen a bit! */
      }
    }
    bullet.lastX = x;
    bullet.lastY = y;
  }, this);

  changeScaleMode(over);

}

function tankToBulletsHandler(tank, bullet) {
  bullet.kill();
  game.camera.shake(0.0020, 250); /* shake the screen a bit! */
}


/*********************** Trace Lines ******************************************/
/******************************************************************************/
var Trace = function() {
  /****** Trace Lines ****************/
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  for ( i = 0; i < 100; i++)
  {
      var t = this.create(0, 0, 'trace');
      t.name = 'trace' + i;
      t.exists = false;
      t.visible = false;
      t.anchor.set(0.5, 0.5);
  }
  this.traceOn=false;
};
inheritPrototype(Trace, Phaser.Group);

Trace.prototype.updateTrace = function(player, land) {
  var gun = player.gun;  /* just to shorten some variable names */

  if (land.bitmap && this.traceOn) {
    /* this will animate the trace line, by slightly moving the start point every second */
    var startNudge = 4+ ((new Date()).getSeconds() % 2) * 10;

          var vec = new Phaser.Point(0,-1);
          vec = vec.rotate(0,0, player.gun.angle, true);

                              /* end of gun barrel */
    var p = new Phaser.Point(player.tank.x +(vec.x*50), player.tank.y +(vec.y*50));
    var last = new Phaser.Point(p.x, p.y);
    var deltaX = (vec.x * gun.power) / 100;
    var deltaY = (vec.y * gun.power) / 100;
    var collision=false;
    var changeWorldScale=1;
    /* Lets redraw all the trace marks in place */
    do {
      deltaY += (game.physics.arcade.gravity.y / 100)/100;
      p.x += deltaX;
      p.y += deltaY;
    }while(Math.abs(last.distance(p)) < startNudge);
    for (n=0; n<100; n++) { /* go through each of the trace dots */
      var t = this.next(); /* t is our next trace dot sprite */
      if (collision){
        t.exists=false; //t.visible=false; /* we're finished, but we still must erase all the remaining dots */

      }else{
        t.reset(p.x, p.y); /* place the next dot on the line */
        t.angle = Phaser.Math.radToDeg(
                    Phaser.Math.angleBetween(0,0, deltaX, deltaY));
        last.x=p.x; last.y=p.y;
        do{ /* an inner loop, to slowly step along the line until we advance 20 pixels, ready for next dot */
          deltaY += (game.physics.arcade.gravity.y / 100)/100;
          p.x += deltaX;
          p.y += deltaY;
          /* Check for land collision */
          //var rgba = bitmap.getPixel(Math.floor(p.x), Math.floor(p.y));
          //if (rgba.a > 0) collision=true;
          if (land.checkBitmapForHit(Math.floor(p.x), Math.floor(p.y), 1) > 0)
              collision=true;
        }while(Math.abs(last.distance(p)) < 20);
      }
    }

    /* jump to different zoom points, depending on where the trace marks are pointing */
    var newScale=1;
    if (p.x > 800) newScale=2;
    if (p.x > 1600 && p.y<970) newScale=3;
    changeScaleMode(newScale);
  }
};


Trace.prototype.turnTraceOn = function() {
//function turnTraceOn() {
  this.traceOn=true;
};
Trace.prototype.turnTraceOff = function() {
//function turnTraceOff() {
  if (this.traceOn==false) return;
  for (n=0; n<100; n++) {
    var t = this.next();
    t.exists=false;
  }
  this.traceOn=false;
};

/* convert an angle (degrees) into a vector.  Assumes 0 degrees is pointing up */
function angleToVector( angle ) {
  var vec = new Phaser.Point(0,-1);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
