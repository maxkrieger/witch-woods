export default class Mushroom extends Phaser.Physics.Arcade.Sprite {
  id: string;
  constructor(scene: Phaser.Scene, x, y: number, id: string) {
    super(scene, x, y, "mush1");
    scene.add.existing(this);
    this.displayWidth = 70;
    this.displayHeight = 120;
    this.id = id;
    // this.setPipeline("glowy");
    // scene.lights.addLight(x, y, 90, 0x63c5da, 30);
  }
  update = () => {
    //   check proximity
    // this.scene.registry`
  };
}
