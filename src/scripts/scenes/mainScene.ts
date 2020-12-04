import Mushroom from "../objects/mushroom";
import Pentagram from "../objects/pentagram";
import Witch from "../objects/witch";

interface MaterialReq {
  materialType: string;
  quantityNeeded: number;
  quantityHave: number;
}
interface Team {
  materials: MaterialReq[];
}
interface GameObjects {
  witchIDs: string[];
  resourceIDs: string[];
  sprites: { [id: string]: Phaser.Physics.Arcade.Sprite };
}

export default class MainScene extends Phaser.Scene {
  gameObjects: GameObjects;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  pipelineInstance: Phaser.Renderer.WebGL.WebGLPipeline;
  constructor() {
    super({ key: "MainScene" });
    this.gameObjects = {
      witchIDs: [],
      resourceIDs: [],
      sprites: {},
    };
  }
  preload() {
    this.load.image("bg", ["assets/img/bg.png", "assets/img/norm.png"]);
    const range = 3;
    const pipeline = new Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline({
      game: this.game,
      renderer: this.game.renderer,
      fragShader: `
      precision lowp float;
      varying vec2 outTexCoord;
      varying vec4 outTint;
      uniform sampler2D uMainSampler;
      uniform float alpha;
      uniform float time;
      void main() {
        vec4 sum = vec4(0);
        vec2 texcoord = outTexCoord;
        for(int xx = -${range}; xx <= ${range}; xx++) {
          for(int yy = -${range}; yy <= ${range}; yy++) {
            float dist = sqrt(float(xx*xx) + float(yy*yy));
            float factor = 0.0;
            if (dist == 0.0) {
              factor = 2.0;
            } else {
              factor = 2.0/abs(float(dist));
            }
            sum += texture2D(uMainSampler, texcoord + vec2(xx, yy) * 0.002) * (abs(sin(time))+0.06);
          }
        }
        gl_FragColor = sum * 0.025 + texture2D(uMainSampler, texcoord)*alpha;
      }
      `,
    });
    const added = (this.game
      .renderer as Phaser.Renderer.WebGL.WebGLRenderer).addPipeline(
      "glowy",
      pipeline
    );
    this.pipelineInstance = added;
    added.setFloat1("alpha", 1.0);
  }

  create() {
    this.cameras.main.setBounds(0, 0, 5000, 5000);
    this.physics.world.setBounds(0, 0, 5000, 5000);
    this.add.image(0, 0, "bg").setOrigin(0).setPipeline("Light2D");
    this.add
      .image(688, 0, "bg")
      .setFlipX(true)
      .setOrigin(0)
      .setPipeline("Light2D");
    this.add.image(1376, 0, "bg").setOrigin(0).setPipeline("Light2D");

    this.cursor = this.input.keyboard.createCursorKeys();
    this.cursor.down?.setEmitOnRepeat(true);
    this.cursor.up?.setEmitOnRepeat(true);
    this.cursor.right?.setEmitOnRepeat(true);
    this.cursor.left?.setEmitOnRepeat(true);

    const pentagram = new Pentagram(this, 1200, 400, "red_team");

    this.gameObjects.sprites["bla"] = new Witch(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bla",
      true
    );
    this.cameras.main.startFollow(
      this.gameObjects.sprites["bla"],
      true,
      0.05,
      0.05,
      100,
      100
    );

    this.lights.enable().setAmbientColor(0x555555);

    this.cursor.down?.on("down", this.setPlayerY(300));
    this.cursor.down?.on("up", this.setPlayerY(0));
    this.cursor.up?.on("down", this.setPlayerY(-300));
    this.cursor.up?.on("up", this.setPlayerY(0));
    this.cursor.left?.on("down", this.setPlayerX(-300));
    this.cursor.left?.on("up", this.setPlayerX(0));
    this.cursor.right?.on("down", this.setPlayerX(300));
    this.cursor.right?.on("up", this.setPlayerX(0));

    this.physics.add.collider(this.gameObjects.sprites["bla"], pentagram);
    this.spawnResources();
  }

  spawnResources = () => {
    this.gameObjects.sprites["m1"] = new Mushroom(this, 200, 200, "m1");
    this.gameObjects.resourceIDs.push("m1");
    this.gameObjects.sprites["m2"] = new Mushroom(this, 800, 200, "m2");
    this.gameObjects.resourceIDs.push("m2");
  };

  setPlayerY = (v: number) => () => {
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      this.gameObjects.sprites["bla"].setVelocityY(v);
      if (v > 0) {
        this.gameObjects.sprites["bla"].anims.play("blue_down", true);
      } else if (v < 0) {
        this.gameObjects.sprites["bla"].anims.play("blue_up", true);
      } else if (v === 0 && this.cursor.left?.isUp && this.cursor.right?.isUp) {
        this.gameObjects.sprites["bla"].anims.stop();
      }
    }
  };

  setPlayerX = (v: number) => () => {
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      this.gameObjects.sprites["bla"].setVelocityX(v);
      if (v > 0) {
        this.gameObjects.sprites["bla"].anims.play("blue_right", true);
      } else if (v < 0) {
        this.gameObjects.sprites["bla"].anims.play("blue_left", true);
      } else if (v === 0 && this.cursor.down?.isUp && this.cursor.up?.isUp) {
        this.gameObjects.sprites["bla"].anims.stop();
      }
    }
  };

  setFocusedResource = (id: string | null) => {
    if (this.registry.get("focusedResource") !== id) {
      this.registry.set("focusedResource", id);
    }
  };

  update(time: number) {
    // TODO: https://phaser.io/examples/v3/view/input/mouse/click-sprite
    this.pipelineInstance.setFloat1("time", time / 1000);
    Object.values(this.gameObjects.sprites).forEach((sprite) => {
      sprite.update();
    });

    const inRange = this.gameObjects.resourceIDs
      .map((id) => ({
        dist: Phaser.Math.Distance.Between(
          this.gameObjects.sprites["bla"].x,
          this.gameObjects.sprites["bla"].y,
          this.gameObjects.sprites[id].x,
          this.gameObjects.sprites[id].y
        ),
        id,
      }))
      .sort((a, b) => a.dist - b.dist);
    if (inRange.length > 0) {
      console.log("ye");
      this.setFocusedResource(inRange[0].dist <= 200 ? inRange[0].id : null);
    } else {
      this.setFocusedResource(null);
    }
  }
}
