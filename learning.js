/************************ LEARNING CLASS ********************************************/
/**************************************************************************************/
var START_GAME=1;
var FIND_DRAW_BUTTON=2;
var DRAW_A_HOUSE =3;
var OH_NO_SHOOTING =4;

var DRAW_BUTTON_PRESS =5;
var PENCIL_IMPRESSION =6;

var Learning = function ( myGame ) {
  this.stage = 0;
  this.draw_impression_count=0;
  this.learnedDrawButton=false;
  this.myGame = myGame;
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
      /* draw arrow & text */
      if (!this.arrow) {
       this.arrow = game.add.sprite(140, game.height-230, 'arrow'); this.arrow.anchor.set(0.5,0.5);
       fadeIn( this.arrow );
       game.add.tween(this.arrow).to({ x: 170 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
       this.text = game.add.text(150,40, "Press the drawing button to Draw a House", {font:'12px Courier', fill:'#000000'});
      }
    }, this);
  }
  /* Draw button pressed.  remove the arrow */
  if (this.learnedDrawButton===false && trigger==DRAW_BUTTON_PRESS) {
    this.learnedDrawButton=true;
    this.stage = DRAW_A_HOUSE;
    if (this.arrow) fadeOut (this.arrow);
    if (this.timer) game.time.events.remove(this.timer);
    if (this.text) this.text.destroy();
  }
  /* User is drawing their house */
  if (this.stage==DRAW_A_HOUSE && trigger==PENCIL_IMPRESSION) {
    this.draw_impression_count++;
    if (this.draw_impression_count >= 30) {
      this.stage = OH_NO_SHOOTING;
      /* Enemy fires a single shot */
      game.time.events.add(Phaser.Timer.SECOND * 4, function(){
        this.myGame.enemy.enemyFire( game.rnd.between(-40,-60), game.rnd.between(780, 875) );
      });
      /* wait for enemy shot to land */
      game.time.events.add(Phaser.Timer.SECOND * 6, function(){
        this.myGame.createJoystick();
        createFireButton(myGame);
        if (myGame.enemy) myGame.enemy.startEnemyLogic();

      }, this);


    }
  }
  if (this.stage==OH_NO_SHOOTING){
  }
};

Learning.prototype.remove = function(  ) {

};

function fadeIn ( sprite ) {
  game.add.tween(sprite).from({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 300, 0, false); /* fade in */
}
function fadeOut ( sprite ) { /* and destroy */
  game.add.tween(sprite).to({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 100, 0, false) /* fade out */
                .onComplete.add(function(a){ a.destroy(); },this); /* then destroy the arrow */
}
