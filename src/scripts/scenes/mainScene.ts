import Witch from "../objects/witch";

export default class MainScene extends Phaser.Scene {
  witches: { [id: string]: Witch };
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  constructor() {
    super({ key: "MainScene" });
    this.witches = {};
  }
  preload() {
    this.load.image("bg", ["assets/img/bg.png", "assets/img/norm.png"]);
  }

  create() {
    this.cameras.main.setBounds(0, 0, 2752, 1080 * 2);
    this.physics.world.setBounds(0, 0, 2752, 1080 * 2);
    this.add.image(0, 0, "bg").setOrigin(0).setPipeline("Light2D");
    this.add
      .image(688, 0, "bg")
      .setFlipX(true)
      .setOrigin(0)
      .setPipeline("Light2D");
    this.add.image(1376, 0, "bg").setOrigin(0).setPipeline("Light2D");

    this.cursor = this.input.keyboard.createCursorKeys();

    this.witches["bla"] = new Witch(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bla",
      true
    );
    this.cameras.main.startFollow(
      this.witches["bla"],
      true,
      0.05,
      0.05,
      100,
      100
    );

    this.lights.enable().setAmbientColor(0x808080);
    this.lights.addLight(200, 200, 100, 0xff0000, 8);

    this.cursor.down?.on("down", this.setPlayerY(200));
    this.cursor.down?.on("up", this.setPlayerY(0));
    this.cursor.up?.on("down", this.setPlayerY(-200));
    this.cursor.up?.on("up", this.setPlayerY(0));
    this.cursor.left?.on("down", this.setPlayerX(-200));
    this.cursor.left?.on("up", this.setPlayerX(0));
    this.cursor.right?.on("down", this.setPlayerX(200));
    this.cursor.right?.on("up", this.setPlayerX(0));
  }

  setPlayerY = (v: number) => () => {
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      this.witches["bla"].setVelocityY(v);
    }
  };
  setPlayerX = (v: number) => () => {
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      this.witches["bla"].setVelocityX(v);
    }
  };

  update() {
    Object.values(this.witches).forEach((witch: Witch) => {
      witch.update();
    });
  }
}
