export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  facing: "left" | "right" | "up" | "down";
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean
  ) {
    super(scene, x, y, "witch");
    this.facing = "right";
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;
    this.setCollideWorldBounds(true);
    this.setPipeline("Lighting2D");
  }
  update = () => {};
}
