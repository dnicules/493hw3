/* ------------------- EECS 493 Assignment 3 Starter Code ------------------ */

/* ------------------------ GLOBAL HELPER VARAIBLES ------------------------ */
// Difficulty Helpers
let astProjectileSpeed = 3;            // easy: 1, norm: 3, hard: 5

// Game Object Helpers
let currentAsteroid = 1;
const AST_OBJECT_REFRESH_RATE = 15;
const maxPersonPosX = 1218;
const maxPersonPosY = 658;
const PERSON_SPEED = 5;                // #pixels each time player moves by
const portalOccurrence = 6000;         // portal spawns every 6 seconds
const portalGone = 3000;               // portal disappears in 3 seconds
const shieldOccurrence = 9000;         // shield spawns every 9 seconds
const shieldGone = 3000;               // shield disappears in 3 seconds

// Movement Helpers
let LEFT = false;
let RIGHT = false;
let UP = false;
let DOWN = false;

let selectedDiff = 'Normal';
let vol = 50;
let level = 1;
let danger = 20;
let score = 0;

let pause = false;

let intervalAst = null;
let intervalPlayer = null;
let astInterval = 800;

let speedmult = 1.5;
let shielded = false;

let playerX = 615;
let playerY = 335;
let playerspeed = 10;
// TODO: ADD YOUR GLOBAL HELPER VARIABLES (IF NEEDED)
let origdanger = 20;
let origastspeed = 3;
let gamestarted = false;
/* --------------------------------- MAIN ---------------------------------- */
$(document).ready(function () {
  // jQuery selectors
  game_window = $('.game-window');
  game_screen = $("#actual-game");
  asteroid_section = $('.asteroidSection');


  // hide all other pages initially except landing page
  //game_screen.hide(); // Comment me out when testing the spawn() effect below

  /* -------------------- ASSIGNMENT 2 SELECTORS BEGIN -------------------- */
  // ====== Startup ======
  // TODO: DEFINE YOUR JQUERY SELECTORS HERE
  // console.log('jQuery works hehe');
  $('#actual-game').addClass('game');
  $('.settings').addClass('hidden');
  $('#settings').click(function () {
    $('.settings').removeClass('hidden');
  });
  $('#close-settings').click(function () {
    $('.settings').addClass('hidden');
  });

  $('tutorial-window').addClass('hidden');
  $('#play').click(function () {
    $('.tutorial-window').removeClass('hidden');
  });


  $('#startbutton').click(preStart);



  //let selectedVol = 50;

  const diffButtons = $('.diff-buttons button');
  diffButtons.each(function () { // Logic to highlight selected button
    if ($(this).text() == selectedDiff) {
      $(this).addClass('selected');
    }
  });

  diffButtons.on('click', function () { // Update selected diff
    diffButtons.removeClass('selected');
    $(this).addClass('selected');
    selectedDiff = $(this).text();
    let sel = $(this).text();
    if (sel == 'Easy') {
      danger = 10;
      astInterval = 1000;
      speedmult = 1;
      astProjectileSpeed = 1;
    } else if (sel == 'Normal') {
      danger = 20;
      origastspeed = astProjectileSpeed;
    } else {
      danger = 30;
      interval = 600;
      astProjectileSpeed = 5;
    }
    origastspeed = astProjectileSpeed;
    origdanger = danger;
    //console.log('clicked');
  });

  const volSlider = $('.vol-slider');
  const volVal = $('.vol-val');
  volVal.text(50); // init slider

  volSlider.on('input', function () {
    volVal.text($(this).val()); // update text to slider value
    vol = $(this).val();
  });

  $("#resume").click(pauseUnpause);
  $("#exit").click(exitGame);
  $("#restart").click(restartGame); 



  /* --------------------- ASSIGNMENT 2 SELECTORS END --------------------- */

  // TODO: DEFINE YOUR JQUERY SELECTORS (FOR ASSIGNMENT 3) HERE

  // Example: Spawn an asteroid that travels from one border to another
  // spawn(); // Uncomment me to test out the effect!
});


/* ---------------------------- EVENT HANDLERS ----------------------------- */
// Keydown event handler
document.onkeydown = function (e) {
  if (e.key == 'ArrowLeft') LEFT = true;
  if (e.key == 'ArrowRight') RIGHT = true;
  if (e.key == 'ArrowUp') UP = true;
  if (e.key == 'ArrowDown') DOWN = true;
  if (e.key == 'Escape' && gamestarted) { pauseUnpause(); }
}

