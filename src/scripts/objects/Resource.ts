import { ResourceDefinition, ResourceType } from "../../gamestate";

export default abstract class Resource extends Phaser.Physics.Arcade.Sprite {
  id: string;
  health: number;
  focused: boolean;
  maxHealth: number;
  healthBar: Phaser.GameObjects.Graphics;
  channeling: boolean;
  channelingInterval: Phaser.Time.TimerEvent;
  isResource = true;
  constructor(
    scene: Phaser.Scene,
    x,
    y: number,
    sprite: string,
    id: string,
    resource: ResourceDefinition
  ) {
    super(scene, x, y, sprite);
    scene.add.existing(this);
    this.id = id;
    this.focused = false;
    this.maxHealth = resource.maxHealth;
    this.health = resource.maxHealth;
    this.scene.registry.events.on("changedata", this.dataChange);
    this.healthBar = new Phaser.GameObjects.Graphics(scene);
    scene.add.existing(this.healthBar);
    this.scene.registry.events.on("setdata", this.dataChange);

    this.channelingInterval = scene.time.addEvent({
      delay: 250,
      callback: this.channelTick,
      callbackScope: this,
      loop: true,
      paused: false,
    });
  }
  drawHealth = () => {
    this.healthBar.clear();
    if (this.focused) {
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
        this.drawHealth();
      } else {
        this.clearAlpha();
        this.focused = false;
        this.drawHealth();
      }
    }
  };
  setChanneling = (channeling: boolean) => {
    this.channeling = channeling;
  };
  /**
   * performs server effect
   */
  channelTick = () => {
    if (this.channeling) {
      if (this.health <= 0) {
        console.log("despawn!");
        return;
      }
      this.health--;
      this.drawHealth();
    } else {
      if (this.health < this.maxHealth) {
        this.health++;
        this.drawHealth();
      }
    }
  };
}
