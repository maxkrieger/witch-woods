import * as Phaser from "phaser";
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.add.text(100, 100, "loading...", { color: "#FFFFFF" });
    this.load.spritesheet(
      "witch_blue",
      "assets/img/sprites/sprite_sheet/sprite_sheet_blue.png",
      { frameWidth: 230, frameHeight: 230 }
    );
    this.load.spritesheet(
      "witch_red",
      "assets/img/sprites/sprite_sheet/sprite_sheet_pink.png",
      { frameWidth: 230, frameHeight: 230 }
    );
    this.load.image("pentagram", [
      "assets/img/summon_circle2.png",
      "assets/img/norm.png",
    ]);
    this.load.image("icetrap_off", "assets/img/spell_icons/icetrap_off.png");
    this.load.image("icetrap_on", "assets/img/spell_icons/icetrap_on.png");
    this.load.image(
      "seeingeye_off",
      "assets/img/spell_icons/seeingeye_off.png"
    );
    this.load.image("seeingeye_on", "assets/img/spell_icons/seeingeye_on.png");
    this.load.image("teleport_off", "assets/img/spell_icons/teleport_off.png");
    this.load.image("teleport_on", "assets/img/spell_icons/teleport_on.png");
    this.load.image("ice_trap_red", "assets/img/icetrap_red.png");
    this.load.image("ice_trap_blue", "assets/img/icetrap_blue.png");
    this.load.spritesheet("ice", "assets/img/spell_sheets/icetrap_sprite.png", {
      frameWidth: 460,
      frameHeight: 460,
    });

    this.load.spritesheet(
      "eye",
      "assets/img/spell_sheets/seeingeye_sprite.png",
      {
        frameWidth: 230,
        frameHeight: 230,
      }
    );

    this.load.image("particle_blue", "assets/img/particle.png");

    this.load.spritesheet("staticResources", "assets/img/items.png", {
      frameWidth: 255,
      frameHeight: 256,
    });

    this.load.tilemapTiledJSON("level1", "assets/tilemaps/bgFull/bgFull.json");
    this.load.image("bgFull", "assets/tilemaps/bgFull/bgFull.jpg");
    this.load.image("treeSheet", "assets/img/env_static/trees/treeSheet.png");

    this.load.image("bgreeter", "assets/img/screens/loadingscreen2.png");
    this.load.image("bluelose", "assets/img/screens/bluelose.png");
    this.load.image("bluewin", "assets/img/screens/bluewin.png");
    this.load.image("redlose", "assets/img/screens/redlose.png");
    this.load.image("redwin", "assets/img/screens/redwin.png");
  }

  create() {
    this.scene.start("LobbyScene");

    /**
     * This is how you would dynamically import the mainScene class (with code splitting),
     * add the mainScene to the Scene Manager
     * and start the scene.
     * The name of the chunk would be 'mainScene.chunk.js
     * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
     */
    // let someCondition = true
    // if (someCondition)
    //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
    //     this.scene.add('MainScene', mainScene.default, true)
    //   })
    // else console.log('The mainScene class will not even be loaded by the browser')
  }
}
