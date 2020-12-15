import { Team } from "../../gamestate";

export default class IceTrap extends Phaser.GameObjects.Sprite {
  isTrap = true;
  team: Team;
  id: string;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    team: Team,
    id: string
  ) {
    super(scene, x, y, "ice_trap");
    this.setDisplaySize(175, 155);
    scene.add.existing(this);
    this.team = team;
    this.id = id;
  }
}
