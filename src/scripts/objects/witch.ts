import { isEqual } from "lodash";
import { Facing, Player } from "../../gamestate";

export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  currentTween?: Phaser.Tweens.Tween;
  facing: Facing;
  moving: boolean;
  prevState: Player;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean
  ) {
    super(scene, x, y, "witch_blue");
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;
    // this.setPipeline("glowy");

    // TODO: set collision
    // this.body.setSize()
    this.setCollideWorldBounds(true);
    this.moving = false;
    this.facing = Facing.RIGHT;

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
    this.anims.play(`blue_${this.facing}`);
    this.anims.pause();
  }

  onUpdate = (player: Player) => {
    if (isEqual(this.prevState, player)) {
      return;
    }
    this.prevState = player;
    if (!this.isMe) {
      this.setMoving(player.moving);
      this.setFacing(player.facing);
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
  };
  setFacing = (facing: Facing) => {
    if (this.moving && facing != this.facing) {
      this.anims.play(`blue_${facing}`, true);
    }
    this.facing = facing;
  };
  setMoving = (moving: boolean) => {
    if (!moving && this.moving) {
      this.anims.pause();
    } else if (moving && !this.moving) {
      this.anims.resume();
    }
    this.moving = moving;
  };
  update = () => {};
}
