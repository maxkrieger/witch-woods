import { GameObject, MushroomResource, ResourceType } from "../../gamestate";
import Resource from "./Resource";

export default class Mushroom extends Resource {
  constructor(scene: Phaser.Scene, x, y: number, id: string) {
    super(scene, x, y, "mush1", id, MushroomResource);
    this.displayWidth = 70;
    this.displayHeight = 120;
  }
}