// Keyup event handler
document.onkeyup = function (e) {
  if (e.key == 'ArrowLeft') LEFT = false;
  if (e.key == 'ArrowRight') RIGHT = false;
  if (e.key == 'ArrowUp') UP = false;
  if (e.key == 'ArrowDown') DOWN = false;
}

/* ------------------ ASSIGNMENT 2 EVENT HANDLERS BEGIN ------------------ */

/* ------------------- ASSIGNMENT 2 EVENT HANDLERS END ------------------- */

// TODO: ADD MORE FUNCTIONS OR EVENT HANDLERS (FOR ASSIGNMENT 3) HERE
function preStart(){
  
  if(intervalPlayer){clearInterval(intervalPlayer);}
  if(intervalAst){clearInterval(intervalAst);}
  if(intervalPortal){clearInterval(intervalPortal);}
  if(intervalShield){clearInterval(intervalShield);}
  console.log('started');
  console.log(danger);
  game_screen.removeClass('hidden');
  $('.getready').removeClass('hidden');
  $('#scoreboard').removeClass('hidden');
  $('#score').text(score);
  $('#danger').text(danger);
  $('#level').text(level);
  setTimeout(function () {
    $('.getready').addClass('hidden');
    $('.asteroidSection').removeClass('hidden');
    startGame();
  }, 3000)
}

function startGame() {
  gamestarted = true;
  playerspeed = 10;
  danger = origdanger;
  level = 1;
  astProjectileSpeed = origastspeed;
  playerX = 615;
  playerY = 335;
  $(".curAsteroid").each(function () {
    $(this).remove();
  });
  spawnAsteroids();
}
let intervalScore = null;
let intervalShield = null;
let intervalPortal = null;

function spawnAsteroids() {

  intervalAst = setInterval(spawn, astInterval);
  intervalPlayer = setInterval(updatePlayer, 10);
  intervalScore = setInterval(function () {
    score += 40;
    $("#score").text(score);
  }, 500)
  intervalPortal = setInterval(spawnPortal, 6000);
  intervalShield = setInterval(spawnShield, 9000);

}

//let playerDir = "neutral";

function updatePlayer() {
  checkCollisions();
  let playerDir = "neutral";
  if (LEFT && playerX > 0) {
    playerX -= playerspeed;
    playerDir = "left";
  }
  if (RIGHT && playerX < maxPersonPosX) {
    playerX += playerspeed;
    playerDir = "right";
  }
  if (UP && playerY > 0) {
    playerY -= playerspeed;
    playerDir = "up";
  }
  if (DOWN && playerY < maxPersonPosY) {
    playerY += playerspeed;
    playerDir = "down";
  }
  $("#player").css({
    top: playerY + "px",
    left: playerX + "px",
  });

  switch (playerDir) {
    case "neutral":
      if (!shielded) {
        $('#player').attr("src", "src/player/player.gif");
      } else {
        $('#player').attr("src", "src/player/player_shielded.gif");
      }
      break;
    case "right":
      if (!shielded) {
        $('#player').attr("src", "src/player/player_right.gif");
      } else {
        $('#player').attr("src", "src/player/player_shielded_right.gif");
      }
      break;
    case "left":
      if (!shielded) {
        $('#player').attr("src", "src/player/player_left.gif");
      } else {
        $('#player').attr("src", "src/player/player_shielded_left.gif");
      }
      break;
    case "down":
      if (!shielded) {
        $('#player').attr("src", "src/player/player_down.gif");
      } else {
        $('#player').attr("src", "src/player/player_shielded_down.gif");
      }
      break;
    case "up":
      if (!shielded) {
        $('#player').attr("src", "src/player/player_up.gif");
      } else {
        $('#player').attr("src", "src/player/player_shielded_up.gif");
      }
      break;
  }


}

