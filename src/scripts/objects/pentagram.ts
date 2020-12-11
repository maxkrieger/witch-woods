import { Team } from "../../gamestate";

export default class Pentagram extends Phaser.Physics.Arcade.Sprite {
  team: Team;
  constructor(scene: Phaser.Scene, x: number, y: number, team: Team) {
    super(scene, x, y, "pentagram");
    scene.add.existing(this);
    // scene.physics.add.existing(this);
    // this.body.enable = true;
    // this.body.setSize(200, 200, true);
    // this.body.immovable = true;
    this.team = team;
  }

  update = () => {};
}
