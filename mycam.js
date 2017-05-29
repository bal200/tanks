

/***** My Camera initialisation **********/
//var MyCam = function() {
  var cameraMidPos = new Phaser.Point(0, 0);  /* Current middle of My camera view */
  var worldScale = 1.0;   /* right at game begining, this 1.3 will cause a slow zoom out to 1.0 */
  var worldScaleTarget = 1.0;
  var lerp = 0.1;        // Camera movement amount of damping, lower values = smoother camera movement
  var scaleLerp = 0.05;  /* amount of damping on scale changes */
  var camTarget = new Phaser.Point(0,0); /* where the cam shold be now.  it will Lerp towards this slowly */
  var camVelocity = new Phaser.Point(0,0); /* speed the cameraMidPos is moving towards cam Target */

  var scaleMode=1;
  var screenBottomTarget;
  var scaleModeTimeout=null;
  var scaleModeChangeWaiting=0;
  var screenSizeScaled;



//}

function createMyCam(th) {

    game.scale.onFullScreenChange.add(function() { /* re-do the scaling if we go full screen */
      setWorldScale();
    });

    /****** My Camera *****************/
    camTarget.setTo(430, -100);
    cameraMidPos.setTo(430, -100); /* (player.x, 540) @todo: find a good cam start point */
    //this.game.camera.reset();
    setWorldScale( 1 /*Mode 1*/ );
    worldScale=1.5;
    game.camera.bounds = null; /* Stop the Phaser builtin camera from messing with our zoom code */
}

function updateMyCam(th) {

    /********** My Camera **************************************/

    /**** Work out the Scale factor ***/
    scaleDif = worldScaleTarget - worldScale;
    if (count < 240) { /* @todo: do timing better */
      worldScale += scaleDif * (scaleLerp/3); /* very slow zoom out at start of game */
    }else{
      worldScale += scaleDif * scaleLerp;/* 0.05 Scale lerp */
    }
    // set a minimum and maximum scale value
    worldScale = Phaser.Math.clamp(worldScale, 0.35, 2.0);

    // set our world scale
    //game.world.scale.set(worldScale);
    th.zoomable.scale.set(worldScale);

    /***** Work out Screen size and Screen Middle point ****/
    /* Note: screen width including scaling is (game.width/worldScale)  */
    screenSizeScaled = new Phaser.Point(game.width/worldScale,
                                            game.height/worldScale);
    /* calc middle point of camera in world coords */
    if (gameMode>1) {
      camTarget.setTo(th.player.tank.x, th.player.tank.y);
      if (camTarget.y+(screenSizeScaled.y/2) > screenBottomTarget) { /* Clamp the screen bottom for cosmetic reasons */
        camTarget.y = (screenBottomTarget-(screenSizeScaled.y/2) );
      }
    }
    /* move towards camTarget */
    var changex = (camTarget.x - cameraMidPos.x) * lerp; /* find the screen middle in World */
    var changey = (camTarget.y - cameraMidPos.y) * lerp;
    //if ( changex > camVelocity.x) { camVelocity.x += (lerp*2); changex = camVelocity.x }
    //if ( changex < camVelocity.x) { camVelocity.x -= (lerp*2); changex = camVelocity.x }
    //if ( changey > camVelocity.y) { camVelocity.y += (lerp*2); changey = camVelocity.y }
    //if ( changey < camVelocity.y) { camVelocity.y -= (lerp*2); changey = camVelocity.y }

    if (changex > 0) {
      if (changex > camVelocity.x) { camVelocity.x += (lerp*2); }
      if (changex < camVelocity.x) { camVelocity.x = changex; }
    }
    if (changex < 0) {
      if (changex < camVelocity.x) { camVelocity.x -= (lerp*2); }
      if (changex > camVelocity.x) { camVelocity.x = changex; }
    }
    if (changey > 0) {
      if (changey > camVelocity.y) { camVelocity.y += (lerp*2); }
      if (changey < camVelocity.y) { camVelocity.y = changey; }
    }
    if (changey < 0) {
      if (changey < camVelocity.y) { camVelocity.y -= (lerp*2); }
      if (changey > camVelocity.y) { camVelocity.y = changey; }
    }

    cameraMidPos.x += camVelocity.x;
    cameraMidPos.y += camVelocity.y;

    /* work out camera offset, based on Scale, and camera coords are for top left of camera */
    /* Camera middle - half screen width, allowing for scaling of screen too */
    th.zoomable.pivot.x = cameraMidPos.x - (screenSizeScaled.x /2);
    th.zoomable.pivot.y = cameraMidPos.y - (screenSizeScaled.y /2);
    /* Limit camera to world bounds */
    th.zoomable.pivot.x = Phaser.Math.clamp(th.zoomable.pivot.x, level.x, level.x2 - screenSizeScaled.x);
    th.zoomable.pivot.y = Phaser.Math.clamp(th.zoomable.pivot.y, level.y, level.y2 - screenSizeScaled.y);
//    game.world.pivot.y = Phaser.Math.clamp(game.world.pivot.y, level.y, 960 - screenSizeScaled.y);

    /* ease gentle up if the screen is showing too low.  No one wants the screen filled with ground! */
    var screenBottom = th.zoomable.pivot.y + screenSizeScaled.y;
//    var dif=screenBottom - screenBottomTarget;
//    if (dif > 0) {
//      cameraMidPos.y -= (dif * (lerp*2.0));
//    }

    //this.game.camera.focusOnXY(cameraMidPos.x, cameraMidPos.y);


    /******** Parallax Background **********************************/
    th.background.myUpdate(th.zoomable.pivot, screenSizeScaled, worldScale);

}

