
//var player;
//var cursors;    /* keyboard inputs */
var firebutton; /* space bar */

var enemy;




/************************ PLAYER CLASS ********************************************/
/**************************************************************************************/


var Player = function(x,y) {
//function createPlayer (th) {
    /******* Player ********************/
    //Phaser.Sprite.call(this, game, x, y, 'tank2_right'); /* create a Sprite, the parent Class */

    Phaser.Group.call(this, game); /* create a Group, the parent Class */

    //this.x=x; this.y=y;
    this.tank = game.add.sprite(x,y,'tank2_right');  
    this.tank.anchor.set(0.5, 0.5);
    this.tank.speed = 400;
    this.add( this.tank );
    
    
    this.tank.enableBody = true;
    this.tank.physicsBodyType = Phaser.Physics.ARCADE;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.allowGravity = false;
    this.tank.body.drag = {x:10000,y:10000};
    this.tank.body.setSize(54,40, 10,5);
    
    this.tank.scale.set(0.5);
    
    /************ Gun *****************/
    this.gun = {
      angle : 60,
      angleVelocity:0,
      power : 210,
      powerVelocity:0
    }
     
}
inheritPrototype(Player, Phaser.Group);

function setupEnemy(th){
    
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
    
    
    
}

//function updatePlayer( th ) {
//}



/**************** Enemy Tank **********************/

function startEnemyLogic() {
  enemyLogicTimeout=setTimeout(enemyLogic, 5000);
  setTimeout(function(){enemyDrawRandomDefence(); enemyDrawRandomDefence();
    enemyDrawRandomDefence(); enemyDrawRandomDefence();}, 2000);
}

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





if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {
        }
        F.prototype = o;
        return new F();
    };
}
function inheritPrototype(childObject, parentObject) {
    var copyOfParent = Object.create(parentObject.prototype);
    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
}