function checkCollisions() {
  let player = $("#player");
  $(".curAsteroid").each(function () {
    if (isColliding($(this), player)) {
      if (shielded) {
        shielded = false;
        $("#player").attr("src", "src/player/player.gif");
        console.log("touched shielded");
      } else {
        $("#player").attr("src", "src/player/player_touched.gif");
        const sound = new Audio("src/audio/die.mp3");
        sound.volume = (vol / 100);
        sound.play();
        console.log("touched unshielded");
        clearInterval(intervalScore);
        endGame();

      }
      $(this).remove();
    }
  });

  $(".shield").each(function () {
    if (isColliding($(this), player)) {
      shielded = true;
      $(this).remove();
      $("#player").attr("src", "src/player/player_shielded.gif");
      const sound = new Audio("src/audio/collect.mp3");
      sound.volume = (vol / 100);
      sound.play();
      console.log("got shield");
      $(this).remove();
    }
  });

  $(".portal").each(function () {
    if (isColliding($(this), player)) {
      level += 1;
      $("#level").text(level);
      astProjectileSpeed *= speedmult;
      danger += 2;
      $("#danger").text(danger);
      const sound = new Audio("src/audio/collect.mp3");
      sound.volume = (vol / 100);
      sound.play();
      console.log("level up");
      $(this).remove();
    }
  });

}

function endGame() {
  $("#play").text("Play game!");
  gamestarted = false;
  astProjectileSpeed = 0;
  playerspeed = 0;
  setTimeout(function () {
    $("#gameover").removeClass("hidden");
    $(".asteroidSection").addClass("hidden");
    clearInterval(astInterval);
    clearInterval(intervalPlayer);
    clearInterval(intervalPortal);
    clearInterval(intervalShield);

    game_screen.addClass("hidden");
    console.log("ended");
    $(".tutorial-window").addClass("hidden");
    $("#finalscore").text(score);
    danger = origdanger;
    level = 1;
    score = 0;
    $("#startover").click(function () {
      $("#gameover").addClass("hidden");
    });
    if (intervalAst) { clearInterval(intervalAst); }
    if (intervalPlayer) { clearInterval(intervalPlayer); }
    if (intervalScore) { clearInterval(intervalScore); }
    if (intervalPortal) { clearInterval(intervalPortal); }
    if (intervalShield) { clearInterval(intervalShield); }

  }, 2000)
}
function spawnShield() {
  let shield = $("<img src='src/shield.gif' class='shield'/>");
  asteroid_section.append(shield);
  let xpos = getRandomNumber(75, maxPersonPosX - 75);
  let ypos = getRandomNumber(75, maxPersonPosY - 75);
  shield.css({
    position: "absolute",
    top: ypos + "px",
    left: xpos + "px",
    zIndex: 10,
    width: 75 + "px",
    height: 75 + "px"
  });
  setTimeout(function () {
    shield.remove();
  }, 3000);
}
function spawnPortal() {
  let portal = $("<img src='src/port.gif' class='portal'/>");
  asteroid_section.append(portal);
  let xpos = getRandomNumber(75, maxPersonPosX - 75);
  let ypos = getRandomNumber(75, maxPersonPosY - 75);
  portal.css({
    position: "absolute",
    top: ypos + "px",
    left: xpos + "px",
    zIndex: 10,
    width: 75 + "px",
    height: 75 + "px"
  });
  setTimeout(function () {
    portal.remove();
  }, 3000);
}
let tmpAstSpeed = null;
let tmpPlayerSpeed = null;
function pauseUnpause() {
  pause = !pause;

  if (pause) {
    $("#pause").removeClass("hidden");
    $("#greyout").removeClass("hidden");
    tmpAstSpeed = astProjectileSpeed;
    tmpPlayerSpeed = playerspeed;
    astProjectileSpeed = 0;
    playerspeed = 0;
    clearInterval(intervalAst);
    clearInterval(intervalScore);
    clearInterval(intervalPortal);
    clearInterval(intervalShield);

  } else {
    $("#pause").addClass("hidden");
    $("#greyout").addClass("hidden");
    astProjectileSpeed = tmpAstSpeed;
    playerspeed = tmpPlayerSpeed;
    intervalAst = setInterval(spawn, astInterval);
    intervalScore = setInterval(function(){
      score += 40;
      $("#score").text(score);
    }, 500);
    intervalPortal = setInterval(spawnPortal, 6000);
    intervalShield = setInterval(spawnShield, 9000);


  }

}

