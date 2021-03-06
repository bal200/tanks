 /***** Foreground (Land) Class & my Bitmap class **********/

/*  different bitmap TYPES: */
var LAND = 1;
var DRAWING = 2;
var ENEMY_DRAWING = 3;
var COSMETIC = 4;
var OBJECTS = 5; /* SlidingDoor */
var ALL_SOLID_TYPES = [1,2,3,5];

var Land = function( myGame, data ) {
  this.tilemaps=[];
  this.tilemap = game.add.tilemap(data[0].tilemap /* the tilemap file*/);
  this.tilemap.addTilesetImage('jungletileset_32x32', 'jungletileset');
  for (var n=0; n<data.length; n++) {
    this.tilemaps[n] = this.loadTilemap(data[n], this.tilemap);
  }

  this.myGame = myGame;
  this.bitmaps = []; /* list of destructable squares over the map */
};

/**** TYPE: 1=LAND=land tilemap,
 ****       2=DRAWING=players drawing bitmap
 ****       3=ENEMY_DRAWING=enemys drawing bitmap 
 ****       4=COSMETIC=tunnels backgronds; NO collision (not ye used, cosmetics are tilemaps)
 ****       5=OBJECTS= Eg. SlidingDoor bitmap area, The Object will draw to it */
var Bitmap = function( x1,y1, x2,y2, type, image) {
  this.x1 = x1; this.y1 = y1;
  this.x2 = x2; this.y2 = y2;
  this.type = (type) ? type : DRAWING; /* a user drawable bitmap*/
  this.width = x2 - x1; this.height = y2 - y1;
  this.bitmap = game.make.bitmapData(this.width, this.height);
  if (image) { /* attach an existing image to this bitmap */
    this.image = image; 
    this.image.loadTexture(this.bitmap);
  } else { /* make a new image for this bitmap */
    this.image = game.add.image(x1, y1, this.bitmap); 
  }
  this.bitmap.update();
  if (type==LAND) this.image.z = 21;
  else this.image.z = 20;
};
Bitmap.prototype.setX = function(x) {
  this.x1=x; this.x2 = x + this.width; this.image.x=x;
}
Bitmap.prototype.setY = function(y) {
  this.y1=y; this.y2 = y + this.height; this.image.y=y;
}
Bitmap.prototype.drawSprite=function(key, x,y) {
  this.bitmap.draw(key, x,y);
  this.bitmap.update();
}
/* take a tilemap layer json from Tiled file, and prepare it into my own object
 * containing the tilemap, layer obj, and my level_data info */
Land.prototype.loadTilemap = function(data, tilemap) {
  //var tilemap = game.add.tilemap(data.tilemap /*'tilemap'*/);
  var layer = tilemap.createLayer(data.tilelayer,
                    tilemap.widthInPixels, tilemap.heightInPixels, myGame.zoomable);
  layer.fixedToCamera = false;
  layer.autoCull = false;
    // this.layer.debug = true;
  //this.tilemap.setCollisionBetween(1,884); /* set all the tiles as things to bump into */
  //myGame.zoomable.add(this.layer);
  var myTilemap={
    tilemap: tilemap,
    layer: layer,
    data: data
  }
  return myTilemap;
}
Land.prototype.tilemapToBitmap = function(tilemap, layer) {
  var bitmap = new Bitmap(0,0, tilemap.widthInPixels, tilemap.heightInPixels, LAND /*land type*/);
  bitmap.bitmap.draw( layer );
  bitmap.bitmap.update();
  layer.destroy();

  this.bitmaps.push(bitmap);
  this.myGame.zoomable.add(bitmap.image); /* add to group */
};
Land.prototype.tilemapToBitmaps = function() {
  for (var n=0; n<this.tilemaps.length; n++) {
    var tilemap = this.tilemaps[n];
    if (tilemap.data.type == LAND) {
      this.tilemapToBitmap(tilemap.tilemap, tilemap.layer);
    }
  }
}

Land.prototype.createBitmap = function(x1,y1, x2,y2, type) {
  var bitmap = new Bitmap(x1,y1, x2,y2, type);
  this.bitmaps.push(bitmap);
  this.myGame.zoomable.add(bitmap.image); /* add to group */
  return bitmap;
};
Land.prototype.addBitmapToList = function(b) {
  this.bitmaps.push(b);
  this.myGame.zoomable.add(b.image); /* add to group */
};

