import { isEqual } from "lodash";
import { BlendModes, Geom } from "phaser";
import { Effect, Facing, Player, Team } from "../../gamestate";

export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  currentTween?: Phaser.Tweens.Tween;
  facing: Facing;
  moving: boolean;
  curFacing: Facing = Facing.DOWN;
  curMoving: boolean = false;
  prevState: Player;

  team: Team;
  effect: Effect = { kind: "normal" };
  img: Phaser.GameObjects.Image;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean,
    team: Team
  ) {
    super(scene, x, y, `witch_${team}`);
    this.team = team;
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;

    // TODO: set collision
    // this.body.setSize()
    this.setCollideWorldBounds(true);
    this.moving = false;
    this.facing = Facing.RIGHT;
    this.img = new Phaser.GameObjects.Image(scene, x, y, "ice")
      .setVisible(false)
      .setDepth(5);

    scene.add.existing(this.img);

    scene.anims.create({
      key: "blue_right",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_left",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_up",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 4,
        end: 6,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_down",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 7,
        end: 10,
      }),
      repeat: -1,
      frameRate: 10,
    });

    scene.anims.create({
      key: "red_right",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_left",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_up",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 4,
        end: 6,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_down",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 7,
        end: 10,
      }),
      repeat: -1,
      frameRate: 10,
    });
    this.anims.play(`${team}_${this.facing}`);
    this.anims.pause();
  }

  onUpdate = (player: Player) => {
    if (isEqual(this.prevState, player)) {
      return;
    }
    this.setMoving(player.moving);
    this.setFacing(player.facing);
    if (!this.isMe) {
      if ((player.x !== this.x || player.y !== this.y) && !this.currentTween) {
        this.currentTween = this.scene.add.tween({
          targets: this,
          x: player.x,
          y: player.y,
          ease: "Linear",
          duration: 75,
          onComplete: () => {
            this.currentTween = undefined;
          },
        });
      }
    }
    if (!this.prevState || !isEqual(this.prevState.effect, player.effect)) {
      this.effect = player.effect;
      if (player.effect.kind === "ice_trapped") {
        this.setVelocity(0, 0);
        this.anims.pause();
        this.img.setVisible(true);
        const frame = Math.floor(13 * (player.effect.remaining / 30));
        this.img.setTexture("ice", frame);
      } else if (player.effect.kind === "seeing_eye") {
        this.img.setVisible(true);
        const frame = Math.floor(8 * (player.effect.remaining / 20));
        this.img.setTexture("eye", frame);
      } else {
        this.img.setVisible(false);
      }
    }
    this.prevState = player;
  };
  setFacing = (facing: Facing) => {
    if (this.moving && facing != this.curFacing) {
      this.anims.play(`${this.team}_${facing}`, true);
    }
    this.curFacing = facing;
    this.facing = facing;
  };
  setMoving = (moving: boolean) => {
    if (!moving && this.curMoving) {
      this.anims.pause();
    } else if (moving && !this.curMoving) {
      this.anims.resume();
    }
    this.curMoving = moving;
    this.moving = moving;
  };

  update = () => {
    this.img.setPosition(
      this.x,
      this.y - (this.effect.kind === "seeing_eye" ? 150 : 0)
    );
  };
}
