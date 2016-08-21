

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
    game.world.bringToTop(th.joystick);
    game.world.bringToTop(th.button);
  }
  
}