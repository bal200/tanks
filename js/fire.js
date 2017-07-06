
/* Fires Controller class
 * A phaser group with 10 fire sprites, and a group of smoke puffs shared by the fires
 */
var Fire = function( land, group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */
  this.land = land;

  /* a collection of sprites to tween for a Smoke effect */
  this.smokes = game.add.group();
  this.smokes.createMultiple(30, 'smoke');
  group.add( this.smokes );
  this.smokes.forEach(function(smoke) {
    smoke.anchor.set(0.5, 0.5);
    //smoke.animations.add('fire');
  });

  /* The flame sprites */
  this.createMultiple(10, 'fire');
  this.forEach(function(fire) {
    fire.anchor.set(0.5, 1.0);
    fire.animations.add('flicker', /*frames*/null, /*fps*/20, /*loop*/true);
    fire.firesController = this;
  });
  group.add( this );
};
inheritPrototype(Fire, Phaser.Group);



/* Create a new fire */
/* Fire sizes range from 0.6 to 0.2.  10=large 1.0x scale.  1=small, 0.1x scale */
Fire.prototype.setFire = function(x,y, size) {
  var fire = this.getFirstExists(false);
  if (fire) {
    fire.reset(x,y);
    fire.play('flicker');
    fire.mySize = size;
    fire.scale.set(size);
    //this.smokePuff(x,y, 1);
    fire.smokeTimer = game.time.events.repeat(Phaser.Timer.SECOND * 0.8, 50, function(fire){
      this.smokePuff(fire.x,fire.y, fire.scale.x);
      game.add.tween(fire.scale).to({x: fire.scale.x*0.95, y: fire.scale.y*0.95}, /*duration*/200,
                    Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
      if(fire.scale.x < 0.20) { /* too small, lets fizzle out */
        game.time.events.remove(fire.smokeTimer);
        fire.kill();
      }
    }, this, fire);

  }
  myGame.explosions.explode(x,y, /*scale*/2.1);

};

Fire.prototype.smokePuff = function(x,y, size) {
  var smoke = this.smokes.getFirstExists(false);
  if (smoke) {
    smoke.reset(x,y -(size * 120));
    smoke.scale.set(size /*0.40*/);
    smoke.alpha=1.0;
    smoke.frame = Math.floor(game.rnd.between(1, 6));
    /* Tween the smoke upwards and fade out */
    game.add.tween(smoke).to({y: y-400, alpha: 0.0}, /*duration*/5000,
                  Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false)
                  .onComplete.add(function(smoke, tween){
                    smoke.kill();
                  });
    /* Tween the smoke to get slowly bigger */
    game.add.tween(smoke.scale).to({x:2.2,y:2.2}, /*duration*/5000,
                  Phaser.Easing.Linear.None , /*autostart*/true, /*delay*/0, /*repeat*/0, /*yoyo*/false);
  }
};


/******************** Explosions group ****************************************/
/******************************************************************************/
var Explosions = function ( group ) {
  Phaser.Group.call(this, game); /* create a Group, the parent Class */

  /******* Explosions group ********/
  //this.z = 45;
  this.createMultiple(10, 'bigboom'/*sprite sheet*/);
  group.add( this );
  this.forEach(function(exp) {
    exp.anchor.set(0.5, 0.5);
    exp.animations.add('bigboom');
  });

};
inheritPrototype(Explosions, Phaser.Group);

/* create a big explosion graphic */
Explosions.prototype.explode = function ( x,y, size ) {
  if (exp=this.getFirstExists(false)) {
    exp.reset(Math.floor(x), Math.floor(y));
    exp.anchor.set(0.5,0.5);
    exp.scale.set(size /*0.40*/);
    exp.play('bigboom', /*framerate*/40, /*loop*/false, /*killoncomplete*/true);
    //audio1.play('boom'); /* boom noise */
  }
  myGame.fire.smokePuff(x,y, size);

  /* Some sparks? */

};