function restartGame(){
  $("#restart-confirmation").removeClass("hidden");
  $("#pause").addClass("hidden");
  $("#yes").click(function(){
    $("#restart-confirmation").addClass("hidden");
    $(".curAsteroid, .shield, .portal").remove();
    playerX = 615; playerY = 335; shielded = false;
    $("#score").text(score);
    $("#level").text(level);
    $("#danger").text(danger);
    $("#gameover").addClass("hidden");
    $("#pause").addClass("hidden");
    $(".restarting").removeClass("hidden");
    setTimeout(function(){
      $("#greyout").addClass("hidden");
      
      pause = false;
      $(".asteroidSection").addClass("hidden");
      preStart();
      $(".restarting").addClass("hidden");
    }, 3000);
    
    
  });
  $("#no").click(function(){
    $("#restart-confirmation").addClass("hidden");
    $("#pause").removeClass("hidden");
  });
}

function exitGame(){
  $("#pause").addClass("hidden");
  $("#greyout").addClass("hidden");
  $("#play").text("Resume game!");
  $(".asteroidSection").addClass("hidden");
  //clearInterval(astInterval);
  //clearInterval(intervalPlayer);
  //clearInterval(intervalPortal);
  //clearInterval(intervalShield);
  
  game_screen.addClass("hidden");
  $(".tutorial-window").addClass("hidden");
  $('#play').click(function(){
    $("#pause").removeClass("hidden");
    $("#greyout").removeClass("hidden");
    $(".tutorial-window").addClass("hidden");
    game_screen.removeClass("hidden");
    $(".asteroidSection").removeClass("hidden");
    
  });

}
/* ---------------------------- GAME FUNCTIONS ----------------------------- */
// Starter Code for randomly generating and moving an asteroid on screen
class Asteroid {
  // constructs an Asteroid object
  constructor() {
    /*------------------------Public Member Variables------------------------*/
    // create a new Asteroid div and append it to DOM so it can be modified later
    const objectString = "<div id = 'a-" + currentAsteroid + "' class = 'curAsteroid' > <img src = 'src/asteroid.png'/></div>";
    asteroid_section.append(objectString);
    // select id of this Asteroid
    this.id = $('#a-' + currentAsteroid);
    currentAsteroid++; // ensure each Asteroid has its own id
    // current x, y position of this Asteroid
    this.cur_x = 0; // number of pixels from right
    this.cur_y = 0; // number of pixels from top

    /*------------------------Private Member Variables------------------------*/
    // member variables for how to move the Asteroid
    this.x_dest = 0;
    this.y_dest = 0;
    // member variables indicating when the Asteroid has reached the border
    this.hide_axis = 'x';
    this.hide_after = 0;
    this.sign_of_switch = 'neg';
    // spawn an Asteroid at a random location on a random side of the board
    this.#spawnAsteroid();
  }

  // Requires: called by the user
  // Modifies:
  // Effects: return true if current Asteroid has reached its destination, i.e., it should now disappear
  //          return false otherwise
  hasReachedEnd() {
    // get the current position of interest (either the x position or the y position):
    const cur_pos = this.hide_axis === "x" ? this.cur_x : this.cur_y;
    // determine if the asteroid has reached its destination:
    return this.sign_of_switch === "pos" ? (cur_pos > this.hide_after) : (cur_pos < this.hide_after);
  }

  // Requires: called by the user
  // Modifies: cur_y, cur_x
  // Effects: move this Asteroid 1 unit in its designated direction
  updatePosition() {
    // ensures all asteroids travel at current level's speed
    this.cur_y += this.y_dest * astProjectileSpeed;
    this.cur_x += this.x_dest * astProjectileSpeed;
    // update asteroid's css position
    this.id.css('top', this.cur_y);
    this.id.css('right', this.cur_x);
  }

  // Requires: this method should ONLY be called by the constructor
  // Modifies: cur_x, cur_y, x_dest, y_dest, num_ticks, hide_axis, hide_after, sign_of_switch
  // Effects: randomly determines an appropriate starting/ending location for this Asteroid
  //          all asteroids travel at the same speed
  #spawnAsteroid() {
    // REMARK: YOU DO NOT NEED TO KNOW HOW THIS METHOD'S SOURCE CODE WORKS
    const x = getRandomNumber(0, 1280);
    const y = getRandomNumber(0, 720);
    const floor = 784;
    const ceiling = -64;
    const left = 1344;
    const right = -64;
    const major_axis = Math.floor(getRandomNumber(0, 2));
    const minor_aix = Math.floor(getRandomNumber(0, 2));
    let num_ticks;

