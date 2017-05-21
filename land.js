 /***** Foreground (Land) **********/
//var bitmap;
//var tilemap, layer, foreground;
//var count=0;

/*  different bitmap TYPES: */
var LAND = 1;
var DRAWING = 2;
var ENEMY_DRAWING = 3;

var Land = function( th ) {
  //Phaser.Group.call(this, game); /* create a Group, the parent Class */

  //this.bitmap = null;  /* the actual bitmap of destructable landscape */
  //this.foreground=null; /* the large image to hold destructable landscape */

  this.tilemap = game.add.tilemap('tilemap');
  this.tilemap.addTilesetImage('jungletileset_32x32', 'jungletileset');

  this.layer = this.tilemap.createLayer('Tile Layer 1', this.tilemap.widthInPixels, this.tilemap.heightInPixels);
  this.layer.fixedToCamera = false;
  this.layer.autoCull = false;
  // this.layer.debug = true;
  this.tilemap.setCollisionBetween(1,884); /* set all the tiles as things to bump into */

  this.th = th;
  this.bitmaps = []; /* list of destructable squares over the map */
};

/**** TYPE: 1=land tilemap,
 ****       2=drawing bitmap
 ****       3=enemys drawing bitmap */
var Bitmap = function( x1,y1, x2,y2, type) {
  this.x1 = x1; this.y1 = y1;
  this.x2 = x2; this.y2 = y2;
  if (type) this.type = type; else this.type=DRAWING; /*drawing bitmap*/
  this.width = x2 - x1; this.height = y2 - y1;
  this.bitmap = game.make.bitmapData(this.width, this.height);
  //this.bitmap.draw( this.layer );
  this.image = game.add.image(x1, y1, this.bitmap);
  this.bitmap.update();
  //this.layer.destroy();
};

Land.prototype.tilemapToBitmap = function(tilemap, layer) {
  var bitmap = new Bitmap(0,0, tilemap.widthInPixels, tilemap.heightInPixels, LAND /*land type*/);
  bitmap.bitmap.draw( layer );
  bitmap.bitmap.update();
  layer.destroy();

  this.bitmaps.push(bitmap);

  //if (this.th.joystick) game.world.bringToTop(this.th.joystick);
  //game.world.bringToTop(this.th.button);
  //game.world.bringToTop(drawButton);
  //game.world.bringToTop(this.bitmaps[0].image);
};

Land.prototype.createBitmap = function(x1,y1, x2,y2, type) {
  var bitmap = new Bitmap(x1,y1, x2,y2, type);
  this.bitmaps.push(bitmap);
};

/* check for a pixel hit on all the bitmaps.  returns 1 if a land/drawing pixel exists at x,y */
Land.prototype.getPixel = function(x,y) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        var rgba = b.bitmap.getPixel( x-b.x1, y-b.y1 );
        if (rgba.a >0) return 1;
        /* continue, as bitmaps can overlap, their maybe more */
        //else return null;
      }
    }
  }
  return null;
};
/* check for a pixel hit on the bitmaps BUT exclude a bitmap (eg players own defences) */
Land.prototype.getPixelExclude = function(x,y, excludeType) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type != excludeType)) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        var rgba = b.bitmap.getPixel( x-b.x1, y-b.y1 );
        if (rgba.a >0) return 1;
      }
    }
  }
  return null;
};

Land.prototype.updateLand = function() {
  count++;
  /* now the tilemap has been rendered, copy it to a bitmap instead, so our destructable landscape works */
  if (count == 5) {
    this.tilemapToBitmap(this.tilemap, this.layer);
    //if (this.th.joystick) game.world.bringToTop(this.th.joystick);
    //game.world.bringToTop(this.th.button);
    //game.world.bringToTop(drawButton);
    //game.world.bringToTop(this.bitmaps[0].image);
    game.world.sort(); /* put everything back in order of their Z depth */
  }
};

/* collision detect between land, and to bullet or trace */
/* this collision function will exclude hits in the tanks own defence area */
Land.prototype.checkBitmapForHit = function(x,y, who) {
  var excludeType=0;
  if (who==PLAYER) excludeType=DRAWING;
  if (who==ENEMY) excludeType=ENEMY_DRAWING;

  if (this.getPixelExclude(x, y, excludeType)) {
    return 1;
  }else
    return 0;
};

/* Erase a Circle in the land to make a crater */
Land.prototype.drawCrater = function( x,y, width, excludeType) {
  var h=width/2;
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type != excludeType)) {
      if ( x>(b.x1-h) && x<(b.x2+h) &&
           y>(b.y1-h) && y<(b.y2+h) ) {
        b.bitmap.blendDestinationOut();
        b.bitmap.circle(x-b.x1, y-b.y1, width);
        b.bitmap.blendReset();
        b.bitmap.update();
        b.bitmap.dirty = true;
      }
    }
  }
};
Land.prototype.drawStartDefence = function (x,y, colourString, type) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type == type)) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        b.bitmap.circle(x-b.x1, y-b.y1, 4.5, colourString);
      }
    }
  }
};
Land.prototype.drawDefence = function (x1,y1, x2,y2, colourString, type) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type == type)) {
      if (x1>b.x1 && x1<b.x2 && y1>b.y1 && y1<b.y2) {
        b.bitmap.circle(x2-b.x1, y2-b.y1, 4.5, colourString);
        b.bitmap.line(x1-b.x1,y1-b.y1, x2-b.x1,y2-b.y1, colourString,  10);
        b.bitmap.update();
        b.bitmap.dirty = true;
      }
    }
  }
};



/******************* Clouds *****************************/

function cloudLoop( cloud, tween ) {
  tween.stop();
  game.add.tween(cloud).to({x:-100}, 1, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .to({x:1300}, 150000, Phaser.Easing.Linear.None , false, 0, 0, false)
                       .loop()
                       .start();
}
