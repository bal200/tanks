

var Fire = function( land, group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  group.add( this );
  this.land = land;

  /* The flame sprites */
  this.createMultiple(10, 'fire');
  this.forEach(function(fire) {
    fire.anchor.set(0.5, 1.0);
    fire.animations.add('flicker', /*frames*/null, /*fps*/20, /*loop*/true);
  });

  /* a collection of sprites to tween for a Smoke effect */
  this.smokes = game.add.group();
  this.smokes.createMultiple(20, 'smoke');
  group.add( this.smokes );
  this.smokes.forEach(function(smoke) {
    smoke.anchor.set(0.5, 0.5);
    //smoke.animations.add('fire');
  });



};
inheritPrototype(Fire, Phaser.Group);


/* Create a new fire */
Fire.prototype.setFire = function(x,y) {

  var fire = this.getFirstExists(false);
  if (fire) {
    fire.reset(x,y);
    fire.play('flicker');

    this.smokePuff(x,y);
    this.timerCB = game.time.events.add(Phaser.Timer.SECOND * 0.8, function(){
      this.smokePuff(x,y);
    }, this);
    this.timerCB = game.time.events.add(Phaser.Timer.SECOND * 1.6, function(){
      this.smokePuff(x,y);
    }, this);
    this.timerCB = game.time.events.add(Phaser.Timer.SECOND * 2.5, function(){
      this.smokePuff(x,y);
    }, this);
  }

};

Fire.prototype.smokePuff = function(x,y) {

  var smoke = this.smokes.getFirstExists(false);
  if (smoke) {
    smoke.reset(x,y-140);
    smoke.frame = Math.floor(game.rnd.between(1, 6));
    game.add.tween(smoke).to({y: y-500, alpha: 0.0}, /*duration*/2500,
                  Phaser.Easing.Linear.None , /*autostart*/false, /*delay*/0, /*repeat*/0, /*yoyo*/false)
                  .loop()
                  .start();
    game.add.tween(smoke.scale).to({x:2.2,y:2.2}, /*duration*/2500,
                  Phaser.Easing.Linear.None , /*autostart*/false, /*delay*/0, /*repeat*/0, /*yoyo*/false)
                  .loop()
                  .start();
  }

};
