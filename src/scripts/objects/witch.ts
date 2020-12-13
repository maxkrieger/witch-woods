import { isEqual } from "lodash";
import { BlendModes, Geom } from "phaser";
import { Facing, Player, Team } from "../../gamestate";

export default class Witch extends Phaser.Physics.Arcade.Sprite {
  isMe: boolean;
  id: string;
  currentTween?: Phaser.Tweens.Tween;
  facing: Facing;
  moving: boolean;
  prevState: Player;
  team: Team;
  particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    isMe: boolean,
    team: Team
  ) {
    super(scene, x, y, `witch_${team}`);
    this.team = team;
    this.isMe = isMe;
    this.id = id;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.enable = true;
    this.particles = this.scene.add.particles("particle_blue");

    // TODO: set collision
    // this.body.setSize()
    this.setCollideWorldBounds(true);
    this.moving = false;
    this.facing = Facing.RIGHT;

    scene.anims.create({
      key: "blue_right",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_left",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_up",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 4,
        end: 6,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "blue_down",
      frames: scene.anims.generateFrameNumbers("witch_blue", {
        start: 7,
        end: 10,
      }),
      repeat: -1,
      frameRate: 10,
    });

    scene.anims.create({
      key: "red_right",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 0,
        end: 1,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_left",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 2,
        end: 3,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_up",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 4,
        end: 6,
      }),
      repeat: -1,
      frameRate: 10,
    });
    scene.anims.create({
      key: "red_down",
      frames: scene.anims.generateFrameNumbers("witch_red", {
        start: 7,
        end: 10,
      }),
      repeat: -1,
      frameRate: 10,
    });
    this.anims.play(`${team}_${this.facing}`);
    this.anims.pause();
  }

  onUpdate = (player: Player) => {
    if (isEqual(this.prevState, player)) {
      return;
    }
    this.prevState = player;
    if (!this.isMe) {
      this.setMoving(player.moving);
      this.setFacing(player.facing);
      if ((player.x !== this.x || player.y !== this.y) && !this.currentTween) {
        this.currentTween = this.scene.add.tween({
          targets: this,
          x: player.x,
          y: player.y,
          ease: "Linear",
          duration: 75,
          onComplete: () => {
            this.currentTween = undefined;
          },
        });
      }
    }
  };
  setFacing = (facing: Facing) => {
    if (this.moving && facing != this.facing) {
      this.anims.play(`${this.team}_${facing}`, true);
    }
    this.facing = facing;
  };
  setMoving = (moving: boolean) => {
    if (!moving && this.moving) {
      this.anims.pause();
    } else if (moving && !this.moving) {
      this.anims.resume();
    }
    this.moving = moving;
  };
  particleEmit = () => {
    const emitter = this.particles.createEmitter({
      x: this.x,
      y: this.y,
      speed: { min: 0, max: 900 },
      scale: { start: 1, end: 0 },
      lifespan: 200,
      blendMode: BlendModes.ADD,
    });

    emitter.setEmitZone({
      type: "edge",
      source: new Geom.Ellipse(0, 0, 200, 50),
    } as any);
    emitter.explode(100, this.x, this.y);
  };
  update = () => {};
}
