import { isEqual, times } from "lodash";
import {
  Ability,
  InventoryEntry,
  InventoryEntryI,
  resourceTypes,
} from "../../gamestate";
import { KEYS } from "../scenes/mainScene";

const SIZE = 100;
export default class Inventory extends Phaser.GameObjects.Container {
  inventoryState: InventoryEntry[];
  images: Phaser.GameObjects.Image[];
  abilityImages: Phaser.GameObjects.Image[];
  abilityTexts: Phaser.GameObjects.Text[];
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
      img.setFrame(0);
      img.setDisplaySize(SIZE, SIZE);
      img.setVisible(false);
      return img;
    });
    this.abilityImages = times(4, (idx) => {
      const img = new Phaser.GameObjects.Image(
        this.scene,
        SIZE * idx + 50,
        -40,
        "icetrap_off"
      );
      img.setDisplaySize(50, 50);
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
      return text;
    });
    this.abilityTexts = times(4, (idx) => {
      const text = new Phaser.GameObjects.Text(
        this.scene,
        SIZE * idx,
        -15,
        KEYS[idx],
        {
          color: "#ffffff",
        }
      );
      text.setVisible(false);
      return text;
    });

    this.add(this.texts);
    this.add(this.images);
    this.add(this.abilityImages);
    this.add(this.abilityTexts);

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
          this.abilityImages[idx].setVisible(false);
          this.abilityTexts[idx].setVisible(false);
          return;
        }
        const entry = et as InventoryEntryI;
        this.texts[idx].setText(et.quantity.toString());
        this.images[idx].setFrame(
          resourceTypes[entry.resourceType].spriteIndex
        );
        this.images[idx].setVisible(true);
        if (resourceTypes[entry.resourceType].ability !== Ability.NONE) {
          this.abilityImages[idx].setTexture(
            `${resourceTypes[entry.resourceType].ability}_${
              entry.cooldown === 0 ? "on" : "off"
            }`
          );
          this.abilityTexts[idx].setVisible(true);
          this.abilityTexts[idx].setText(
            `${KEYS[idx]} ${
              entry.cooldown !== 0 ? "(" + entry.cooldown + ")" : ""
            }`
          );
          this.abilityImages[idx].setVisible(true);
        } else {
          this.abilityTexts[idx].setVisible(false);
          this.abilityImages[idx].setVisible(false);
        }
        this.scene.children.bringToTop(this.images[idx]);
        this.scene.children.bringToTop(this.texts[idx]);
      });
    }
  }
}
