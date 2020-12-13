import { isEqual, times } from "lodash";
import {
  InventoryEntry,
  InventoryEntryI,
  resourceTypes,
} from "../../gamestate";

const SIZE = 100;
export default class Inventory extends Phaser.GameObjects.Container {
  inventoryState: InventoryEntry[];
  images: Phaser.GameObjects.Image[];
  texts: Phaser.GameObjects.Text[];
  grid: Phaser.GameObjects.Grid;
  constructor(scene: Phaser.Scene) {
    super(
      scene,
      scene.cameras.main.centerX - SIZE * 2,
      scene.cameras.main.y + scene.cameras.main.height - SIZE
    );
    this.grid = new Phaser.GameObjects.Grid(
      scene,
      0,
      0,
      4 * SIZE,
      SIZE,
      SIZE,
      SIZE,
      0x000000,
      0.5,
      0xffffff,
      0.5
    ).setOrigin(0);
    this.add(this.grid);

    this.images = times(4, (idx) => {
      const img = new Phaser.GameObjects.Image(
        this.scene,
        SIZE * idx,
        0,
        "staticResources"
      );
      img.setOrigin(0);
      img.setScrollFactor(0);
      img.setFrame(0);
      img.setDisplaySize(SIZE, SIZE);
      img.setVisible(false);
      return img;
    });
    this.texts = times(4, (idx) => {
      const text = new Phaser.GameObjects.Text(
        this.scene,
        SIZE * idx,
        SIZE - 30,
        "",
        {
          color: "#ffffff",
        }
      );
      text.setOrigin(0);
      text.setScrollFactor(0);
      return text;
    });

    this.add(this.texts);
    this.add(this.images);

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
