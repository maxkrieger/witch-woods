export default abstract class Resource extends Phaser.Physics.Arcade.Sprite {
  id: string;
  health: number;
  focused: boolean;
  maxHealth: number;
  healthBar: Phaser.GameObjects.Graphics;
  channeling: boolean;
  channelingInterval: Phaser.Time.TimerEvent;
  constructor(
    scene: Phaser.Scene,
    x,
    y: number,
    sprite: string,
    id: string,
    maxHealth: number
  ) {
    super(scene, x, y, sprite);
    scene.add.existing(this);
    this.id = id;
    this.focused = false;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.scene.registry.events.on("changedata", this.dataChange);
    this.healthBar = new Phaser.GameObjects.Graphics(scene);
    scene.add.existing(this.healthBar);
    this.scene.registry.events.on("setdata", this.dataChange);

    this.channelingInterval = scene.time.addEvent({
      delay: 250,
      callback: this.channelTick,
      callbackScope: this,
      loop: true,
      paused: true,
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
    this.channelingInterval.paused = !channeling;
    // set timer
  };
  /**
   * @returns: true if despawn
   */
  channelTick = () => {
    if (this.health <= 0) {
      return true;
    }
    this.health--;
    this.drawHealth();
    return false;
  };
}
