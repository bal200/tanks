/************************ LEARNING CLASS ********************************************/
/**************************************************************************************/
var Learning = function () {
  this.item = [];
}
Learning.prototype.update = function() {
  for (var n=0; n<this.item.length; n++) {
    var itm = this.item[n];
    var x=itm.screenFix.x, y=itm.screenFix.y;
    if (x < 0) x = game.width + itm.screenFix.x;
    if (y < 0) y = game.height + itm.screenFix.y;
    var p = screenToWorld( { x: x, y: y } );
    itm.x = p.x;  itm.y = p.y;
    itm.scale.set(screenToWorldScale(itm.screenFix.scale));
  }
}
Learning.prototype.add = function( itm, x,y,scale ) {
  itm.screenFix = { x: x, y: y, scale: scale };
  this.item.push( itm );
  
}

Learning.prototype.remove = function( itm ) {
  for (var n=0; n<this.item.length; n++) {
    if (this.item[n] === itm) {
      this.item.splice(n, 1);
      return;
    }
  }
}
