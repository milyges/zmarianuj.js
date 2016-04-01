/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE":
 * Grzegorz <milyges> Gliński <milyges@gmail.com> wrote this file. 
 * As long as you retain this notice you can do whatever you want with this stuff. 
 * If we meet some day, and you think this stuff is worth it, 
 * you can buy me a beer in return.
 * ----------------------------------------------------------------------------
 * 
*/

var marioObjects = new Array;
var score = 0;
var scoreText = null;
var coins = 0;
var coinText = null;

function playAudio(name) {
	var audio = new Audio('sfx/' + name);
	audio.play();
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/;";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function createMarioObject() {
	var obj = $("<div/>");	
	var idx = Math.floor((Math.random() * marioObjects.length));
	
	var second = false;
	
	while(marioObjects[idx] != null) {
		idx++;
		if (idx >= marioObjects.length) {
			if (second) {
				console.log('Cant createMarioObject!');
				return null;
			}
			else {
				second = true;
			}
			idx = 0;
		}
	}
	
	marioObjects[idx] = obj;
	obj.css({
		top: (idx + 1) * 80,
		left: 0,
		position: 'absolute'
	});
	obj.appendTo('body');
	return obj;
}

function removeMarioObject(obj) {	
	p = $(obj).position();
	$(obj).unbind();
	idx = (Math.round(p.top) / 80) - 1;
	marioObjects[idx] = null;
}

function loopMarioObject(obj, moveRight, timeout, leftClass, rightClass) {
	p = $(obj).position();
	
	if (p.left >= $(window).width() - 80) {
		moveRight = false;
		$(obj).removeClass(rightClass);
		$(obj).addClass(leftClass);
	}
	else if (p.left <= 40) {
		moveRight = true;
		$(obj).removeClass(leftClass);
		$(obj).addClass(rightClass);
	}
	
	if (moveRight) {
		var move = "+=40px";
	}
	else {
		var move = "-=40px";
	}
	
	$(obj).animate({left: move }, timeout, "linear", function() { loopMarioObject(this, moveRight, timeout, leftClass, rightClass) });
}


function goombaKill(obj) {	
	$(obj).stop();
	score += 200;
	updateScoreboard();
	$(obj).removeClass("goomba");
	$(obj).addClass("goomba-dead");
	$(obj).unbind('click');
	playAudio('stomp.wav');
	setTimeout(function() {
		$(obj).fadeTo(500, 0, function() {
			removeMarioObject(obj);
		});
		setTimeout(goombaCreate, 10000); // respawn
	}, 1500);
}

function goombaCreate() {
	var goomba = createMarioObject();
	goomba.click(function() {
		goombaKill(this);
	});
	loopMarioObject(goomba, true, 400, 'goomba', 'goomba');
}

function koopaKill(obj) {
	$(obj).stop();
	score += 200;
	updateScoreboard();
	playAudio('kick.wav');
	$(obj).removeClass("koopa-left");
	$(obj).removeClass("koopa-right");
	$(obj).addClass("koopa-dead");
	loopMarioObject(obj, true, 150, 'koopa-dead', 'koopa-dead');
}

function koopaCreate() {
 	var koopa = createMarioObject();
	koopa.click(function() {
		koopaKill(this);
	});
	loopMarioObject(koopa, true, 400, 'koopa-left', 'koopa-right');
}

function questionMarkCreate() {
	var q = createMarioObject();
	$(q).addClass('questionmark');
	$(q).css({
		top: q.top,
		left: Math.floor(Math.random() * ($(window).width() - 50))
	});
	
	$(q).click(function() {
		$(q).unbind('click');
		score += 100;
		coins ++;
		updateScoreboard();
		playAudio('coin.wav');
		$(q).removeClass('questionmark');
		$(q).addClass('questionmark-empty');
		setTimeout(function() {
			$(q).fadeTo(500, 0, function() {
				removeMarioObject(q);
			});
		}, 5000);
	});
}

function coinsCreate() {
	var container = createMarioObject();
	count = Math.ceil(Math.random() * 5);
	container.css({
		top: container.top,
		left: Math.floor(Math.random() * ($(window).width() - 40 * count))
	});
	
	for(j = 0; j < count; j++) {
		c = $('<div/>')
		c.addClass('coin');
		c.appendTo($(container));
		c.mouseover(function() {
			playAudio('coin.wav');
			coins++;
			score += 100;
			updateScoreboard();
			/* To trzeba poprawić */
			$(this).unbind();
			$(this).removeClass('coin');
			$(this).addClass('coin-spacer');
		});
	}
}

function updateScoreboard() {
	if (coins >= 100) {
		playAudio('1-up.wav');
		coins = 0;
	}
	
	$(scoreText).html(padDigits(score, 8));
	$(coinText).html(padDigits(coins, 2));
	
	/* Zapisz wynik w ciacho ważne rok */
	createCookie("score", score, 365);
	createCookie("coins", coins, 365);
}

/* Ziomal na chmumrze ma specjalne traktowanie zeby latał "płynniej" */
function loopCloudGuy(obj, moveRight) {
	p = $(obj).position();
	
	if (p.left >= $(window).width() - 80) {
		moveRight = false;
	}
	else if (p.left <= 40) {
		moveRight = true;
	}
	
	if (moveRight) {
		var move = $(window).width() - 40;
	}
	else {
		var move = 0;
	}
	
	$(obj).animate({left: move }, $(window).width() * 10 , "swing", function() { loopCloudGuy(obj, moveRight) });
}

function createCloudGuy() {
	var obj = $("<div/>");
	marioObjects[0] = obj;
	
	obj.css({
		top: 90,
		left: 0,
		position: 'absolute'
	});
	obj.appendTo('body');
	obj.addClass('cloudguy');
	loopCloudGuy(obj, true);
}

$(window).load(function(){	
	scoreboard = $('<div/>');
	$(scoreboard).appendTo('body');
	$(scoreboard).addClass('scoreboard');
	$(scoreboard).html('MARIO<br />');
	scoreText = $('<span/>');
	scoreText.appendTo($(scoreboard));
	$('<span/>').html('<img src="gfx/coin-ani3.gif" />x').css({'margin-left': '40px'}).appendTo($(scoreboard));
	coinText = $('<span/>');
	coinText.appendTo($(scoreboard));
	
	/* Ładujemy wyniki z ciacha!!! */
	score = parseInt(readCookie('score'));
	coins = parseInt(readCookie('coins'));
	
	if (!score) {
		score = 0;
	}
	
	if (!coins) {
		coins = 0;
	}
	updateScoreboard();
	
	items = Math.round($('body').height() / 80) - 1;
	
	for(i = 0; i < items; i++) {
		marioObjects.push(null);
	}
        
	/* jeden latajacy ziomal na górze */
	createCloudGuy();
	
	/* Wszystko od 1 - 6 losowo */
	var goombaCount = Math.ceil(Math.random() * 5);
	var koopaCount = Math.ceil(Math.random() * 5);
	var questionCount = Math.ceil(Math.random() * 5);
	var coinsCount = Math.ceil(Math.random() * 5) + 1;
	
	for(i = 0; i < coinsCount; i++) {
		coinsCreate();
	}
	
	for(i = 0; i < questionCount; i++) {
		questionMarkCreate();
	}
	
	for(i = 0; i < goombaCount; i++) {
		setTimeout(goombaCreate, Math.floor(Math.random() * 5000));
	}
	
	for(i = 0; i < koopaCount; i++) {
		setTimeout(koopaCreate, Math.floor(Math.random() * 5000));
	}
});