/* Create a list of bitmaps, from the level data object */
Land.prototype.createBitmaps = function(data/* json object from level data */) {
  var b; for (var n=0; n<data.length; n++) {
    b=data[n]; this.createBitmap(b.x1, b.y1,  b.x2, b.y2,  b.type);
  }
};
/* Shortcut function to create a bitmap from an enemy tanks position */
Land.prototype.createBitmapForEnemyTank = function( tank ) {
  this.createBitmap(tank.x-300,tank.y-400, tank.x+400,tank.y+40, ENEMY_DRAWING);
};

/* check for a pixel hit on the bitmaps.  returns 1 if a land/drawing pixel exists */
/* set excludeType to a bitmap type to skip that bitmap (eg players own defences) */
Land.prototype.getPixel = function(x,y, typeList) {
  if (typeList==undefined) typeList = ALL_SOLID_TYPES;
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if ( b && (typeList.includes(b.type)) ) {
      if ( x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2 ) {
        var rgba = b.bitmap.getPixel( x-b.x1, y-b.y1 );
        if (rgba.a >0) return 1;
        /* else continue, as bitmaps can overlap, there maybe more */
      }
    }
  }
  return 0;
};
Land.prototype.getPixelCol = function(x,y) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        var rgba = b.bitmap.getPixel( x-b.x1, y-b.y1 );
        if (rgba.a >0) return rgba;
        /* else continue, as bitmaps can overlap, there maybe more */
      }
    }
  }
  return 0;
};
Land.prototype.getPixelWhichBitmap = function(x,y) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        var rgba = b.bitmap.getPixel( x-b.x1, y-b.y1 );
        if (rgba.a >0) return b;
      }
    }
  }
  return 0;
};
Land.prototype.updateLand = function() {
  /* now the tilemap has been rendered, copy it to a bitmap instead, so our destructable landscape works */
  if (this.myGame.count == 2) {
    this.tilemapToBitmaps();
  }
};

/* collision detect between land and the bullet or trace */
/* this collision function will exclude hits in the tanks own defence area */
/* @TODO: pass an array of Types to check, rather than exclude */
Land.prototype.checkBitmapForHit = function(x,y, who) {
  var types;
  if (who==PLAYER) types=[LAND, ENEMY_DRAWING, OBJECTS];
  if (who==ENEMY) types=[LAND, DRAWING, OBJECTS];

  return this.getPixel(x, y, types);
};

var RIGHT=1, BOTTOM=2, LEFT=3, TOP=4, UP=5, DOWN=6;
Land.prototype.getSurfaceNormal = function(x,y) {
  var SIZE=20; /* must be multiple of 2 */
  x=Math.floor(x); y=Math.floor(y);
  /* Build a grid of 1s and 0s. */
  var grid = new Array(SIZE); /* grid[y][x] */
  for (j=0; j<SIZE; j++) {   /* Y */
    grid[j] = new Array(SIZE);
    for (i=0; i<SIZE; i++) {   /* X */
      grid[j][i] = this.getPixel( x +i -(SIZE/2), y +j -(SIZE/2) );
    }
  }
  /* print it to the console */
  // console.log("grid[][]: ");
  // for (j=0; j<SIZE; j++) {
  //   var str="";
  //   for (i=0; i<SIZE; i++) {
  //     if (i==(SIZE/2)&&j==(SIZE/2)) str=str+"X";
  //     else str = str + grid[j][i]; }
  //   console.log(""+j+"["+str+"]" );
  // }
  /* Walk the vertexes and add up the surface normals */
  var total=0, count=0, cur, start;
  cur=findFirstVertex(grid, {x:(SIZE/2), y:(SIZE/2), v:0,d:0} );
  if (!cur) return 0; /* error */
  start={x:cur.x, y:cur.y, v:cur.v,d:cur.d, a:cur.a}; /* quick object copy */  //findFirstVertex(grid, {x:10, y:10, v:0,d:0} );
  do{
    total += cur.a;
    count++;
    cur = nextVertex(grid, cur);
  }while(withinBounds(cur, SIZE) && count<20);
  /* now go the other way */
  cur=changeDirection(start);
  cur=nextVertex(grid, cur);
  do{
    total += cur.a;
    count++;
    cur = nextVertex(grid, cur);
  }while(withinBounds(cur, SIZE) && count<40);

  //console.log("total "+total+" count "+count);
  var ang=(total / count);
  if (ang>=360) ang-=360;
  if (ang<0) ang+=360;
  return ang;
};

