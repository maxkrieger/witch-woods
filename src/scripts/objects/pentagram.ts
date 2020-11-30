export default class Pentagram extends Phaser.Physics.Arcade.Sprite {
  team: string;
  constructor(scene: Phaser.Scene, x: number, y: number, team: string) {
    super(scene, x, y, "pentagram");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;
    this.body.setSize(200, 200, true);
    this.body.immovable = true;
    this.team = team;
    this.setPipeline("Lighting2D");
  }

  update = () => {};
}
