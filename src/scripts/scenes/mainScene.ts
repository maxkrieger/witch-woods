import {
  Facing,
  GameObject,
  GameState,
  InventoryEntry,
  Player,
  ResourceType,
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

interface GameObjects {
  sprites: { [id: string]: Phaser.Physics.Arcade.Sprite };
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
    this.load.tilemapTiledJSON(
      "level1",
      "assets/tilemaps/bgFull/bgFullJSON.json"
    );
    this.load.image("bgFull", "assets/tilemaps/bgFull/bgFullIMG.png");
  }

  create() {
    console.log(process.env.NODE_ENV);
    this.cameras.main.setBounds(0, 0, 5000, 2900);
    this.physics.world.setBounds(0, 0, 5000, 2900);
    //this.add.image(0, 0, "bg").setOrigin(0);
    //this.add.image(688, 0, "bg").setFlipX(true).setOrigin(0);
    //this.add.image(1376, 0, "bg").setOrigin(0);
    //tilemap add:
    var map = this.make.tilemap({ key: "level1" });
    //var tilesetGround = map.addTilesetImage('mapFull', 'bgFull');

    var tilesetGround = map.addTilesetImage("mapTiled", "bgFull");
    var layer = map.createStaticLayer("GroundLayer", tilesetGround);
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

    this.bluePentagram = new Pentagram(this, 920, 445, Team.BLUE);
    this.redPentagram = new Pentagram(this, 4140, 445, Team.RED);
    this.inventorySprite = new Inventory(this);
    this.requirementsSprite = new RequirementHUD(this);
    console.log(this.inventorySprite);

    // this.lights.enable().setAmbientColor(0x555555);

    // TODO: process.env
    const socket = io(
      process.env.NODE_ENV === "production"
        ? "wss://witch-woods.maxkrieger.repl.co"
        : "ws://localhost:6660"
    );
    this.socket = socket;
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.connected, socket.id);
      socket.emit("join", { name: "max", team: Team.BLUE });
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
    socket.on("removeResource", (resourceID: string) => {
      (this.gameObjects.sprites[resourceID] as Resource).healthBar.clear();
      this.gameObjects.sprites[resourceID].destroy();
      delete this.gameObjects.sprites[resourceID];
    });
    socket.on("gameState", (state: GameState) => {
      this.requirementsSprite.setRequirements(
        state.status[state.players[this.myID].team]
      );
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
          );
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
          (this.gameObjects.sprites[player.id] as Witch).onUpdate(player);
          if (player.id === this.myID) {
            this.inventorySprite.setInventoryState(player.inventory);
          }
        }
      });
    });
  }

  setChanneling = (channeling: boolean) => () => {
    const focused = this.registry.get("focusedResource");
    if (focused !== null) {
      this.socket.emit("channelResource", { id: focused, channeling });
    }
  };

  setPlayerY = (v: number) => () => {
    const me = this.gameObjects.sprites[this.myID] as Witch;
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      me.setVelocityY(v);
      if (v > 0) {
        me.setMoving(true);
        me.setFacing(Facing.DOWN);
      } else if (v < 0) {
        me.setMoving(true);
        me.setFacing(Facing.UP);
      } else if (v === 0 && this.cursor.left?.isUp && this.cursor.right?.isUp) {
        me.setMoving(false);
      }
    }
  };

  setPlayerX = (v: number) => () => {
    const me = this.gameObjects.sprites[this.myID] as Witch;
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      me.setVelocityX(v);
      if (v > 0) {
        me.setMoving(true);
        me.setFacing(Facing.RIGHT);
      } else if (v < 0) {
        me.setMoving(true);
        me.setFacing(Facing.LEFT);
      } else if (v === 0 && this.cursor.down?.isUp && this.cursor.up?.isUp) {
        me.setMoving(false);
      }
    }
  };

  setFocusedResource = (id: string | null) => {
    if (this.registry.get("focusedResource") !== id) {
      this.setChanneling(false);
      this.registry.set("focusedResource", id);
    }
  };

  update(time: number) {
    // TODO: https://phaser.io/examples/v3/view/input/mouse/click-sprite
    if (this.myID) {
      Object.values(this.gameObjects.sprites).forEach((sprite) => {
        sprite.update();
      });
      const inRange = Object.values(this.gameObjects.sprites)
        .filter((sprite: any) => sprite.isResource)
        .map(({ id }: any) => ({
          dist: Phaser.Math.Distance.Between(
            this.gameObjects.sprites[this.myID].x,
            this.gameObjects.sprites[this.myID].y,
            this.gameObjects.sprites[id].x,
            this.gameObjects.sprites[id].y
          ),
          id,
        }))
        .sort((a, b) => a.dist - b.dist);
      if (inRange.length > 0) {
        this.setFocusedResource(inRange[0].dist <= 200 ? inRange[0].id : null);
      } else {
        this.setFocusedResource(null);
      }
      const myPentagram =
        this.myTeam === Team.RED ? this.redPentagram : this.bluePentagram;
      const pentagramRange = Phaser.Math.Distance.Between(
        this.gameObjects.sprites[this.myID].x,
        this.gameObjects.sprites[this.myID].y,
        myPentagram.x,
        myPentagram.y
      );
      if (pentagramRange <= 200) {
        this.setPentagramInRange(true);
      } else {
        this.setPentagramInRange(false);
      }
    }
    this.children.bringToTop(this.inventorySprite);
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
