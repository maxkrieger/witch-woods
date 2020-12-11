import { isEqual } from "lodash";
import { InventoryEntry, ResourceRequirement } from "../../gamestate";

const SIZE = 100;
export default class RequirementHUD extends Phaser.GameObjects.Grid {
  requirements: ResourceRequirement[];
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.centerX,
      0,
      4 * SIZE,
      1 * SIZE,
      SIZE,
      SIZE,
      0x000000,
      0.5,
      0xffffff,
      0.5
    );

    // this.setOrigin(0);
    scene.add.existing(this);
    this.setScrollFactor(0);
  }
  setRequirements(requirements: ResourceRequirement[]) {
    if (!isEqual(requirements, this.requirements)) {
      this.requirements = requirements;
      console.log("reqs", requirements);
    }
  }
}
