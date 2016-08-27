
var player;
var cursors;    /* keyboard inputs */
var firebutton; /* space bar */

/************ Gun *****************/
gun = {
  angle : 45,
  angleVelocity:0,
  power : 220,
  powerVelocity:0
}

/************ Player ********************************/

function createPlayer (th) {
  
    /******* Player ********************/
    player = game.add.sprite(300,550,'star'); //game.add.group();
    player.speed = 400;
    player.anchor.set(0.5, 0.5);
    //this.player.x=430; this.player.y=400;
    player.enableBody = true;
    player.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.allowGravity = false;
    
    //var playerGraphics = game.add.graphics();
    //playerGraphics.beginFill(0x00ffff);
    //playerGraphics.drawCircle(0, 0, 16);
    //this.player.add(playerGraphics);
    
    cursors = th.input.keyboard.createCursorKeys();
    fireButton = th.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    fireButton.onDown.add(fire, th);
    
    game.world.setBounds(level.x, level.y, level.x2, level.y2);
    
}


function updatePlayer( th ) {
    /************ Player ********************************/
    player.body.velocity.x=0;
    player.body.velocity.y=0;
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