    if (major_axis == 0 && minor_aix == 0) {
      this.cur_y = floor;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 0 && minor_aix == 1) {
      this.cur_y = ceiling;
      this.cur_x = x;
      const bottomOfScreen = game_screen.height();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = (game_screen.width() - x);
      this.x_dest = (this.x_dest - x) / num_ticks + getRandomNumber(-.5, .5);
      this.y_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.hide_axis = 'y';
      this.hide_after = 784;
      this.sign_of_switch = 'pos';
    }
    if (major_axis == 1 && minor_aix == 0) {
      this.cur_y = y;
      this.cur_x = left;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = -astProjectileSpeed - getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = -64;
      this.sign_of_switch = 'neg';
    }
    if (major_axis == 1 && minor_aix == 1) {
      this.cur_y = y;
      this.cur_x = right;
      const bottomOfScreen = game_screen.width();
      num_ticks = Math.floor((bottomOfScreen + 64) / astProjectileSpeed) || 1;

      this.x_dest = astProjectileSpeed + getRandomNumber(0, .5);
      this.y_dest = (game_screen.height() - y);
      this.y_dest = (this.y_dest - y) / num_ticks + getRandomNumber(-.5, .5);
      this.hide_axis = 'x';
      this.hide_after = 1344;
      this.sign_of_switch = 'pos';
    }
    // show this Asteroid's initial position on screen
    this.id.css("top", this.cur_y);
    this.id.css("right", this.cur_x);
    // normalize the speed s.t. all Asteroids travel at the same speed
    const speed = Math.sqrt((this.x_dest) * (this.x_dest) + (this.y_dest) * (this.y_dest));
    this.x_dest = this.x_dest / speed;
    this.y_dest = this.y_dest / speed;
  }
}

// Spawns an Asteroid travelling from one side to another
function spawn() {
  console.log("spawning asteroid");
  // create an Asteroid object in the DOM
  const asteroid = new Asteroid();
  // move this Asteroid across the screen
  move(asteroid);
}

function move(asteroid) {
  // create an interval to move an Asteroid (i.e. repeatedly update an Asteroid's position)
  const astermovement = setInterval(function () {
    // HINT: Consider checking collision and other game states here

    // update Asteroid position on screen
    asteroid.updatePosition();
    // determine whether Asteroid has reached its end position
    if (asteroid.hasReachedEnd()) { // i.e. outside the game border
      // remove this Asteroid from DOM (using jQuery .remove() method)
      asteroid.id.remove();
      // clear the interval that moves this Asteroid
      clearInterval(astermovement);
    }
  }, AST_OBJECT_REFRESH_RATE);
}

/* --------------------- Additional Utility Functions  --------------------- */
// Are two elements currently colliding?
function isColliding(o1, o2) {
  return isOrWillCollide(o1, o2, 0, 0);
}

// Will two elements collide soon?
// Input: Two elements, upcoming change in position for the moving element
function willCollide(o1, o2, o1_xChange, o1_yChange) {
  return isOrWillCollide(o1, o2, o1_xChange, o1_yChange);
}

// Are two elements colliding or will they collide soon?
// Input: Two elements, upcoming change in position for the moving element
// Use example: isOrWillCollide(paradeFloat2, person, FLOAT_SPEED, 0)
function isOrWillCollide(o1, o2, o1_xChange, o1_yChange) {
  const o1D = {
    'left': o1.offset().left + o1_xChange,
    'right': o1.offset().left + o1.width() + o1_xChange,
    'top': o1.offset().top + o1_yChange,
    'bottom': o1.offset().top + o1.height() + o1_yChange
  };
  const o2D = {
    'left': o2.offset().left,
    'right': o2.offset().left + o2.width(),
    'top': o2.offset().top,
    'bottom': o2.offset().top + o2.height()
  };
  // Adapted from https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
  if (o1D.left < o2D.right &&
    o1D.right > o2D.left &&
    o1D.top < o2D.bottom &&
    o1D.bottom > o2D.top) {
    // collision detected!
    return true;
  }
  return false;
}

// Get random number between min and max integer
function getRandomNumber(min, max) {
  return (Math.random() * (max - min)) + min;
}
