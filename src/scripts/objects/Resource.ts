import { GameObject, ResourceDefinition, ResourceType } from "../../gamestate";

export default abstract class Resource extends Phaser.Physics.Arcade.Sprite {
  id: string;
  health: number;
  maxHealth: number;
  focused: boolean = false;
  healthBar: Phaser.GameObjects.Graphics;
  channeling: boolean;
  isResource = true;
  constructor(
    scene: Phaser.Scene,
    x,
    y: number,
    id: string,
    resource: ResourceDefinition
  ) {
    super(scene, x, y, "staticResources");
    this.setFrame(resource.spriteIndex);
    scene.add.existing(this);
    this.id = id;
    this.maxHealth = resource.maxHealth;
    this.health = resource.maxHealth;
    this.scene.registry.events.on("changedata", this.dataChange);
    this.healthBar = new Phaser.GameObjects.Graphics(scene);
    scene.add.existing(this.healthBar);
    this.scene.registry.events.on("setdata", this.dataChange);
  }
  drawHealth = (show: boolean) => {
    this.healthBar.clear();
    if (show) {
      this.healthBar.fillStyle(0xffffff, 0.3);
      this.healthBar.fillRect(
        this.x - this.displayWidth * 0.5,
        this.y - this.displayHeight * 0.5 - 10,
        75,
        8
      );
      this.healthBar.fillStyle(0xffffff, 0.9);
      this.healthBar.fillRect(
        this.x - this.displayWidth * 0.5,
        this.y - this.displayHeight * 0.5 - 10,
        (this.health / this.maxHealth) * 75,
        8
      );
    }
  };
  dataChange = (parent: any, key, data: any) => {
    if (key === "focusedResource") {
      if (data === this.id) {
        this.setAlpha(0.9);
        this.focused = true;
        this.drawHealth(true);
      } else {
        this.clearAlpha();
        this.focused = false;
        this.drawHealth(false);
      }
    }
  };

  onUpdate = (resource: GameObject) => {
    this.health = resource.health;
    this.drawHealth(resource.channeling !== null || this.focused);
  };
}
