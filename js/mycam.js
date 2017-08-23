var MODE_1 =0;
var MODE_2 =1;
var MODE_3 =2;

/***** My Camera initialisation **********/
var MyCam = function( myGame ) {
  this.myGame = myGame;
  this.cameraMidPos = new Phaser.Point(0, 0);  /* Current middle of My camera view */
  this.worldScale = 1.0;   /* right at game begining, this 1.3 will cause a slow zoom out to 1.0 */
  this.worldScaleTarget = 1.0;
  this.lerp = 0.1;        // Camera movement amount of damping, lower values = smoother camera movement
  this.scaleLerp = 0.05;  /* amount of damping on scale changes */
  this.camFollow = null; /* pointer to the actual object to follow */
  this.camTarget = new Phaser.Point(0,0); /* where the cam shold be now.  it will Lerp towards this slowly */
  this.camVelocity = new Phaser.Point(0,0); /* speed the cameraMidPos is moving towards cam Target */

  this.scaleMode= 0; /* the camera jumps between 3 preset scales */
  this.screenBottomTarget=0;
  this.scaleModeTimeout=null;
  this.scaleModeChangeWaiting=0;
  //this.screenSizeScaled;

  game.scale.onFullScreenChange.add(function() { /* re-do the scaling if we go full screen */
    setWorldScale();
  });
  //this.game.camera.reset();
  this.setWorldScale( 0 );
  game.camera.bounds = null; /* Stop the Phaser builtin camera from messing with our zoom code */

};

    /* imediately locate the camera */
MyCam.prototype.setPosition = function(startx, starty, start_scale) {
    this.camTarget.setTo(startx, starty);
    this.cameraMidPos.setTo(startx, starty); /* (player.x, 540) */

    this.worldScale=start_scale; /* 1.0 is normal */
};
/* set a game object for the Camera to follow with easing */
MyCam.prototype.setTarget = function( obj /*must have x,y properties*/) {
  this.camFollow = obj;
};

MyCam.prototype.update = function() {
    /* make things more readable */
    var myGame = this.myGame, zoomable=this.myGame.zoomable;
    var worldScale=this.worldScale, worldScaleTarget=this.worldScaleTarget;
    var cameraMidPos=this.cameraMidPos, camTarget=this.camTarget;

    /**** Work out the Scale factor ***/
    var scaleDif = worldScaleTarget - worldScale;
    if (this.myGame.count < 240) { /* TODO: do timing better */
      worldScale += scaleDif * (this.scaleLerp/3); /* very slow zoom out at start of game */
    }else{
      worldScale += scaleDif * this.scaleLerp;/* 0.05 Scale lerp */
    }
    // set a minimum and maximum scale value
    var worldScale=Phaser.Math.clamp(worldScale, 0.35, 2.0);

    // set our world scale
    zoomable.scale.set(worldScale);

    /***** Work out Screen size and Screen Middle point ****/
    /* Note: screen width including scaling is (game.width/worldScale)  */
    var screenSizeScaled = new Phaser.Point(game.width/worldScale,
                                            game.height/worldScale);
    /* calc middle point of camera in world coords */
    //if (gameMode>1) {
      camTarget.setTo(this.camFollow.x, this.camFollow.y);
      if (camTarget.y+(screenSizeScaled.y/2) > this.screenBottomTarget) { /* Clamp the screen bottom for cosmetic reasons */
        camTarget.y = (this.screenBottomTarget-(screenSizeScaled.y/2) );
      }
    //}
    /* move towards camTarget */
    var changex = (camTarget.x - cameraMidPos.x) * this.lerp; /* find the screen middle in World */
    var changey = (camTarget.y - cameraMidPos.y) * this.lerp;
    //if ( changex > camVelocity.x) { camVelocity.x += (lerp*2); changex = camVelocity.x }
    //if ( changex < camVelocity.x) { camVelocity.x -= (lerp*2); changex = camVelocity.x }
    //if ( changey > camVelocity.y) { camVelocity.y += (lerp*2); changey = camVelocity.y }
    //if ( changey < camVelocity.y) { camVelocity.y -= (lerp*2); changey = camVelocity.y }

    if (changex > 0) {
      if (changex > this.camVelocity.x) { this.camVelocity.x += (this.lerp*2); }
      if (changex < this.camVelocity.x) { this.camVelocity.x = changex; }
    }
    if (changex < 0) {
      if (changex < this.camVelocity.x) { this.camVelocity.x -= (this.lerp*2); }
      if (changex > this.camVelocity.x) { this.camVelocity.x = changex; }
    }
    if (changey > 0) {
      if (changey > this.camVelocity.y) { this.camVelocity.y += (this.lerp*2); }
      if (changey < this.camVelocity.y) { this.camVelocity.y = changey; }
    }
    if (changey < 0) {
      if (changey < this.camVelocity.y) { this.camVelocity.y -= (this.lerp*2); }
      if (changey > this.camVelocity.y) { this.camVelocity.y = changey; }
    }

    cameraMidPos.x += this.camVelocity.x;
    cameraMidPos.y += this.camVelocity.y;

    /* work out camera offset, based on Scale, and camera coords are for top left of camera */
    /* Camera middle - half screen width, allowing for scaling of screen too */
    zoomable.pivot.x = cameraMidPos.x - (screenSizeScaled.x /2);
    zoomable.pivot.y = cameraMidPos.y - (screenSizeScaled.y /2);
    /* Limit camera to world bounds */
    zoomable.pivot.x = Phaser.Math.clamp(zoomable.pivot.x, level.x, level.x2 - screenSizeScaled.x);
    zoomable.pivot.y = Phaser.Math.clamp(zoomable.pivot.y, level.y, level.y2 - screenSizeScaled.y);
//    game.world.pivot.y = Phaser.Math.clamp(game.world.pivot.y, level.y, 960 - screenSizeScaled.y);

    /* ease gentle up if the screen is showing too low.  No one wants the screen filled with ground! */
    var screenBottom = zoomable.pivot.y + screenSizeScaled.y;
//    var dif=screenBottom - screenBottomTarget;
//    if (dif > 0) {
//      cameraMidPos.y -= (dif * (lerp*2.0));
//    }
    //this.game.camera.focusOnXY(cameraMidPos.x, cameraMidPos.y);

    /******** Parallax Background **********************************/
    myGame.background.myUpdate(zoomable.pivot, screenSizeScaled, worldScale);

  /* put things back */
  this.worldScale=worldScale; this.worldScaleTarget=worldScaleTarget;
  this.cameraMidPos=cameraMidPos; this.camTarget=camTarget;
};

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
    /* the (1/worldScale) effectively cancels out the worldscale already in the translation */
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


