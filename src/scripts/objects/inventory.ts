import { isEqual } from "lodash";
import {
  InventoryEntry,
  InventoryEntryI,
  resourceTypes,
} from "../../gamestate";

const SIZE = 100;
export default class Inventory extends Phaser.GameObjects.Grid {
  inventoryState: InventoryEntry[];
  images: Phaser.GameObjects.Image[];
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.centerX - SIZE * 2,
      scene.cameras.main.y + scene.cameras.main.height - SIZE,
      4 * SIZE,
      1 * SIZE,
      SIZE,
      SIZE,
      0x000000,
      0.5,
      0xffffff,
      0.5
    );
    this.images = [];

    this.setOrigin(0);
    scene.add.existing(this);
    this.setScrollFactor(0);
  }
  setInventoryState(inventoryState: InventoryEntry[]) {
    if (!isEqual(inventoryState, this.inventoryState)) {
      this.inventoryState = inventoryState;
      this.images.forEach((img) => {
        if (img) {
          img.destroy();
        }
      });
      inventoryState.forEach((et, idx) => {
        if (et === null) {
          return;
        }
        const entry = et as InventoryEntryI;
        this.images[idx] = new Phaser.GameObjects.Image(
          this.scene,
          this.x + SIZE * idx,
          this.scene.cameras.main.y + this.scene.cameras.main.height - SIZE,
          "staticResources"
        );
        this.images[idx].setOrigin(0);
        this.images[idx].setScrollFactor(0);
        this.images[idx].setFrame(
          resourceTypes[entry.resourceType].spriteIndex
        );
        this.images[idx].setDisplaySize(SIZE, SIZE);
        this.scene.add.existing(this.images[idx]);
        this.scene.children.bringToTop(this.images[idx]);
      });
      console.log(inventoryState);
    }
  }
}
