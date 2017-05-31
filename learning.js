/************************ LEARNING CLASS ********************************************/
/**************************************************************************************/
var START_GAME=1;
var FIND_DRAW_BUTTON=2;
var DRAW_A_HOUSE =3;
var OH_NO_SHOOTING =4;

var DRAW_BUTTON_PRESS =5;
var PENCIL_IMPRESSION =6;
var FIRE_BUTTON_PRESS =7;
var SHOOT_BACK =8;

var Learning = function ( myGame ) {
  this.stage = 0;
  this.draw_impression_count=0;
  this.learnedDrawButton=false;
  this.myGame = myGame;
  this.graphic = [];

};
Learning.prototype.update = function(  ) {
  if (this.stage==0 && count > 300) {
  }
  if (this.stage==DRAW_A_HOUSE) {
  }
//console.log(this.stage);

};
Learning.prototype.trigger = function( trigger ) {
  /* wait a tad at the start before showing instructions */
  if (trigger==START_GAME && level.level==1) {
    this.timer = game.time.events.add(Phaser.Timer.SECOND * 2, function(){
      this.timer=null;
      this.stage = FIND_DRAW_BUTTON;
      this.showGraphic( FIND_DRAW_BUTTON );
    }, this);
  }
  /* Draw button pressed.  remove the arrow */
  if (this.learnedDrawButton===false && trigger==DRAW_BUTTON_PRESS) {
    this.learnedDrawButton=true;
    if (this.timer) game.time.events.remove(this.timer);
    this.removeGraphic(this.stage);
    /* next */
    this.stage = DRAW_A_HOUSE;
    this.showGraphic( DRAW_A_HOUSE );
  }
  /* User is drawing their house */
  if (this.stage==DRAW_A_HOUSE && trigger==PENCIL_IMPRESSION) {
    this.draw_impression_count++;
    if (this.draw_impression_count >= 30) {
      this.removeGraphic(this.stage);
      this.stage = OH_NO_SHOOTING;
      /* Enemy fires a single shot */
      game.time.events.add(Phaser.Timer.SECOND * 4, function(){
        this.myGame.enemy.enemyFire( game.rnd.between(-40,-60), game.rnd.between(780, 875) );
      });
      /* wait for enemy shot to land */
      game.time.events.add(Phaser.Timer.SECOND * 6, function(){
        this.showGraphic( OH_NO_SHOOTING );
        this.timer = game.time.events.add(Phaser.Timer.SECOND * 3, function(){
          this.showGraphic( SHOOT_BACK );  this.timer=null;
        }, this);
        createFireButton(myGame);
        this.myGame.createJoystick();
        if (myGame.enemy) myGame.enemy.startEnemyLogic();

      }, this);
    }
  }
  if (this.stage==OH_NO_SHOOTING && trigger==FIRE_BUTTON_PRESS){
    this.removeGraphic(this.stage);

  }
};

Learning.prototype.showGraphic = function( stage ) {
  if (this.currentGraphic) { /* already in progress */
    this.queue = stage;
    this.removeGraphic(this.currentGraphic);
    return;
  }
  if (this.queue) { stage=this.queue; this.queue=null; }
  if (stage==FIND_DRAW_BUTTON) {
    if (!this.arrow) {
     this.arrow = game.add.sprite(140, game.height-230, 'arrow'); this.arrow.anchor.set(0.5,0.5);
     fadeIn( this.arrow );
    }
    game.add.tween(this.arrow).to({ x: 170 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    text = "Press the pencil to draw";
  }
  if (stage==DRAW_A_HOUSE) text = "Draw a house on a tank";
  if (stage==OH_NO_SHOOTING) text = "Oh no! We're being shot at";
  if (stage==SHOOT_BACK) text = "Don't stand for that, use your tanks cannon to fire back";

  this.text = game.add.text(150,40, text, {font:'12px Courier', fill:'#000000'});
  this.currentGraphic=stage;

};

Learning.prototype.removeGraphic = function( stage ) {
  if (this.arrow) fadeOut (this.arrow);
  if (this.text) fadeOut(this.text);
  game.time.events.add(400, function(){
    this.currentGraphic = null;
    if (this.queue) {
      this.showGraphic(this.queue);
    }
  }, this);
};



function fadeIn ( sprite ) {
  game.add.tween(sprite).from({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 00, 0, false); /* fade in */
}
function fadeOut ( sprite ) { /* and destroy */
  game.add.tween(sprite).to({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 00, 0, false) /* fade out */
                .onComplete.add(function(a){ a.destroy(); },this); /* then destroy the arrow */
}
