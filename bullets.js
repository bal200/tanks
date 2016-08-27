
/****** Bullets and Trace markers ************/

/***** Bullets **********/
var bulletTime=0;
var bullets;
var trace;
var traceOn=false;

function createBullets(th) {

  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;

  for (var i = 0; i < 20; i++)
  {
      var b = bullets.create(0, 0, 'bullet');
      b.name = 'bullet' + i;
      b.exists = false;
      b.visible = false;
      b.checkWorldBounds = true;
      b.anchor.set(0.5, 0.5);
      b.lastX=0; b.lastY=0;
      b.events.onOutOfBounds.add(function(bullet) {
        bullet.kill();
      }, this);
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

}


function updateBullets(th) {
  
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
          vec = vec.rotate(0,0, gun.angle, true);
          
                              /* end of gun barrel */
    var p = new Phaser.Point(player.x +(vec.x*6), player.y +(vec.y*6));
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
          var rgba = bitmap.getPixel(Math.floor(p.x), Math.floor(p.y));
          if (rgba.a > 0) collision=true;
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


function fire(th) {
//if (game.time.now > bulletTime)
//{
    drawOff(); /* turn off drawing mode now were shootin' */
    if (joystick.pointerId==null)  turnTraceOff(); /* get rid of the trace lines now too */
    var bullet = bullets.getFirstExists(false);
    if (bullet) {
      var vec = new Phaser.Point(0,-1);
      vec = vec.rotate(0,0, gun.angle, true);
      
      bullet.reset(player.x + (vec.x*6), player.y + (vec.y*6));
      bullet.body.velocity.x = vec.x * gun.power;
      bullet.body.velocity.y = vec.y * gun.power; 
      
      //bulletTime = game.time.now + 200;
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
    over=checkBulletForCameraMove(x,y);
    //if (x > 600) { setWorldScale(2); over=1;}
    //if (x > 600) { setWorldScale(2); over=1;}
    if (bitmap){
      var rgba = bitmap.getPixel(x, y);
      //console.log( "rgba rga "+rgba.r+" "+rgba.g+" "+rgba.a );
      if (rgba.a > 0) {
        /* Erase a Circle in the land to make a crater */
        bitmap.blendDestinationOut();
        bitmap.circle(bullet.lastX, bullet.lastY, 16);
        bitmap.blendReset();
        bitmap.update();
        bitmap.dirty = true;
        bullet.kill();
        game.camera.shake(0.0015, 200); /* shake the screen a bit! */
      }
    }
    bullet.lastX = x;
    bullet.lastY = y;
  }, this, bitmap);
  changeScaleMode(over);
  
  //if (over==0 & bullets.lastOver==1) {
  //    setTimeout(function(){
  //      setWorldScale(1);
  //    }, 2000);
  //}
  //bullets.lastOver=over;
  
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

