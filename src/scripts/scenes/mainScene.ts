import Witch from "../objects/witch";

export default class MainScene extends Phaser.Scene {
  witches: { [id: string]: Witch };
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  constructor() {
    super({ key: "MainScene" });
    this.witches = {};
  }
  preload() {
    this.load.image("bg", ["assets/img/bg_obstacles.png", "assets/img/norm.png"]);
    this.load.tilemapTiledJSON("map","assets/tilemaps/map.json");
    this.load.image("tiles","assets/tilemaps/tiles.png");
  }

  create() {
    // Set up a tilemap with at least one layer
    const tilemap = this.add.tilemap("map");
    const tileset = tilemap.addTilesetImage("tiles", "tiles");
    const wallLayer = tilemap.createStaticLayer("walls", tileset);

    // Load the navMesh from the tilemap object layer "navmesh" (created in Tiled). The navMesh was
    // created with 12.5 pixels of space around obstacles.
    const objectLayer = tilemap.getObjectLayer("navmesh");
    const navMesh = (this as any).navMeshPlugin.buildMeshFromTiled("mesh", objectLayer, 12.5);
    const path = navMesh.findPath({ x: 0, y: 0 }, { x: 600, y: 600 });
    // ⮡  path will either be null or an array of Phaser.Geom.Point objects
    console.log(path,navMesh,this);

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
    this.input.addListener("pointerdown", this.onDown);

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
  }



  onDown = () => {
    const { worldX, worldY } = this.input.mousePointer;
    this.witches["bla"].setDestination(worldX, worldY);
    this.physics.moveTo(this.witches["bla"], worldX, worldY, 480);
  };

  update() {
    Object.values(this.witches).forEach((witch: Witch) => {
      witch.update();
    });
  }
}
