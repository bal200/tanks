/************************ LEARNING CLASS ********************************************/
/**************************************************************************************/
var FIND_DRAW_BUTTON=1;
var DRAW_A_HOUSE =2;
var OH_NO_SHOOTING =3;

var DRAW_BUTTON_PRESS =4;
var PENCIL_IMPRESSION =5;

var Learning = function () {
  this.stage = 0;
  this.draw_impression_count=0;
};
Learning.prototype.update = function(  ) {
  if (this.stage==0 && count > 300)
    this.stage = FIND_DRAW_BUTTON;
  if (this.stage==FIND_DRAW_BUTTON) {
    /* draw arrow & text */
    if (!this.arrow) {
      this.arrow = game.add.sprite(140, game.height-230, 'arrow');
      this.arrow.anchor.set(0.5,0.5);
      game.add.tween(this.arrow).from({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 300, 0, false); /* fade in */
      game.add.tween(this.arrow).to({ x: 170 }, 600, Phaser.Easing.Quadratic.InOut, true, 0, 1000, true); /* wave back & forth */
      this.text = game.add.text(150,40, "Press the drawing button to Draw a House", {font:'12px Courier', fill:'#000000'});
    }

  }
  if (this.stage==DRAW_A_HOUSE) {

  }
//console.log(this.stage);

};
Learning.prototype.trigger = function( trigger ) {

  if (this.stage==FIND_DRAW_BUTTON && trigger==DRAW_BUTTON_PRESS) {
    this.stage = DRAW_A_HOUSE;
    /* remove arrow graphic */
    game.add.tween(this.arrow).to({alpha:0.0}, 200, Phaser.Easing.Linear.None , true, 300, 0, false) /* fade out */
                    .onComplete.add(function(a){ a.destroy(); },this); /* then destroy the arrow */
    /* change text */
    this.text.destroy();
  }
  if (this.stage==DRAW_A_HOUSE && trigger==PENCIL_IMPRESSION) {
    this.draw_impression_count++;
    if (this.draw_impression_count >= 20) {
      this.stage = OH_NO_SHOOTING;
    }
  }

};

Learning.prototype.remove = function(  ) {

};
