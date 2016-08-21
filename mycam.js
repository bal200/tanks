

/***** My Camera initialisation **********/
var cameraMidPos = new Phaser.Point(0, 0);  /* my camera */
var worldScale = 1.2;   /* right at game begining, this 1.2 will cause a slow zoom out to 1.0 */
var worldScaleTarget = 1.0;
var lerp = 0.1;        // Camera movement amount of damping, lower values = smoother camera movement
var scaleLerp = 0.05;  /* amount of damping on scale changes */

var lastScaleModeRequest=1;
var scaleModeTimeout=null;


function createMyCam(th) {
  
    /****** My Camera *****************/
    cameraMidPos.setTo(player.x, player.y);
    //this.game.camera.reset();
    //worldScale = 1.20; /* begin with camera slowly zooming out for drama */
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
      worldScale += scaleDif * scaleLerp;/* 0.05 Scale lerp */
      
    // set a minimum and maximum scale value
    worldScale = Phaser.Math.clamp(worldScale, 0.4, 1.2);
    
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




function reduceAScale(scale, ratio) {
  return ((scale-1)*ratio) +1;
}


