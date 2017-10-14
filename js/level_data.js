
/***** LEVEL DATA *************************************************************/

var levels = [{},{  /* Settings for each level in the game */
  level:1,
  tilemap: 'tilemap', tilelayer: 'Tile Layer 1',
  x:0,  y:-1536,  /* world size */
  x2:2048, y2:1024,
  background: 'background',
  bgPercent : 0.15,  /** This percentage of the main screen Scale will be used as the Backgrounds scale.
                      ** Small values = a slow moving distant background */
  bgOffset:{      /** Because the background maths is calculated from the screen middle, you may need to */
    x:400, y:470  /** pull the background to the left and to the top. Tweak this to make sure the      */
  },              /** background neatly covers the whole world. */
  scaleModes:[
    {scale:1.0, screenBottom:730, trigger:0},
    {scale:0.59, screenBottom:960, trigger:800},
    {scale:0.49, screenBottom:960, trigger:1600}
  ],
  player: {x:430, y:616},
  enemy: [{x:1400, y:607, type:1}],
  bitmap: [{x1:130,y1:300,  x2:800,y2:640, type:DRAWING}, /* players drawing area */
           {x1:1100,y1:200, x2:1800,y2:640, type:ENEMY_DRAWING} /* enemys drawing bitmap area */
          ]
},{
  level:2,
  tilemap: 'tilemap', tilelayer: 'Tile Layer 2',
  x:0,  y:-1536, x2:2048, y2:1024, /* world size */
  background: 'background',
  bgPercent : 0.15, bgOffset:{ x:900, y:470 },
  scaleModes:[
    {scale:1.0, screenBottom:750, trigger:0},
    {scale:0.59, screenBottom:960, trigger:1000},
    {scale:0.49, screenBottom:960, trigger:1300},
    {scale:0.44, screenBottom:960, trigger:1600}
  ],
  player: {x:430, y:616},
  enemy: [{x:1400, y:607, type:1, autoBitmap:true},
          {x:1900, y:307, type:1, autoBitmap:true}],
  bitmap: [{x1:130,y1:300,  x2:800,y2:640, type:DRAWING} /* players drawing area */
//           {x1:1299,y1:200, x2:1800,y2:640, type:ENEMY_DRAWING}, /* enemys drawing bitmap area */
//           {x1:900,y1:200,  x2:1300,y2:640, type:ENEMY_DRAWING}  /* 2nd enemys drawing bitmap */
          ]
},{
  level:3,
  tilemap: 'tilemap', tilelayer: 'Tile Layer 3',
  x:0,  y:-1536, x2:2048, y2:1024, /* world size */
  background: 'background',
  bgPercent : 0.15, bgOffset:{ x:1400, y:300 },
  scaleModes:[
    {scale:0.95, screenBottom:690, trigger:0},
    {scale:0.59, screenBottom:960, trigger:1000},
    {scale:0.49, screenBottom:960, trigger:1300},
    {scale:0.44, screenBottom:960, trigger:1950}
  ],
  player: {x:300, y:416},
  enemy: [{x:1200, y:707, type:1, autoBitmap:true},
          {x:1420, y:420, type:1, autoBitmap:true},
          {x:1600, y:107, type:1, autoBitmap:true}],
  bitmap: [{x1:130,y1:300,  x2:800,y2:640, type:DRAWING} /* players drawing area */
          ]
}];
