/************************ LEARNING CLASS ********************************************/
/**************************************************************************************/
var START_GAME=1;
var FIND_DRAW_BUTTON=2;
var DRAW_A_HOUSE =3;
var OH_NO_SHOOTING =4;
var SHOOT_BACK =5;
var FIND_JOYSTICK =6;
var FIND_JOYSTICK_POWER =7;

/* Triggers */
var DRAW_BUTTON_PRESS =21;
var PENCIL_IMPRESSION =22;
var FIRE_BUTTON_PRESS =23;
var JOYSTICK_MOVE =24;
var JOYSTICK_POWER_CHANGE =25;

var Learning = function ( myGame ) {
  this.stage = 0;
  this.draw_impression_count=0;
  this.learnedDrawButton =false;
  this.learnedJoystickMove =false;
  this.learnedJoystickPower =false;
  this.myGame = myGame;

};
Learning.prototype.firstRun = function() {
  if (this.stage==0) return true;  else return false;
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
//    this.stage=FIND_JOYSTICK;
//    this.myGame.createJoystick();
//    this.showGraphic( this.stage );
//  }
//  if(0){
    if (this.stage!=0) return; /* the levels restarting, leave our learning vars as they are */
    this.timerCB = game.time.events.add(Phaser.Timer.SECOND * 2, function(){
      this.timerCB=null;
      this.stage = FIND_DRAW_BUTTON;
      this.showGraphic( FIND_DRAW_BUTTON );
    }, this);
  }
  /* Draw button pressed.  remove the arrow */
  if (this.learnedDrawButton===false && trigger==DRAW_BUTTON_PRESS) {
    this.learnedDrawButton=true;
    if (this.timerCB) game.time.events.remove(this.timerCB);
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
        this.timerCB = game.time.events.add(Phaser.Timer.SECOND * 3, function(){
          this.showGraphic( SHOOT_BACK );  this.timerCB=null;
        }, this);
        createFireButton(myGame);
        this.myGame.createJoystick();
        this.myGame.joystick.alpha = 0.0; /* hide it for now */
        if (myGame.enemy) myGame.enemy.startEnemyLogic();

      }, this);
    }
  }
  if (this.stage==OH_NO_SHOOTING && trigger==FIRE_BUTTON_PRESS){
    this.removeGraphic(OH_NO_SHOOTING);
    if (this.timerCB) game.time.events.remove(this.timerCB);
    this.stage = FIND_JOYSTICK; /* next stage */
    game.time.events.add(Phaser.Timer.SECOND * 6, function(){  /* wait for user to pop a few shots off */
      if (!this.learnedJoystickMove) this.showGraphic( FIND_JOYSTICK );
      fadeIn( this.myGame.joystick );
    }, this);
  }
  if (this.learnedJoystickMove===false && trigger==JOYSTICK_MOVE)  this.learnedJoystickMove=true;
  if (this.stage==FIND_JOYSTICK && this.learnedJoystickMove){
    this.removeGraphic( FIND_JOYSTICK );
    this.stage = FIND_JOYSTICK_POWER;
    if (!this.learnedJoystickPower) this.showGraphic( FIND_JOYSTICK_POWER );
  }
  if (this.learnedJoystickPower===false && trigger==JOYSTICK_POWER_CHANGE)  this.learnedJoystickPower=true;
  if (this.stage==FIND_JOYSTICK_POWER && this.learnedJoystickPower){
    this.removeGraphic( FIND_JOYSTICK_POWER );
    this.stage = 100;
    /* are we done learning? */
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
     this.arrow = game.add.sprite(140, game.height-230, 'arrow2'); this.arrow.anchor.set(0.5,0.5);
     fadeIn( this.arrow );
     game.add.tween(this.arrow).to({ x: 170 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    }
  }
  if (stage==FIND_JOYSTICK) {
    if (!this.arrow) { /* Left arrow */
      this.arrow = game.add.sprite(-60, -110, 'arrow2'); this.arrow.scale.set(0.6);
      this.arrow.anchor.set(0.5, 0.5); this.arrow.angle= -30;
      this.myGame.joystick.barrel.add(this.arrow);
      fadeIn( this.arrow );
      game.add.tween(this.arrow).to({ x: -40 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    } if (!this.arrow2) {  /* right arrow */
      this.arrow2 = game.add.sprite(60, -110, 'arrow'); this.arrow2.scale.set(0.6);
      this.arrow2.anchor.set(0.5, 0.5); this.arrow2.angle= 180+30;
      this.myGame.joystick.barrel.add(this.arrow2);
      fadeIn( this.arrow2 );
      game.add.tween(this.arrow2).to({ x: 40 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    }
  } if (stage==FIND_JOYSTICK_POWER) {
    //  if (!this.arrow) { /* Up arrow */
        this.arrow = game.add.sprite(20, -110, 'arrow'); this.arrow.scale.set(0.6);
        this.arrow.anchor.set(0.5, 0.5); this.arrow.angle= 90+5;
        this.myGame.joystick.barrel.add(this.arrow);
        fadeIn( this.arrow );
        game.add.tween(this.arrow).to({ y: -90 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    //  } if (!this.arrow2) {  /* Down arrow */
        this.arrow2 = game.add.sprite(20, -20, 'arrow2'); this.arrow2.scale.set(0.6);
        this.arrow2.anchor.set(0.5, 0.5); this.arrow2.angle= -90-5;
        this.myGame.joystick.barrel.add(this.arrow2);
        fadeIn( this.arrow2 );
        game.add.tween(this.arrow2).to({ y: -40 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
    //  }
    }
  if (stage==FIND_DRAW_BUTTON) text = "Tap the pencil button to draw";
  if (stage==DRAW_A_HOUSE) text = '"Draw a house on your tank"';
  if (stage==OH_NO_SHOOTING) text = "Oh no! We're being shot at";
  if (stage==SHOOT_BACK) text = "Tap the Fire button to shoot your tanks cannon";
  if (stage==FIND_JOYSTICK) text = "Use this lever to angle your cannon";
  if (stage==FIND_JOYSTICK_POWER) text = "Shoot further by sliding the cannons power bar";

  this.text = game.add.text(200,200, text,
      {font:'bold 22px Courier', fill:'#FFF', boundsAlignH:'center', boundsAlignV:'middle' });
  this.text.setShadow(1, 1, 'rgba(0,0,0,1.0)', 2);
  this.text.setTextBounds(0,0, game.width,(game.height*0.66));
  this.myGame.screenFix.add(this.text, 0, 0, 1.0);
  this.currentGraphic=stage;

};
Learning.prototype.removeGraphic = function( stage ) {
  if (this.queue==stage) this.queue=null;
  if (this.arrow) fadeOut(this.arrow);  if (this.arrow2) fadeOut(this.arrow2);
  if (this.text) fadeOut(this.text);
  game.time.events.add(800, function(){
    this.currentGraphic = null;
    if (this.queue) {
      this.showGraphic(this.queue);
    }
  }, this);
};
Learning.prototype.finishOff = function() {
  this.queue=null;
  this.removeGraphic();
}

function fadeIn ( sprite ) {
  game.add.tween(sprite).from({alpha:0.0}, 300, Phaser.Easing.Linear.None , true, 00, 0, false); /* fade in */
}
function fadeOut ( sprite ) { /* and destroy */
  game.add.tween(sprite).to({alpha:0.0}, 300, Phaser.Easing.Linear.None , true, 00, 0, false) /* fade out */
                .onComplete.add(function(a){ a.destroy(); },this); /* then destroy the arrow */
}
