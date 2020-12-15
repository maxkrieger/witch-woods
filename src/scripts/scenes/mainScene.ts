import {
  Ability,
  Facing,
  GameObject,
  GameState,
  InventoryEntry,
  Player,
  ResourceType,
  resourceTypes,
  Team,
} from "../../gamestate";
import Mushroom from "../objects/staticResource";
import Pentagram from "../objects/pentagram";
import Resource from "../objects/Resource";
import Witch from "../objects/witch";
import { io, Socket } from "socket.io-client";
import Inventory from "../objects/inventory";
import StaticResource from "../objects/staticResource";
import RequirementHUD from "../objects/requirementHUD";
import IceTrap from "../objects/icetrap";
import { UP } from "phaser";

export const KEYS = ["Z", "X", "C", "V"];
interface GameObjects {
  sprites: { [id: string]: Phaser.GameObjects.Sprite };
  inventory: InventoryEntry[];
}

export default class MainScene extends Phaser.Scene {
  gameObjects: GameObjects;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  movementSendInterval: Phaser.Time.TimerEvent;
  myID: string;
  myTeam: Team;
  socket: Socket;
  inventorySprite: Inventory;
  requirementsSprite: RequirementHUD;
  bluePentagram: Pentagram;
  redPentagram: Pentagram;
  pentagramInRange: boolean;
  particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
  debugText: Phaser.GameObjects.Text;
  infoText: Phaser.GameObjects.Text;
  nearTrap: string | null = null;
  placingTrapSlot = -1;
  constructor() {
    super({ key: "MainScene" });
    this.gameObjects = {
      sprites: {},
      inventory: [],
    };
  }
  preload() {
    this.load.image("bg", ["assets/img/bg.png", "assets/img/norm.png"]);

    //load tilemap stuff
    this.load.tilemapTiledJSON("level1", "assets/tilemaps/bgFull/bgFull.json");
    this.load.image("bgFull", "assets/tilemaps/bgFull/bgFull.jpg");
    this.load.image("treeSheet", "assets/img/env_static/trees/treeSheet.png");
  }

