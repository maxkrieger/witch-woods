import {
  GameState,
  InventoryEntry,
  Player,
  ResourceType,
} from "../../gamestate";
import Mushroom from "../objects/mushroom";
import Pentagram from "../objects/pentagram";
import Resource from "../objects/Resource";
import Witch from "../objects/witch";
import { io } from "socket.io-client";

interface GameObjects {
  sprites: { [id: string]: Phaser.Physics.Arcade.Sprite };
  inventory: InventoryEntry[];
}

export default class MainScene extends Phaser.Scene {
  gameObjects: GameObjects;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  movementSendInterval: Phaser.Time.TimerEvent;
  myID: string;
  constructor() {
    super({ key: "MainScene" });
    this.gameObjects = {
      sprites: {},
      inventory: [],
    };
  }
  preload() {
    this.load.image("bg", ["assets/img/bg.png", "assets/img/norm.png"]);
  }

  create() {
    this.cameras.main.setBounds(0, 0, 5000, 5000);
    this.physics.world.setBounds(0, 0, 5000, 5000);
    this.add.image(0, 0, "bg").setOrigin(0);
    this.add.image(688, 0, "bg").setFlipX(true).setOrigin(0);
    this.add.image(1376, 0, "bg").setOrigin(0);

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

    const pentagram = new Pentagram(this, 1200, 400, "red_team");

    // this.lights.enable().setAmbientColor(0x555555);

    // this.physics.add.collider(this.gameObjects.sprites["bla"], pentagram);
    const socket = io("ws://localhost:6660");
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED", socket.connected, socket.id);
      socket.emit("join", { name: "max", team: "RED" });
    });
    socket.on("myPlayer", (player: Player) => {
      this.myID = player.id;
      this.movementSendInterval = this.time.addEvent({
        delay: 50,
        callback: () => {
          const { x, y } = this.gameObjects.sprites[player.id];
          socket.emit("move", { x, y });
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
    socket.on("gameState", (state: GameState) => {
      Object.values(state.objects).forEach((resource) => {
        if (!(resource.id in this.gameObjects.sprites)) {
          switch (resource.resourceType) {
            case ResourceType.MUSHROOM:
              this.gameObjects.sprites[resource.id] = new Mushroom(
                this,
                resource.x,
                resource.y,
                resource.id
              );
              break;
            case ResourceType.GEM:
              break;
          }
        }
      });
      Object.values(state.players).forEach((player) => {
        if (!(player.id in this.gameObjects.sprites)) {
          this.gameObjects.sprites[player.id] = new Witch(
            this,
            player.x,
            player.y,
            player.id,
            player.id === this.myID
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
        }
      });
    });
  }

  setChanneling = (channeling: boolean) => () => {
    const focused = this.registry.get("focusedResource");
    if (focused !== null) {
      (this.gameObjects.sprites[focused] as Resource).setChanneling(channeling);
    }
  };

  setPlayerY = (v: number) => () => {
    if (v !== 0 || (!this.cursor.down?.isDown && !this.cursor.up?.isDown)) {
      this.gameObjects.sprites[this.myID].setVelocityY(v);
      if (v > 0) {
        this.gameObjects.sprites[this.myID].anims.play("blue_down", true);
      } else if (v < 0) {
        this.gameObjects.sprites[this.myID].anims.play("blue_up", true);
      } else if (v === 0 && this.cursor.left?.isUp && this.cursor.right?.isUp) {
        this.gameObjects.sprites[this.myID].anims.stop();
      }
    }
  };

  setPlayerX = (v: number) => () => {
    if (v !== 0 || (!this.cursor.left?.isDown && !this.cursor.right?.isDown)) {
      this.gameObjects.sprites[this.myID].setVelocityX(v);
      if (v > 0) {
        this.gameObjects.sprites[this.myID].anims.play("blue_right", true);
      } else if (v < 0) {
        this.gameObjects.sprites[this.myID].anims.play("blue_left", true);
      } else if (v === 0 && this.cursor.down?.isUp && this.cursor.up?.isUp) {
        this.gameObjects.sprites[this.myID].anims.stop();
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
    Object.values(this.gameObjects.sprites).forEach((sprite) => {
      sprite.update();
    });
    if (this.myID) {
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
    }
  }
}
