import { Physics } from "phaser";

export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  destination: { worldX: number; worldY: number };
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean
  ) {
    super(scene, x, y, "witch");
    this.destination = { worldX: x, worldY: y };
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setPipeline("Lighting2D");
  }
  setDestination = (x, y: number) => {
    this.destination = { worldX: x, worldY: y };
  };
  update = () => {
    const targetDistance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      this.destination.worldX,
      this.destination.worldY
    );
    if (targetDistance < 4) {
      this.body.reset(this.destination.worldX, this.destination.worldY);
    }
  };
}
