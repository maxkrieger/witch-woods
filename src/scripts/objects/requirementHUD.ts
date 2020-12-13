import { isEqual, times } from "lodash";
import {
  InventoryEntry,
  InventoryEntryI,
  ResourceRequirement,
  resourceTypes,
} from "../../gamestate";

const SIZE = 50;
export default class RequirementHUD extends Phaser.GameObjects.Container {
  requirements: ResourceRequirement[];
  images: Phaser.GameObjects.Image[];
  texts: Phaser.GameObjects.Text[];
  constructor(scene: Phaser.Scene) {
    super(scene, 30, 30);

    scene.add.existing(this);
    this.setScrollFactor(0);
    this.scene.children.bringToTop(this);
  }

  setRequirements(requirements: ResourceRequirement[]) {
    if (!this.requirements) {
      this.images = requirements.map((req, idx) => {
        const img = new Phaser.GameObjects.Image(
          this.scene,
          0,
          SIZE * idx,
          "staticResources"
        );
        img.setDisplaySize(SIZE, SIZE);
        img.setOrigin(0);
        img.setFrame(resourceTypes[req.resourceType].spriteIndex);
        return img;
      });
      this.texts = requirements.map((req, idx) => {
        const text = new Phaser.GameObjects.Text(
          this.scene,
          SIZE + 5,
          SIZE * idx + SIZE / 2,
          `${req.quantity}/${req.quantityRequired}`,
          {
            color: "#ffffff",
          }
        );
        text.setOrigin(0);
        return text;
      });
      this.add(this.images);
      this.add(this.texts);
    }
    if (!isEqual(requirements, this.requirements)) {
      this.requirements = requirements;
      this.requirements.forEach((req, idx) => {
        this.images[idx].setFrame(resourceTypes[req.resourceType].spriteIndex);
        this.texts[idx].setText(`${req.quantity}/${req.quantityRequired}`);
      });
      this.scene.children.bringToTop(this);
    }
    this.requirements = requirements;
  }
}
