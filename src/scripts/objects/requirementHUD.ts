import { isEqual, times } from "lodash";
import {
  InventoryEntry,
  InventoryEntryI,
  ResourceRequirement,
  resourceTypes,
} from "../../gamestate";

const SIZE = 100;
const SLOTS = 8;
export default class RequirementHUD extends Phaser.GameObjects.Grid {
  requirements: ResourceRequirement[];
  images: Phaser.GameObjects.Image[];
  texts: Phaser.GameObjects.Text[];
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.centerX - SIZE * (SLOTS / 2),
      1,
      8 * SIZE,
      1 * SIZE,
      SIZE,
      SIZE,
      0x000000,
      0.5,
      0xffffff,
      0.3
    );
    this.images = [];
    this.texts = times(8, (idx) => {
      const text = new Phaser.GameObjects.Text(
        this.scene,
        this.x + SIZE * idx,
        0,
        "",
        { color: "#ffffff" }
      );
      text.setOrigin(0);
      text.setScrollFactor(0);
      this.scene.add.existing(text);
      return text;
    });

    this.setOrigin(0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    const instructionText = new Phaser.GameObjects.Text(
      this.scene,
      this.x - 50,
      SIZE + 10,
      "get these^",
      { color: "#ffffff", fontSize: "30px" }
    );
    instructionText.setOrigin(0);
    instructionText.setScrollFactor(0);
    scene.add.existing(instructionText);
  }

  setRequirements(requirements: ResourceRequirement[]) {
    if (!isEqual(requirements, this.requirements)) {
      this.requirements = requirements;
      this.images.forEach((img) => {
        if (img) {
          img.destroy();
        }
      });
      requirements.forEach((et, idx) => {
        this.images[idx] = new Phaser.GameObjects.Image(
          this.scene,
          this.x + SIZE * idx,
          0,
          "staticResources"
        );
        this.texts[idx].setText(
          `${et.quantity.toString()}/${et.quantityRequired.toString()}`
        );
        this.images[idx].setOrigin(0);
        this.images[idx].setScrollFactor(0);
        this.images[idx].setFrame(resourceTypes[et.resourceType].spriteIndex);
        this.images[idx].setDisplaySize(SIZE, SIZE);
        this.scene.add.existing(this.images[idx]);
        this.scene.children.bringToTop(this.images[idx]);
      });
      console.log("reqs", requirements);
    }
  }
}