/* find the nearest surface vertex to the starting place */
function findFirstVertex( grid, c) {
  if      ( grid[c.y-1][c.x] ==1 ) {
    return {x:c.x, y:c.y, v:TOP, d:RIGHT, a:180};  /* TOP */
  }else if ( grid[c.y][c.x+1] ==1 ) {
    return {x:c.x, y:c.y, v:RIGHT, d:DOWN, a:270};  /* RIGHT */
  }else if ( grid[c.y+1][c.x] ==1 ) {
    return {x:c.x, y:c.y, v:BOTTOM, d:LEFT, a:360};  /* BOTTOM */
  }else if ( grid[c.y][c.x-1] ==1 ) {
    return {x:c.x, y:c.y, v:LEFT, d:UP, a:90};  /* LEFT */
  }else /* CORNER SQUARES */
  if      ( grid[c.y-1][c.x-1] ==1 ) {
    return {x:c.x-1, y:c.y, v:TOP, d:RIGHT, a:180};  /* TOP LEFT */
  }else if ( grid[c.y-1][c.x+1] ==1 ) {
    return {x:c.x+1, y:c.y, v:TOP, d:RIGHT, a:180};  /* TOP RIGHT */
  }else if ( grid[c.y+1][c.x-1] ==1 ) {
    return {x:c.x-1, y:c.y, v:BOTTOM, d:LEFT, a:360};  /* BOTTOM LEFT */
  }else if ( grid[c.y+1][c.x+1] ==1 ) {
    return {x:c.x+1, y:c.y, v:BOTTOM, d:LEFT, a:360};  /* BOTTOM RIGHT */
  }

  /* TODO: Improve this to do repeating circles until a vertex is found */
  console.log("getSurfaceNormal Error: Coords not near a surface!");
  return null; /*oops*/
}
function changeDirection( c ) {
  if (c.d==RIGHT) c.d=LEFT;
  else if (c.d==LEFT) c.d=RIGHT;
  else if (c.d==UP) c.d=DOWN;
  else if (c.d==DOWN) c.d=UP;
  return c;
}
function withinBounds( c, SIZE ) {
  if (c.x<0+1 || c.x>=SIZE-1 || c.y<0+1 || c.y>=SIZE-1) return false; else return true;
}
/* Travel one place along the surface we're exploring */
function nextVertex( grid, c ) {
  /* VERTICALS */
  if (c.v == RIGHT) {
    if (c.d == UP) {
      ul = grid[c.y-1][c.x];  ur = grid[c.y-1][c.x+1];
      if (ul==0 && ur==0) return {x:c.x+1, y:c.y-1, v:BOTTOM, d:RIGHT, a:c.a+90};
      if (ul==0 && ur==1) return {x:c.x, y:c.y-1, v:RIGHT, d:UP, a:c.a+0};
      if (ul==1        ) return {x:c.x, y:c.y, v:TOP, d:LEFT, a:c.a-90};
    }if (c.d == DOWN) {
      dl = grid[c.y+1][c.x];  dr = grid[c.y+1][c.x+1];
      if (dl==0 && dr==0) return {x:c.x+1, y:c.y+1, v:TOP, d:RIGHT, a:c.a-90};
      if (dl==0 && dr==1) return {x:c.x, y:c.y+1, v:RIGHT, d:DOWN, a:c.a+0};
      if (dl==1        ) return {x:c.x, y:c.y, v:BOTTOM, d:LEFT, a:c.a+90};
    }
  }else if (c.v == LEFT) {
    if (c.d == UP) {
      ul = grid[c.y-1][c.x-1];  ur = grid[c.y-1][c.x];
      if (ul==0 && ur==0) return {x:c.x-1, y:c.y-1, v:BOTTOM, d:LEFT, a:c.a-90};
      if (ul==1 && ur==0) return {x:c.x, y:c.y-1, v:LEFT, d:UP, a:c.a+0};
      if (         ur==1) return {x:c.x, y:c.y, v:TOP, d:RIGHT, a:c.a+90};
    }if (c.d == DOWN) {
      dl = grid[c.y+1][c.x-1];  dr = grid[c.y+1][c.x];
      if (dl==0 && dr==0) return {x:c.x-1, y:c.y+1, v:TOP, d:LEFT, a:c.a+90};
      if (dl==1 && dr==0) return {x:c.x, y:c.y+1, v:LEFT, d:DOWN, a:c.a+0};
      if (         dr==1) return {x:c.x, y:c.y, v:BOTTOM, d:RIGHT, a:c.a-90};
    }
  }  /*  HORIZONTALS */
  else if (c.v == TOP) {
    if (c.d == LEFT) {
      lu = grid[c.y-1][c.x-1];  ld = grid[c.y][c.x-1];
      if (lu==0 && ld==0) return {x:c.x-1, y:c.y-1, v:RIGHT, d:UP, a:c.a+90};
      if (lu==1 && ld==0) return {x:c.x-1, y:c.y, v:TOP, d:LEFT, a:c.a+0};
      if (         ld==1) return {x:c.x, y:c.y, v:LEFT, d:DOWN, a:c.a-90};
    }if (c.d == RIGHT) {
      ru = grid[c.y-1][c.x+1];  rd = grid[c.y][c.x+1];
      if (ru==0 && rd==0) return {x:c.x+1, y:c.y-1, v:LEFT, d:UP, a:c.a-90};
      if (ru==1 && rd==0) return {x:c.x+1, y:c.y, v:TOP, d:RIGHT, a:c.a+0};
      if (         rd==1) return {x:c.x, y:c.y, v:RIGHT, d:DOWN, a:c.a+90};
    }
  }else if (c.v == BOTTOM) {
    if (c.d == LEFT) {
      lu = grid[c.y][c.x-1];  ld = grid[c.y+1][c.x-1];
      if (lu==0 && ld==0) return {x:c.x-1, y:c.y+1, v:RIGHT, d:DOWN, a:c.a-90};
      if (lu==0 && ld==1) return {x:c.x-1, y:c.y, v:BOTTOM, d:LEFT, a:c.a+0};
      if (lu==1         ) return {x:c.x, y:c.y, v:LEFT, d:UP, a:c.a+90};
    }if (c.d == RIGHT) {
      ru = grid[c.y][c.x+1];  rd = grid[c.y+1][c.x+1];
      if (ru==0 && rd==0) return {x:c.x+1, y:c.y+1, v:LEFT, d:DOWN, a:c.a+90};
      if (ru==0 && rd==1) return {x:c.x+1, y:c.y, v:BOTTOM, d:RIGHT, a:c.a+0};
      if (ru==1         ) return {x:c.x, y:c.y, v:RIGHT, d:UP, a:c.a-90};
    }
  }
}


