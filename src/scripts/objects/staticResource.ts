import {
  GameObject,
  MushroomResource,
  ResourceType,
  resourceTypes,
} from "../../gamestate";
import Resource from "./Resource";

export default class StaticResource extends Resource {
  constructor(scene: Phaser.Scene, resource: GameObject) {
    super(
      scene,
      resource.x,
      resource.y,
      resource.id,
      resourceTypes[resource.resourceType]
    );
    this.displayWidth = 70;
    this.displayHeight = 120;
  }
}
