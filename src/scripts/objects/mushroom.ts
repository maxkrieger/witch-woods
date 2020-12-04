export default class Mushroom extends Phaser.Physics.Arcade.Sprite {
  id: string;
  health: number;
  healthVisible: boolean;
  healthBar: Phaser.GameObjects.Graphics;
  static maxHealth = 20;
  constructor(scene: Phaser.Scene, x, y: number, id: string) {
    super(scene, x, y, "mush1");
    scene.add.existing(this);
    this.displayWidth = 70;
    this.displayHeight = 120;
    this.id = id;
    this.scene.registry.events.on("changedata", this.dataChange);
    this.scene.registry.events.on("setdata", this.dataChange);
    this.healthVisible = false;
    this.health = Mushroom.maxHealth;
    this.healthBar = new Phaser.GameObjects.Graphics(scene);
    scene.add.existing(this.healthBar);
    // this.setPipeline("glowy");
    // scene.lights.addLight(x, y, 90, 0x63c5da, 30);
  }
  dataChange = (parent: any, key, data: any) => {
    if (key === "focusedResource") {
      if (data === this.id) {
        this.setAlpha(0.9);
        this.healthVisible = true;
        this.drawHealth();
      } else {
        this.clearAlpha();
        this.healthVisible = false;
        this.drawHealth();
      }
    }
  };
  drawHealth = () => {
    this.healthBar.clear();
    if (this.healthVisible) {
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
        (this.health / Mushroom.maxHealth) * 75,
        8
      );
    }
  };
}
