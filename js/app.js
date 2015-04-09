
$(document).keyup(keyUpFunc);
var is_init = true;


function keyUpFunc(e) {
    if (e.keyCode == 13) {
        if(is_init) {
            init();

        }
        else {
            restart();
        }
    }
}

function init() {
    is_init = false;
    game.isplaying = true;
    game.init();
    game.start();
    $(".scoreboard").show();
    $("#start").fadeOut(200);

}

function restart(){
    if(!game.isplaying)
    {
        game.isplaying = true;
        game.restart();
    }

}

$( "#start .button" ).click(function() {
    init();
});
$( "#game-over .button" ).click(function() {
    restart();
});



//按鍵控制碼
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

//按鍵狀態
KEY_STATUS = {};
for (code in KEY_CODES) {
  KEY_STATUS[KEY_CODES[code]] = false;
}

//監聽按鍵按下狀態
document.onkeydown = function(e) {
  // Firefox and opera use charCode instead of keyCode to
  // return which key was pressed.
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
  }
}
//監聽按鍵放開狀態
document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}


//刷新畫面
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback,  element){
				window.setTimeout(callback, 1000 / 60);
			};
})();
