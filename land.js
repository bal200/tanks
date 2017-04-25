
/***** Foreground (Land) **********/
//var bitmap;
//var tilemap, layer, foreground;
//var count=0;

var Land = function( th ) {
  //Phaser.Group.call(this, game); /* create a Group, the parent Class */

  this.bitmap = null;  /* defined later */
  this.foreground=null;

  this.tilemap = game.add.tilemap('tilemap');
  this.tilemap.addTilesetImage('jungletileset_32x32', 'jungletileset');

  this.layer = this.tilemap.createLayer('Tile Layer 1', this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  this.layer.fixedToCamera = false;

  this.th = th;
};
//inheritPrototype(Land, Phaser.Group);

//function createLand(th) {
//  tilemap = game.add.tilemap('tilemap');
  //this.tilemap = new Phaser.Tilemap(game,'tilemap');
                           /* name in map data,  cache image name to use */
//  tilemap.addTilesetImage('jungletileset_32x32', 'jungletileset');

//  layer = tilemap.createLayer('Tile Layer 1', tilemap.widthInPixels, tilemap.heightInPixels);
//  layer.fixedToCamera = false;

//  count = 0;
//}

Land.prototype.updateLand = function() {
//function updateLand(th) {

  /* Fade in from Black at start of Game */
  if (count===0)
    game.camera.flash(0x000000, 600, true);

  /* now the tilemap has been rendered, copy it to a bitmap instead, so our destructable landscape works */
  if (++count == 5) {
    this.bitmap = game.make.bitmapData(this.tilemap.widthInPixels, this.tilemap.heightInPixels);
    this.bitmap.draw( this.layer );
    this.foreground = game.add.image(0, 0, this.bitmap);
    this.bitmap.update();
    this.layer.destroy();
    if (this.th.joystick) game.world.bringToTop(this.th.joystick);
    //game.world.bringToTop(th.button);
    //game.world.bringToTop(drawButton);
  }

};

/* collision detect between land, and to bullet or trace */
/* this colision function will exclude hits in the tanks own defence area */
Land.prototype.checkBitmapForHit = function(x,y, who) {
//function checkBitmapForHit(bitmap, x,y, who) {
  var rgba = this.bitmap.getPixel(x, y);
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
};

/* Erase a Circle in the land to make a crater */
Land.prototype.drawCrater = function( x,y, width) {
  this.bitmap.blendDestinationOut();
  this.bitmap.circle(x,y, width);
  this.bitmap.blendReset();
  this.bitmap.update();
  this.bitmap.dirty = true;
};

Land.prototype.drawStartDefence = function (x,y, colourString) {
  this.bitmap.circle(x, y, 4.5, colourString);
  //this.bitmap.update();
  //this.bitmap.dirty = true;
};
Land.prototype.drawDefence = function (x1,y1, x2,y2, colourString) {
  this.bitmap.circle(x2, y2, 4.5, colourString);
  this.bitmap.line(x1,y1, x2,y2, colourString,  10);
  this.bitmap.update();
  this.bitmap.dirty = true;
};

/******************* Clouds *****************************/

function cloudLoop( cloud, tween ) {
  tween.stop();
  game.add.tween(cloud).to({x:-100}, 1, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .to({x:1300}, 150000, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .loop()
                       .start();
}
