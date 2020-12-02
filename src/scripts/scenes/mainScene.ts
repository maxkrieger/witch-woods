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

interface Resource {
  sprite: Phaser.Physics.Arcade.Sprite;
}
interface GameState {
  witches: { [id: string]: Witch };
  resources: Resource[];
  teams: Team[];
}

export default class MainScene extends Phaser.Scene {
  gameState: GameState;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  pipelineInstance: Phaser.Renderer.WebGL.WebGLPipeline;
  constructor() {
    super({ key: "MainScene" });
    this.gameState = { teams: [], witches: {}, resources: [] };
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

    const pentagram = new Pentagram(this, 1200, 400, "red_team");
    this.gameState.resources.push({
      sprite: new Mushroom(this, 200, 200, "m1"),
    });

    this.gameState.witches["bla"] = new Witch(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "bla",
      true
    );
    this.cameras.main.startFollow(
      this.gameState.witches["bla"],
      true,
      0.05,
      0.05,
      100,
      100
    );

    this.lights.enable().setAmbientColor(0x555555);

    this.cursor.down?.on("down", this.setPlayerY(200));
    this.cursor.down?.on("up", this.setPlayerY(0));
    this.cursor.up?.on("down", this.setPlayerY(-200));
    this.cursor.up?.on("up", this.setPlayerY(0));
    this.cursor.left?.on("down", this.setPlayerX(-200));
    this.cursor.left?.on("up", this.setPlayerX(0));
    this.cursor.right?.on("down", this.setPlayerX(200));
    this.cursor.right?.on("up", this.setPlayerX(0));

    this.physics.add.collider(
      this.gameState.witches["bla"],
      pentagram,
      this.collided
    );
  }

  collided = () => {
    this.gameState.witches["bla"].setVelocity(0, 0);
  };

  setPlayerY = (v: number) => () => {
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      this.gameState.witches["bla"].setVelocityY(v);
      if (v > 0) {
        this.gameState.witches["bla"].anims.play("blue_down", false);
      } else if (v < 0) {
        this.gameState.witches["bla"].anims.play("blue_up", false);
      } else if (v === 0 && this.cursor.left?.isUp && this.cursor.right?.isUp) {
        this.gameState.witches["bla"].anims.stop();
      }
    }
  };
  setPlayerX = (v: number) => () => {
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      this.gameState.witches["bla"].setVelocityX(v);
      if (v > 0) {
        this.gameState.witches["bla"].anims.play("blue_right", false);
      } else if (v < 0) {
        this.gameState.witches["bla"].anims.play("blue_left", false);
      } else if (v === 0 && this.cursor.down?.isUp && this.cursor.up?.isUp) {
        this.gameState.witches["bla"].anims.stop();
      }
    }
  };

  update(time: number) {
    // TODO: https://phaser.io/examples/v3/view/input/mouse/click-sprite
    this.pipelineInstance.setFloat1("time", time / 1000);
    Object.values(this.gameState.witches).forEach((witch: Witch) => {
      witch.update();
    });
    this.gameState.resources.forEach(({ sprite }) => {
      sprite.update();
    });
    const inRange = this.gameState.resources.filter(
      ({ sprite }) =>
        Phaser.Math.Distance.Between(
          this.gameState.witches["bla"].x,
          this.gameState.witches["bla"].y,
          sprite.x,
          sprite.y
        ) <= 200
    );
  }
}
