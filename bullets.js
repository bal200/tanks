
/****** Bullets and Trace markers ************/

/***** Bullets **********/
var bulletTime=0;
var bullets;
var trace;
var traceOn=false;
var explosions;

function createBullets(th) {

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;

  for (var i = 0; i < 40; i++)
  {
      var b = bullets.create(0, 0, 'bullet');
      b.name = 'bullet' + i;
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.anchor.set(0.5, 0.5);
      b.lastX=0; b.lastY=0;
      b.whos=0; /* 1=Players, 2=Enemies */
      b.events.onOutOfBounds.add(function(bullet) {
        bullet.kill();
      }, th);
  }
  
  /****** Trace Lines ****************/
  trace = game.add.group();
  for (var i = 0; i < 100; i++)
  {
      var t = trace.create(0, 0, 'trace');
      t.name = 'trace' + i;
      t.exists = false;
      t.visible = false;
      t.anchor.set(0.5, 0.5);
  }
  
  /******* Explosions group ********/
  explosions = game.add.group();
  explosions.createMultiple(10, 'boom');
  explosions.forEach(function(exp) {
    exp.anchor.x = 0.5; exp.anchor.y = 0.5;
    exp.animations.add('boom');
  });


}


function updateBullets(th) {
  var player = th.player;
  var gun = th.player.gun;  /* just to shorten some variable names */
  /********** Bullets ***************************************/
  /* check if any of the bullets have hit the destructable landscape */
  checkBulletsToLand(bullets, bitmap);
  /* set the bullets angles to their direction of travel */
  bullets.forEachExists(function(bullet) {
    bullet.angle = Phaser.Math.radToDeg(
                   Phaser.Math.angleBetween(0,0, bullet.body.deltaX(), bullet.body.deltaY()));
  }, this);
  
  
  
  /********** Trace Lines ************************************/
  if (bitmap && traceOn) {
    /* this will animate the trace line, by slightly moving the start point every second */
    var startNudge = 4+ ((new Date).getSeconds() % 2) * 10;
    
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
      var t = trace.next(); /* t is our next trace dot sprite */
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
          if (checkBitmapForHit(bitmap, Math.floor(p.x), Math.floor(p.y), 1) > 0)
              collision=true;
        }while(Math.abs(last.distance(p)) < 20);
      }
    }
    
    /* jump to different zoom points, depending on where the trace marks are pointing */
    var newScale=1;
    if (p.x > 800) newScale=2;
    if (p.x > 1600 && p.y<970) newScale=3;
    changeScaleMode(newScale);
/*    if (newScale==2) {
      if(trace.lastWorldScale==1) {
        setWorldScale(2);
        if (trace.changeWorldScaleTimeout) clearTimeout(trace.changeWorldScaleTimeout);
      }
      trace.lastWorldScale=2;
    }else if (newScale==3) {
      if(trace.lastWorldScale==1) {
        setWorldScale(2);
        if (trace.changeWorldScaleTimeout) clearTimeout(trace.changeWorldScaleTimeout);
      }
      trace.lastWorldScale=2;
    }else{
      if (trace.lastWorldScale==2) {
          trace.changeWorldScaleTimeout=setTimeout(function(){
            setWorldScale(1);
            trace.changeWorldScaleTimeout=null;
          }, 3000);
      }
      trace.lastWorldScale=1;
    }
*/
  }
  
}


function fire() {
  var player = this.player;
  var gun = this.player.gun;  /* just to shorten some variable names */

//if (game.time.now > bulletTime)
//{
    drawOff(); /* turn off drawing mode now were shootin' */
    if (this.joystick.pointerId==null)  turnTraceOff(); /* get rid of the trace lines now too */
    var bullet = bullets.getFirstExists(false);
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
//}
}

/* check through the group of bullets to see if any have hit our foreground land,
 *  using the bitmap getPixel command to look for solid ground */
function checkBulletsToLand(bullets, bitmap) {
  var over=1;
  bullets.forEachExists(function(bullet,bitmap) {
    var x = Math.floor(bullet.x);
    var y = Math.floor(bullet.y);
    /* screen zoom out trigger */
    if (bullet.whos==1) {
      var o=checkBulletForCameraMove(x,y);
      if (o>over) over=o;
    }
    if (bitmap){
      //var rgba = bitmap.getPixel(x, y);
      //console.log( "rgba rga "+rgba.r+" "+rgba.g+" "+rgba.a );
      if (checkBitmapForHit(bitmap, x,y, bullet.whos) > 0) {
        if (exp=explosions.getFirstExists(false)) {
          exp.reset(x, y);
          exp.play('boom', 30, false, true);
        }
        /* Erase a Circle in the land to make a crater */
        bitmap.blendDestinationOut();
        bitmap.circle(bullet.lastX, bullet.lastY, 16);
        bitmap.blendReset();
        bitmap.update();
        bitmap.dirty = true;
        bullet.kill();
        game.camera.shake(0.0010, 100); /* shake the screen a bit! */
      }
    }
    bullet.lastX = x;
    bullet.lastY = y;
  }, this, bitmap);
  
  changeScaleMode(over);
  
}

function tankToBulletsHandler(tank, bullet) {
  bullet.kill();
  game.camera.shake(0.0020, 250); /* shake the screen a bit! */
}

function turnTraceOn() {
  traceOn=true;
}
function turnTraceOff() {
  if (traceOn==false) return;
  for (n=0; n<100; n++) { 
    var t = trace.next(); 
    t.exists=false; 
  }
  traceOn=false;
}

/* convert an angle (degrees) into a vector.  Assumes 0 degrees is pointing up */
function angleToVector( angle ) {
  var vec = new Phaser.Point(0,-1);
  vec = vec.rotate(0,0, angle, true);
  return vec;
}
