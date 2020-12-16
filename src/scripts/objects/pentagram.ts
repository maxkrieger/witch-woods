import { Team } from "../../gamestate";

export default class Pentagram extends Phaser.Physics.Arcade.Sprite {
  team: Team;
  constructor(scene: Phaser.Scene, x: number, y: number, team: Team) {
    super(scene, x, y, "pentagram");
    this.setScale(0.5, 0.5);
    scene.add.existing(this);
    this.team = team;
  }

  update = () => {};
}
