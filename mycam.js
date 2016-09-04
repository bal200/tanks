

/***** My Camera initialisation **********/
var cameraMidPos = new Phaser.Point(0, 0);  /* my camera */
var worldScale = 1.3;   /* right at game begining, this 1.3 will cause a slow zoom out to 1.0 */
var worldScaleTarget = 1.0;
var lerp = 0.1;        // Camera movement amount of damping, lower values = smoother camera movement
var scaleLerp = 0.05;  /* amount of damping on scale changes */


var scaleMode=1;
var screenBottomTarget;
var scaleModeTimeout=null;
var scaleModeChangeWaiting=0;

function createMyCam(th) {
  
    /****** My Camera *****************/
    cameraMidPos.setTo(player.x, 540); /* @todo: find a good cam start point */
    //this.game.camera.reset();
    setWorldScale( 1 /*Mode 1*/ );
    worldScale=1.4;
    game.camera.bounds = null; /* Stop the Phaser builtin camera from messing with our zoom code */
}

function updateMyCam(th) {
  
    /********** My Camera **************************************/
   
    /* calc middle point of camera in world coords */
    cameraMidPos.x += (player.x - cameraMidPos.x) * lerp; /* find the screen middle in World */
    cameraMidPos.y += (player.y - cameraMidPos.y) * lerp;
    
    /* temporary zoom out trigger from player movement */
      //var dist = Math.abs( cameraMidPos.distance(this.player) );
      //var worldScaleTarget = 1/ (1.0 + (dist*0.007));
      //worldScaleTarget = 
    scaleDif = worldScaleTarget - worldScale;
    if (count < 240) { /* @todo: do timing better */
      worldScale += scaleDif * (scaleLerp/3); /* very slow zoom out at start of game */
    }else{
      worldScale += scaleDif * scaleLerp;/* 0.05 Scale lerp */
    }
    // set a minimum and maximum scale value
    worldScale = Phaser.Math.clamp(worldScale, 0.4, 1.3);
    
    // set our world scale
    game.world.scale.set(worldScale);
    
    /* Note: screen width including scaling is (game.width/worldScale)  */
    var screenSizeScaled = new Phaser.Point(game.width/worldScale,
                                            game.height/worldScale);


    /* work out camera offset, based on Scale, and camera coords are for top left of camera */
    /* Camera middle - half screen width, allowing for scaling of screen too */
    game.world.pivot.x = cameraMidPos.x - (screenSizeScaled.x /2);
    game.world.pivot.y = cameraMidPos.y - (screenSizeScaled.y /2);
    /* Limit camera to world bounds */
    game.world.pivot.x = Phaser.Math.clamp(game.world.pivot.x, level.x, level.x2 - screenSizeScaled.x);
    game.world.pivot.y = Phaser.Math.clamp(game.world.pivot.y, level.y, level.y2 - screenSizeScaled.y);
    
    /* ease gentle up if the screen is showing too low.  No one wants the screen filled with ground! */
    var screenBottom = game.world.pivot.y + screenSizeScaled.y;
    var dif=screenBottom - screenBottomTarget;
    if (dif > 0) {
      cameraMidPos.y -= (dif * (lerp*2.0));
    }
    
    //this.game.camera.focusOnXY(cameraMidPos.x, cameraMidPos.y);

    
    /******** Parallax Background **********************************/
    /* Work out Camera Middle again, but this time it will include any Clamping */
    var newCamMid = new Phaser.Point(game.world.pivot.x + (screenSizeScaled.x /2),
                                     game.world.pivot.y + (screenSizeScaled.y /2));

    var bgPercent = level.bgPercent;
    /** A percentage of the main screen Scale will be the Backgrounds scale.
     ** small values = slow, distant looking background */
    var bgScale =  (1/worldScale) * reduceAScale(worldScale, bgPercent);
    /* the (1/worldscale) effectively cancels out the worldscale already in the translation */
    background.scale.set(  bgScale  );
    
    var bgOffset = level.bgOffset;

    background.position.set(newCamMid.x /* start from screen middle, this value doesnt get scaled */
                          -(( (newCamMid.x*bgPercent) +bgOffset.x ) *bgScale),
                       /* take off to pull bg to the left:
                        *  a small percentage of camera position, so it moves slower
                        *  add an offset to account for the black on left and top edges,
                        *  then multiply by the backgrounds scale from above */
                        
                        (newCamMid.y) /* same for Y */
                          -(( (newCamMid.y*bgPercent)+bgOffset.y ) * bgScale) );

}

function changeScaleMode(n) {
  if (scaleMode == n) return; /* already at the right scale, do nothing */
  var last = scaleMode;
  if (n > last) {  /* we're increasing the screen size, do straight away */
    setWorldScale(n);
  }else{ /* we're reducing the screen size */
    if (scaleModeTimeout!=null) { /* already a timeout waiting, update it */
      scaleModeChangeWaiting = n;
    }else{ /* no existing timeout, so make one */
      scaleModeChangeWaiting = n;
      scaleModeTimeout=setTimeout(function(){ /* reduce the screen size in 3 seconds, little dramatic camera delay :-) */
        setWorldScale(scaleModeChangeWaiting);
        scaleModeTimeout=null; scaleModeChangeWaiting=0;
      }, 3000);
    }
  }

}
function checkBulletForCameraMove(x,y) {
  if (x > 600) { return(2); }
  if (x > 1400) { return(3); }
  return 1;
}

function setWorldScale( i ) {
  game.camera.reset(); /* work around to stop built-in cam problem */
  scaleMode = i;
  if (i==1){worldScaleTarget=1.0; /* zoomed in on base */
             screenBottomTarget=730; }
  if (i==2){worldScaleTarget=0.59; /* zoomed out for firing */
               screenBottomTarget=960; }
  if (i==3){worldScaleTarget=0.49; /* extended zoom out - for distance firing */
               screenBottomTarget=960; }
}



function reduceAScale(scale, ratio) {
  return ((scale-1)*ratio) +1;
}


