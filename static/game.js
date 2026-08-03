/*
game.js
Step 4: core movement + jump, tested in the Forest with one obstacle.
No enemies yet - this proves movement feels right before we add combat.
*/

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_Y = 340;

let player;
let cursors;
let controlState = { left: false, right: false, jumpPressed: false };
let isWalking = false;
let facing = "right";

class ForestScene extends Phaser.Scene {
  constructor() {
    super("ForestScene");
  }

  preload() {
    this.load.image("hunter_idle", "images/hunter_idle.png");
    this.load.spritesheet("hunter_walk", "images/hunter_walk_sheet.png", {
      frameWidth: 102,
      frameHeight: 408,
    });
  }

  create() {
    // Simple placeholder forest backdrop (solid gradient-ish bands) until
    // we swap in a matching pixel-art background later.
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2e1a, 0x1a2e1a, 0x0d1a0d, 0x0d1a0d, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Ground
    const ground = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 20, GAME_WIDTH, 40, 0x3d2b1f);
    this.physics.add.existing(ground, true);

    // Walk animation from the 6-frame sheet
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("hunter_walk", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1,
    });

    // Player
    player = this.physics.add.sprite(100, GROUND_Y, "hunter_idle");
    player.setScale(0.28);
    player.setCollideWorldBounds(true);
    player.setBounce(0.05);
    player.body.setGravityY(1200);
    player.setDepth(2);

    this.physics.add.collider(player, ground);

    // One test obstacle (a crate) to jump over
    const crate = this.add.rectangle(450, GROUND_Y - 4, 40, 40, 0x8a5a2b);
    crate.setStrokeStyle(2, 0x4a3016);
    this.physics.add.existing(crate, true);
    this.physics.add.collider(player, crate);

    // Keyboard fallback (useful for desktop testing)
    cursors = this.input.keyboard.createCursorKeys();

    // Bind on-screen touch controls
    this.bindTouchControls();

    this.physics.world.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  bindTouchControls() {
    const left = document.getElementById("btn-left");
    const right = document.getElementById("btn-right");
    const jump = document.getElementById("jump-btn");

    const setState = (key, val) => (e) => { e.preventDefault(); controlState[key] = val; };

    left.addEventListener("touchstart", setState("left", true));
    left.addEventListener("touchend", setState("left", false));
    left.addEventListener("mousedown", setState("left", true));
    left.addEventListener("mouseup", setState("left", false));

    right.addEventListener("touchstart", setState("right", true));
    right.addEventListener("touchend", setState("right", false));
    right.addEventListener("mousedown", setState("right", true));
    right.addEventListener("mouseup", setState("right", false));

    jump.addEventListener("touchstart", (e) => { e.preventDefault(); controlState.jumpPressed = true; });
    jump.addEventListener("mousedown", () => { controlState.jumpPressed = true; });
  }

  update() {
    const speed = 220;
    const onGround = player.body.blocked.down || player.body.touching.down;

    const goLeft = controlState.left || cursors.left.isDown;
    const goRight = controlState.right || cursors.right.isDown;
    const wantsJump = controlState.jumpPressed || Phaser.Input.Keyboard.JustDown(cursors.up);

    if (goLeft) {
      player.setVelocityX(-speed);
      facing = "left";
      startWalkAnim();
    } else if (goRight) {
      player.setVelocityX(speed);
      facing = "right";
      startWalkAnim();
    } else {
      player.setVelocityX(0);
      stopWalkAnim();
    }

    player.setFlipX(facing === "left");

    if (wantsJump && onGround) {
      player.setVelocityY(-520);
    }
    controlState.jumpPressed = false;
  }
}

function startWalkAnim() {
  if (!isWalking) {
    isWalking = true;
    player.play("walk", true);
  }
}

function stopWalkAnim() {
  if (isWalking) {
    isWalking = false;
    player.anims.stop();
    player.setTexture("hunter_idle");
  }
}

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#0a0a0a",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ForestScene],
};

window.addEventListener("load", () => {
  new Phaser.Game(config);
});
