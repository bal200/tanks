
var player;
var cursors;    /* keyboard inputs */
var firebutton; /* space bar */

var enemy;


/************ Gun *****************/
gun = {
  angle : 60,
  angleVelocity:0,
  power : 210,
  powerVelocity:0
}

/************ Player ********************************/

function createPlayer (th) {
  
    /******* Player ********************/
    player = game.add.sprite(430,616,'tank2_right'); //game.add.group();
    player.speed = 400;
    player.anchor.set(0.5, 0.5);
    //this.player.x=430; this.player.y=400;
    player.enableBody = true;
    player.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.allowGravity = false;
    player.body.drag = {x:10000,y:10000};
    player.body.setSize(54,40, 10,5);
    
    player.scale.set(0.5);
     
    //var playerGraphics = game.add.graphics();
    //playerGraphics.beginFill(0x00ffff);
    //playerGraphics.drawCircle(0, 0, 16);
    //this.player.add(playerGraphics);
    
    /******* Enemy Tank ********************/
    enemy = game.add.sprite(1400,607,'tank_left'); //game.add.group();
    enemy.speed = 400;
    enemy.anchor.set(0.5, 0.5);
    //this.player.x=430; this.player.y=400;
    enemy.enableBody = true;
    enemy.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(enemy, Phaser.Physics.ARCADE);
    enemy.body.allowGravity = false;
    enemy.body.drag = {x:10000,y:10000};
    enemy.body.setSize(48,62, 16,5);
    
    enemyLogicTimeout=setTimeout(enemyLogic, 5000);
    setTimeout(function(){enemyDrawRandomDefence(); enemyDrawRandomDefence();
      enemyDrawRandomDefence(); enemyDrawRandomDefence();}, 2000);
    
    /******* Keys *****************/
    cursors = th.input.keyboard.createCursorKeys();
    fireButton = th.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    fireButton.onDown.add(fire, th);
    
    game.world.setBounds(level.x, level.y, level.x2-level.x, level.y2-level.y);
    
}


function updatePlayer( th ) {
  
    game.physics.arcade.collide(enemy, bullets, tankToBulletsHandler, null, this);
    game.physics.arcade.collide(player, bullets, tankToBulletsHandler, null, this);

    /************ Player ********************************/
    //player.body.velocity.x=0;
    //player.body.velocity.y=0;
    //enemy.body.velocity.x=0;
    //enemy.body.velocity.y=0;
    if (cursors.left.isDown) {
        player.body.velocity.x = -player.speed; }
    else if (cursors.right.isDown) {
        player.body.velocity.x = player.speed; }
    if (cursors.up.isDown) {
        player.body.velocity.y = -player.speed; }
    else if (cursors.down.isDown) {
        player.body.velocity.y = player.speed; }
    // zoom
    if (game.input.keyboard.isDown(Phaser.Keyboard.Q)) {
        worldScale += 0.01; }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.A)) {
        worldScale -= 0.01;
    }
    
    
}


/**************** Enemy Tank **********************/

function enemyLogic() {
  var what = game.rnd.between(0, 4);
  switch (what) {
    case 1: /* shoot a front shot*/
      enemyFire( game.rnd.between(-40,-60), game.rnd.between(400, 475) );
      break;
    case 2: /* shoot a back shot */
      enemyFire( game.rnd.between(-20, -30), game.rnd.between(520, 540) );
      break; 
    case 3: /* shoot a flurry */
      var a=game.rnd.between(-20, -30), b=game.rnd.between(520, 550);
      enemyFire( a, b );
      setTimeout( function(){enemyFire(game.rnd.between(a+1, a+1),game.rnd.between(b-1,b+1))},150);
      setTimeout( function(){enemyFire(game.rnd.between(a+1, a+1),game.rnd.between(b-1,b+1))},300);
      break;
    case 4: /* Build defence */
      enemyDrawRandomDefence();
      break;
    default: 
      break;
  }
  /* call this func again in a random time */
  enemyLogicTimeout=setTimeout(enemyLogic, game.rnd.between(100, 3000));
}

function enemyFire(angle, power) {
    var bullet = bullets.getFirstExists(false);
    if (bullet) {
      var vec = new Phaser.Point(0,-1);
      vec = vec.rotate(0,0, angle, true);
      
      bullet.reset(enemy.x + (vec.x*50), enemy.y + (vec.y*50));
      bullet.body.velocity.x = vec.x * power;
      bullet.body.velocity.y = vec.y * power; 
      bullet.whos=2;/* Enemy fired it */
    }
}

function enemyDrawRandomDefence() {
  var x1 = game.rnd.between(1200, 1500);
  var y1 = game.rnd.between(350, 540);
  var x2 = x1 - 200;
  var y2 = y1 + 70;
  
  bitmap.line(x1,y1, x2,y2, '#827a6a',  10); /* grey */
  bitmap.update();
  bitmap.dirty = true;

}


