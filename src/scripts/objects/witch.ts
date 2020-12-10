import { Player } from "../../gamestate";

export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  facing: "left" | "right" | "up" | "down";
  currentTween?: Phaser.Tweens.Tween;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean
  ) {
    super(scene, x, y, "witch_blue");
    this.facing = "right";
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;
    // this.setPipeline("glowy");

    // TODO: set collision
    // this.body.setSize()
    this.setCollideWorldBounds(true);

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
  }
  onUpdate = (player: Player) => {
    if (
      !this.isMe &&
      (player.x !== this.x || player.y !== this.y) &&
      !this.currentTween
    ) {
      this.currentTween = this.scene.add.tween({
        targets: this,
        x: player.x,
        y: player.y,
        ease: "Linear",
        duration: 25,
        onComplete: () => {
          this.currentTween = undefined;
        },
      });
    }
  };
  update = () => {};
}