MyCam.prototype.changeScaleMode = function(n) {
  //console.log("changeScaleMode "+n);
  if (this.scaleMode == n) return; /* already at the right scale, do nothing */
  var last = this.scaleMode;
  if (n > last) {  /* we're increasing the screen size, do straight away */
    this.setWorldScale(n);
  }else{ /* we're reducing the screen size */
    if (this.scaleModeTimeout!==null) { /* already a timeout waiting, update it */
      this.scaleModeChangeWaiting = n;
    }else{ /* no existing timeout, so make one */
      this.scaleModeChangeWaiting = n;
      this.scaleModeTimeout=setTimeout(function(){ /* reduce the screen size in 3 seconds, little dramatic camera delay :-) */
        this.setWorldScale(this.scaleModeChangeWaiting);
        this.scaleModeTimeout=null; this.scaleModeChangeWaiting=0;
      }.bind(this), 3000);
    }
  }
};

MyCam.prototype.checkBulletForCameraMove =function(x,y) {
  var new_mode=0;
  for (n=0; n<level.scaleModes.length; n++){
    if (x > level.scaleModes[n].trigger) new_mode=n;
  }
  //console.log("checkBulletForCameraMove "+new_mode);
  return new_mode;
  //if (x > 1400) { return(MODE_3); }
  //if (x > 600) { return(MODE_2); }
  //return MODE_1;
};

MyCam.prototype.setWorldScale =function( new_mode ) {
  //console.log("setWorldScale "+new_mode);
  if (gameMode==WIN || gameMode==LOOSE) return; /* dont let the scale jump around when on title screens */
  if (new_mode !== null)  this.scaleMode = new_mode;
  var a=game.width / 900 ;

  var mode = level.scaleModes[new_mode];
  this.worldScaleTarget = mode.scale*a; /* the new scale is based on the current mode, and the screen width */
  this.screenBottomTarget = mode.screenBottom;
  // if (this.scaleMode==MODE_1){this.worldScaleTarget=1.0*a; /* zoomed in on base */
  //                             this.screenBottomTarget=730; }
  // if (this.scaleMode==MODE_2){this.worldScaleTarget=0.59*a; /* zoomed out for firing */
  //                             this.screenBottomTarget=960; }
  // if (this.scaleMode==MODE_3){this.worldScaleTarget=0.49*a; /* extended zoom out - for distance firing */
  //                             this.screenBottomTarget=960; }
};


function reduceAScale(scale, ratio) {
  return ((scale-1)*ratio) +1;
}


/** Convert coordinates on the screen, like touches, into their position if they were in the game world
 ** Takes into account the camera position and scaling too */
MyCam.prototype.screenToWorld =function(s) {
  w = new Phaser.Point();
  w.x = ((s.x / this.worldScale) + this.myGame.zoomable.pivot.x);
  w.y = ((s.y / this.worldScale) + this.myGame.zoomable.pivot.y);
  return w;
};
MyCam.prototype.worldToScreen =function(w) {
  s = new Phaser.Point();
  s.x = ((w.x - this.myGame.zoomable.pivot.x) * this.worldScale);
  s.y = ((w.y - this.myGame.zoomable.pivot.y) * this.worldScale);
  return s;
};
MyCam.prototype.screenToWorldScale =function(s) {
  return (1/this.worldScale) * s;
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
