import { Team } from "../../gamestate";

export default class IceTrap extends Phaser.GameObjects.Sprite {
  isTrap = true;
  team: Team;
  constructor(scene: Phaser.Scene, x, y: number, team: Team) {
    super(scene, x, y, "ice_trap");
    this.team = team;
  }
}