/* @TODO: */
/** work out which bitmaps a new graphic need drawing on.
 ** This could be more than one if it crosses several bitmaps */
Land.prototype.whichBitmaps = function(x1,y1,x2,y2, type) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type == type)) {
      if ( x>(b.x1-h) && x<(b.x2+h) &&
           y>(b.y1-h) && y<(b.y2+h) ) {
      }
    }
  }
};

/* Erase a Circle in the land to make a crater 
 * Will draw to bitmap/s at these coords, but only if its in the types list (Eg LAND) */
Land.prototype.drawCrater = function( x,y, width, typeList) {
  var h=width/2;
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if ( b && (typeList.includes(b.type)) ) {
      if ( x>(b.x1-h) && x<(b.x2+h) && y>(b.y1-h) && y<(b.y2+h) ) {
        b.bitmap.blendDestinationOut();
        b.bitmap.circle(x-b.x1, y-b.y1, width);
        b.bitmap.blendReset();
        b.bitmap.update();
        b.bitmap.dirty = true;
      }
    }
  }
};
/* draw the rounded start of a line */
Land.prototype.drawStartDefence = function (x,y, colourString, type) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type == type)) {
      if (x>b.x1 && x<b.x2 && y>b.y1 && y<b.y2) {
        b.bitmap.circle(x-b.x1, y-b.y1, 5.5, colourString);
      }
    }
  }
};
/* draw part of a line, including rounded end */
Land.prototype.drawDefence = function (x1,y1, x2,y2, colourString, type) {
  for (n=0; n<this.bitmaps.length; ++n){
    var b=this.bitmaps[n];
    if (b && (b.type == type)) {
      if (x1>b.x1 && x1<b.x2 && y1>b.y1 && y1<b.y2) {
        b.bitmap.circle(x2-b.x1, y2-b.y1, 5.5, colourString);
        b.bitmap.line(x1-b.x1,y1-b.y1, x2-b.x1,y2-b.y1, colourString,  12);
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