  create() {
    console.log(process.env.NODE_ENV);

    this.cameras.main.setBounds(0, 0, 10000, 5800);
    this.physics.world.setBounds(0, 0, 10000, 5800);
    //tilemap add:
    var map = this.make.tilemap({ key: "level1" });
    //var tilesetGround = map.addTilesetImage('mapFull', 'bgFull');
    var tilesetGround = map.addTilesetImage("mapTiled", "bgFull");
    var layer = map.createStaticLayer("Ground", tilesetGround);

    //layer.scale = 4;

    this.cursor = this.input.keyboard.createCursorKeys();
    this.cursor.down?.setEmitOnRepeat(true);
    this.cursor.up?.setEmitOnRepeat(true);
    this.cursor.right?.setEmitOnRepeat(true);
    this.cursor.left?.setEmitOnRepeat(true);
    this.cursor.space?.setEmitOnRepeat(false);

    this.cursor.space?.on("down", this.setChanneling(true));
    this.cursor.space?.on("up", this.setChanneling(false));
    this.cursor.down?.on("down", this.setPlayerY(300));
    this.cursor.down?.on("up", this.setPlayerY(0));
    this.cursor.up?.on("down", this.setPlayerY(-300));
    this.cursor.up?.on("up", this.setPlayerY(0));
    this.cursor.left?.on("down", this.setPlayerX(-300));
    this.cursor.left?.on("up", this.setPlayerX(0));
    this.cursor.right?.on("down", this.setPlayerX(300));
    this.cursor.right?.on("up", this.setPlayerX(0));

    this.bluePentagram = new Pentagram(this, 1776, 1024, Team.BLUE);
    this.redPentagram = new Pentagram(this, 8400, 1024, Team.RED);
    this.inventorySprite = new Inventory(this);
    this.requirementsSprite = new RequirementHUD(this);
    this.particles = this.add.particles("particle_blue");

    const spellKeys = this.input.keyboard.addKeys(KEYS.join(",")) as any;
    spellKeys.Z?.on("down", this.handleSpellKey(0));
    spellKeys.X?.on("down", this.handleSpellKey(1));
    spellKeys.C?.on("down", this.handleSpellKey(2));
    spellKeys.V?.on("down", this.handleSpellKey(3));

    this.input.on("pointerdown", this.handleClick);

    // this.lights.enable().setAmbientColor(0x555555);

    const socket = io(
      process.env.NODE_ENV === "production"
        ? "wss://witch-woods.maxkrieger.repl.co"
        : // : "wss://witch-woods.maxkrieger.repl.co"
          "ws://localhost:6660"
    );
    this.socket = socket;
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.connected, socket.id);
      socket.emit("join", { name: "max" });
    });
    socket.on("myPlayer", (player: Player) => {
      this.myID = player.id;
      this.myTeam = player.team;
      this.movementSendInterval = this.time.addEvent({
        delay: 100,
        callback: () => {
          const { x, y, facing, moving } = this.gameObjects.sprites[
            player.id
          ] as Witch;
          socket.emit("move", { x, y, facing, moving });
        },
        callbackScope: this,
        loop: true,
        paused: false,
      });
    });
    socket.on("removePlayer", (playerID: string) => {
      this.gameObjects.sprites[playerID].destroy();
      delete this.gameObjects.sprites[playerID];
    });
    socket.on("removeTrap", (trapID: string) => {
      this.gameObjects.sprites[trapID].destroy();
      delete this.gameObjects.sprites[trapID];
    });
    socket.on("removeResource", (resourceID: string) => {
      (this.gameObjects.sprites[resourceID] as Resource).healthBar.clear();
      this.gameObjects.sprites[resourceID].destroy();
      delete this.gameObjects.sprites[resourceID];
    });
    socket.on("explode", ({ x, y }: { x: number; y: number }) => {
      this.particleEmit(x, y);
    });
    socket.on(
      "tellMessage",
      ({ message, id }: { message: string; id: string }) => {
        if (id === "" || this.myID === id) {
          this.displayInfoMessage(message, 2000);
        }
      }
    );
    socket.on("gameState", (state: GameState) => {
      this.requirementsSprite.setRequirements(
        state.status[state.players[this.myID].team]
      );
      Object.values(state.traps).forEach((trap) => {
        if (!(trap.id in this.gameObjects.sprites)) {
          this.gameObjects.sprites[trap.id] = new IceTrap(
            this,
            trap.x,
            trap.y,
            trap.team,
            trap.id
          );

          const me = this.gameObjects.sprites[this.myID] as Witch;
          if (
            trap.team !== this.myTeam &&
            (!me || me.effect.kind !== "seeing_eye")
          ) {
            this.gameObjects.sprites[trap.id].setVisible(false);
          }
        }
      });
      Object.values(state.objects).forEach((resource) => {
        if (!(resource.id in this.gameObjects.sprites)) {
          this.gameObjects.sprites[resource.id] = new StaticResource(
            this,
            resource
          );
        } else {
          (this.gameObjects.sprites[resource.id] as Resource).onUpdate(
            resource
          );
        }
      });
      Object.values(state.players).forEach((player) => {
        if (!(player.id in this.gameObjects.sprites)) {
          this.gameObjects.sprites[player.id] = new Witch(
            this,
            player.x,
            player.y,
            player.id,
            player.id === this.myID,
            player.team
          ).setDepth(1);
          if (player.id === this.myID) {
            this.cameras.main.startFollow(
              this.gameObjects.sprites[this.myID],
              true,
              0.05,
              0.05,
              100,
              100
            );
          }
        } else {
          const me = this.gameObjects.sprites[player.id] as Witch;
          if (
            me.effect.kind !== "seeing_eye" &&
            player.effect.kind === "seeing_eye"
          ) {
            // show all enemy traps
            Object.entries(this.gameObjects.sprites).forEach(
              ([id, spr]: [string, any]) => {
                if (spr.isTrap && spr.team !== this.myTeam) {
                  spr.setVisible(true);
                  this.particleEmit(spr.x, spr.y);
                }
              }
            );
          } else if (
            player.effect.kind !== "seeing_eye" &&
            me.effect.kind === "seeing_eye"
          ) {
            Object.entries(this.gameObjects.sprites).forEach(
              ([id, spr]: [string, any]) => {
                if (spr.isTrap && spr.team !== this.myTeam) {
                  spr.setVisible(false);
                }
              }
            );
          }
          me.onUpdate(player);
          if (player.id === this.myID) {
            this.inventorySprite.setInventoryState(player.inventory);
          }
        }
      });
    });

    var tilesetTrees = map.addTilesetImage("treesTiled", "treeSheet");
    var layer = map.createStaticLayer("Trees", tilesetTrees);
    layer.setDepth(2);

    this.debugText = new Phaser.GameObjects.Text(this, 10, 10, `connecting`, {
      color: "#FFFFFF",
    })
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100);
    this.add.existing(this.debugText);
    if (process.env.NODE_ENV !== "development") {
      this.debugText.setVisible(false);
    }

    this.infoText = new Phaser.GameObjects.Text(
      this,
      this.cameras.main.width / 2,
      50,
      ``,
      {
        color: "#FFFFFF",
        fontSize: "50px",
        align: "center",
      }
    )
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(100);
    this.add.existing(this.infoText);
  }
  handleClick = (pointer: any) => {
    const { worldX, worldY } = pointer;
    if (this.placingTrapSlot > -1) {
      const enemyPentagram =
        this.myTeam === Team.RED ? this.bluePentagram : this.redPentagram;
      const dist = Phaser.Math.Distance.Between(
        enemyPentagram.x,
        enemyPentagram.y,
        worldX,
        worldY
      );
      if (dist >= 400) {
        this.displayInfoMessage("");
        this.socket.emit("placeTrap", {
          player: this.myID,
          x: worldX,
          y: worldY,
          slot: this.placingTrapSlot,
        });
        this.placingTrapSlot = -1;
      } else {
        this.displayInfoMessage("trap too close to enemy base!", 4000);
      }
    }
  };

  displayInfoMessage = (message: string, time?: number) => {
    this.infoText.setText(message);
    if (time) {
      this.time.addEvent({
        delay: time,
        callback: () => {
          this.infoText.setText("");
        },
        callbackScope: this,
      });
    }
  };

  handleSpellKey = (key: number) => () => {
    const slotKey = this.inventorySprite.inventoryState[key];
    if (
      slotKey !== null &&
      slotKey !== undefined &&
      slotKey.cooldown === 0 &&
      (this.gameObjects.sprites[this.myID] as Witch).effect.kind !==
        "ice_trapped"
    ) {
      switch (resourceTypes[slotKey.resourceType].ability) {
        case Ability.NONE:
          break;
        case Ability.ICE_TRAP:
          if (this.placingTrapSlot < 0) {
            this.placingTrapSlot = key;
            this.displayInfoMessage("Click to place a trap");
          }
          break;
        case Ability.TELEPORT:
          const myPentagram =
            this.myTeam === Team.RED ? this.redPentagram : this.bluePentagram;
          this.gameObjects.sprites[this.myID].setPosition(
            myPentagram.x,
            myPentagram.y
          );
          this.socket.emit("teleport", {
            player: this.myID,
            slot: key,
            x: myPentagram.x,
            y: myPentagram.y,
          });
          break;
        case Ability.SEEING_EYE:
          this.socket.emit("seeingEye", { player: this.myID, slot: key });
          break;
        default:
          break;
      }
    }
  };

  setChanneling = (channeling: boolean) => () => {
    const focused = this.registry.get("focusedResource");

    if (focused !== null) {
      this.socket.emit("channelResource", { id: focused, channeling });
    }
  };

  setPlayerY = (v: number) => () => {
    const me = this.gameObjects.sprites[this.myID] as Witch;
    if (me.effect.kind === "ice_trapped") {
      return;
    }
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      me.setVelocityY(v);
      if (v > 0) {
        me.setMoving(true);
        me.setFacing(Facing.DOWN);
      } else if (v < 0) {
        me.setMoving(true);
        me.setFacing(Facing.UP);
      } else if (v === 0) {
        if (this.cursor.left?.isDown) {
          me.setFacing(Facing.LEFT);
        } else if (this.cursor.right?.isDown) {
          me.setFacing(Facing.RIGHT);
        } else {
          me.setMoving(false);
        }
      }
    }
  };

  setPlayerX = (v: number) => () => {
    const me = this.gameObjects.sprites[this.myID] as Witch;
    if (me.effect.kind === "ice_trapped") {
      return;
    }
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      me.setVelocityX(v);
      if (v > 0) {
        me.setMoving(true);
        me.setFacing(Facing.RIGHT);
      } else if (v < 0) {
        me.setMoving(true);
        me.setFacing(Facing.LEFT);
      } else if (v === 0) {
        if (this.cursor.down?.isDown) {
          me.setFacing(Facing.DOWN);
        } else if (this.cursor.up?.isDown) {
          me.setFacing(Facing.UP);
        } else {
          me.setMoving(false);
        }
      }
    }
  };

  setFocusedResource = (id: string | null) => {
    if (this.registry.get("focusedResource") !== id) {
      this.setChanneling(false);
      this.registry.set("focusedResource", id);
    }
  };
  particleEmit = (x: number, y: number) => {
    const emitter = this.particles.createEmitter({
      x,
      y,
      speed: { min: 0, max: 900 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      blendMode: Phaser.BlendModes.ADD,
    });

    emitter.setEmitZone({
      type: "random",
      source: new Phaser.Geom.Ellipse(0, 0, 200, 50),
    } as any);
    emitter.explode(30, x, y);
  };
  update(time: number) {
    if (!this.myID) {
      return;
    }
    const myPlayer = this.gameObjects.sprites[this.myID];
    if (!myPlayer) {
      return;
    }
    this.debugText.setText(
      `DEBUG: ${Math.floor(this.game.loop.actualFps)}fps, x: ${myPlayer.x} y: ${
        myPlayer.y
      }`
    );

    Object.values(this.gameObjects.sprites).forEach((sprite) => {
      sprite.update();
    });
    const inRange = Object.values(this.gameObjects.sprites)
      .map(({ id, isResource, isTrap, team }: any) => ({
        dist: Phaser.Math.Distance.Between(
          myPlayer.x,
          myPlayer.y,
          this.gameObjects.sprites[id].x,
          this.gameObjects.sprites[id].y
        ),
        id,
        isResource,
        isTrap,
        team,
      }))
      .sort((a, b) => a.dist - b.dist);
    const resourcesInRange = inRange.filter(({ isResource }) => isResource);
    if (resourcesInRange.length > 0) {
      this.setFocusedResource(
        resourcesInRange[0].dist <= 200 ? resourcesInRange[0].id : null
      );
    } else {
      this.setFocusedResource(null);
    }
    const trapsInRange = inRange.filter(
      ({ isTrap, team }) => isTrap && team !== this.myTeam
    );
    if (
      trapsInRange.length > 0 &&
      trapsInRange[0].dist <= 150 &&
      this.nearTrap !== trapsInRange[0].id
    ) {
      this.nearTrap = trapsInRange[0].id;
      this.socket.emit("activateTrap", {
        player: this.myID,
        trap: trapsInRange[0].id,
      });
    }
    const myPentagram =
      this.myTeam === Team.RED ? this.redPentagram : this.bluePentagram;
    const pentagramRange = Phaser.Math.Distance.Between(
      myPlayer.x,
      myPlayer.y,
      myPentagram.x,
      myPentagram.y
    );
    if (pentagramRange <= 200) {
      this.setPentagramInRange(true);
    } else {
      this.setPentagramInRange(false);
    }
  }
  setPentagramInRange = (inRange: boolean) => {
    if (inRange !== this.pentagramInRange) {
      this.pentagramInRange = inRange;
      if (inRange) {
        this.socket.emit("dumpItems");
      }
    }
  };
}
