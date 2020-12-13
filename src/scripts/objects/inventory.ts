import { isEqual, times } from "lodash";
import {
  InventoryEntry,
  InventoryEntryI,
  resourceTypes,
} from "../../gamestate";

const SIZE = 100;
export default class Inventory extends Phaser.GameObjects.Grid {
  inventoryState: InventoryEntry[];
  images: Phaser.GameObjects.Image[];
  texts: Phaser.GameObjects.Text[];
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
      0.3
    );
    this.images = times(4, (idx) => {
      const img = new Phaser.GameObjects.Image(
        this.scene,
        this.x + SIZE * idx,
        this.scene.cameras.main.y + this.scene.cameras.main.height - SIZE,
        "staticResources"
      );
      img.setOrigin(0);
      img.setScrollFactor(0);
      img.setFrame(0);
      img.setDisplaySize(SIZE, SIZE);
      img.setVisible(false);
      this.scene.add.existing(img);
      this.scene.children.bringToTop(img);
      return img;
    });
    this.texts = times(4, (idx) => {
      const text = new Phaser.GameObjects.Text(
        this.scene,
        this.x + SIZE * idx,
        this.scene.cameras.main.y + this.scene.cameras.main.height - 30,
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
  }
  setInventoryState(inventoryState: InventoryEntry[]) {
    if (!isEqual(inventoryState, this.inventoryState)) {
      this.inventoryState = inventoryState;
      inventoryState.forEach((et, idx) => {
        if (et === null) {
          this.texts[idx].setText("");
          this.images[idx].setVisible(false);
          return;
        }
        const entry = et as InventoryEntryI;
        this.texts[idx].setText(et.quantity.toString());

        this.images[idx].setFrame(
          resourceTypes[entry.resourceType].spriteIndex
        );
        this.images[idx].setVisible(true);
        this.scene.children.bringToTop(this.images[idx]);
        this.scene.children.bringToTop(this.texts[idx]);
      });
    }
  }
}
