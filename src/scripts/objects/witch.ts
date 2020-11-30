export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean
  ) {
    super(scene, x, y, "witch");
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