/******************** PARALLAX BACKGROUND CLASS ***************************************/
/**************************************************************************************/
var Parallax = function(bgPercent, bgOffset) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  this.bgPercent=bgPercent; /* percentage of the main worldScale */
  this.bgOffset=bgOffset;  /* Point */
};
inheritPrototype(Parallax, Phaser.Group);

Parallax.prototype.myUpdate=function(pivot, screenScale, worldScale) {
    /******** Parallax Background **********************************/
    //var bgPercent = level.bgPercent;
    //var bgOffset = level.bgOffset;
    /* Work out Camera Middle again, but this time it will include any Clamping */
//pivot = {x:0,y:0};
    var camMid = new Phaser.Point(pivot.x + (screenScale.x /2),
                                     pivot.y + (screenScale.y /2));

    /** A percentage of the main screen Scale will be the Backgrounds scale.
     ** small values = slow moving, distant looking background */
    var bgScale = (1/worldScale) *  reduceAScale(worldScale+1.0, this.bgPercent);
    /* the (1/worldscale) effectively cancels out the worldscale already in the translation */
    this.scale.set(  bgScale  );

    this.position.set(camMid.x /* start from screen middle, this value doesnt get scaled */
                          -(( (camMid.x*this.bgPercent) +this.bgOffset.x ) *bgScale),
                       /* take off to pull bg to the left:
                        *  a small percentage of camera position, so it moves slower
                        *  add an offset to account for the black on left and top edges,
                        *  then multiply by the backgrounds scale from above */

                        (camMid.y) /* same for Y */
                          -(( (camMid.y*this.bgPercent)+this.bgOffset.y ) * bgScale) );
};


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
  if (i != null)  scaleMode = i;
  var a=game.width / 900 ;

  if (scaleMode==1){worldScaleTarget=1.0*a; /* zoomed in on base */
             screenBottomTarget=730; }
  if (scaleMode==2){worldScaleTarget=0.59*a; /* zoomed out for firing */
               screenBottomTarget=960; }
  if (scaleMode==3){worldScaleTarget=0.49*a; /* extended zoom out - for distance firing */
               screenBottomTarget=960; }
}



function reduceAScale(scale, ratio) {
  return ((scale-1)*ratio) +1;
}



/** Convert coordinates on the screen, like touches, into their position if they were in the game world
 ** Takes into account the camera position and scaling too */
function screenToWorld(s) {
  w = new Phaser.Point();
  w.x = ((s.x / worldScale) + myGame.zoomable.pivot.x);
  w.y = ((s.y / worldScale) + myGame.zoomable.pivot.y);
  return w;
}
function worldToScreen(w) {
  s = new Phaser.Point();
  s.x = ((w.x - myGame.zoomable.pivot.x) * worldScale);
  s.y = ((w.y - myGame.zoomable.pivot.y) * worldScale);
  return s;
}
function screenToWorldScale(s) {
  return (1/worldScale) * s;
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
