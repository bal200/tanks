

/***** Foreground (Land) **********/   
var bitmap;
var tilemap, layer, foreground;
var count=0;


function createLand(th) {

  tilemap = game.add.tilemap('tilemap');
  //this.tilemap = new Phaser.Tilemap(game,'tilemap');
                           /* name in map data,  cache image name to use */
  tilemap.addTilesetImage('jungletileset_32x32', 'jungletileset');

  layer = tilemap.createLayer('Tile Layer 1', tilemap.widthInPixels, tilemap.heightInPixels);
  layer.fixedToCamera = false;
  
  count = 0;

}

function updateLand(th) {
  
  /* Fade in from Black at start of Game */
  if (count==0)
    game.camera.flash(0x000000, 600, true);

  
  /* now the tilemap has been rendered, copy it to a bitmap instead, so our destructable landscape works */
  if (++count == 5) {
    bitmap = game.make.bitmapData(tilemap.widthInPixels, tilemap.heightInPixels);
    bitmap.draw( layer );
    foreground = game.add.image(0, 0, bitmap);
    bitmap.update();
    layer.destroy();
    if (th.joystick) game.world.bringToTop(th.joystick);
    //game.world.bringToTop(th.button);
    //game.world.bringToTop(drawButton);
  }
  
}

/* collision detect between land, and to bullet or trace */
/* this colision function will exclude hits in the tanks own defence area */
function checkBitmapForHit(bitmap, x,y, who) {
  var rgba = bitmap.getPixel(x, y);
  if (rgba.a > 0) {
    if (who==1) { /* its the players bullet */
      if (x>140 && x<800 && 
          y>300 && y<600) {  /* its in their defences, so ignore this hit */
        return 0;
      }
      return 1;
    }else if (who==2) { /* its the enemys bullet */
      if (x>1050 && x<1800 && 
          y>200 && y<600) {  /* its in their defences, so ignore this hit */
        return 0;
      }
      return 1;
    }
  }
  return 0;
}


function cloudLoop( cloud, tween ) {
  tween.stop();
  game.add.tween(cloud).to({x:-100}, 1, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .to({x:1300}, 150000, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .loop()
                       .start();
}







