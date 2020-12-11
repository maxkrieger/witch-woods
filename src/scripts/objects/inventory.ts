import { isEqual } from "lodash";
import { InventoryEntry } from "../../gamestate";

const SIZE = 100;
export default class Inventory extends Phaser.GameObjects.Grid {
  inventoryState: InventoryEntry[];
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.centerX,
      scene.cameras.main.y + scene.cameras.main.height,
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
  setInventoryState(inventoryState: InventoryEntry[]) {
    if (!isEqual(inventoryState, this.inventoryState)) {
      this.inventoryState = inventoryState;
      console.log(inventoryState);
    }
  }
}
