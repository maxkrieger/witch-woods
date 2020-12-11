import * as Phaser from "phaser";
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    this.load.image("witch", ["assets/img/witch1.png", "assets/img/norm.png"]);
    this.load.spritesheet(
      "witch_blue",
      "assets/img/sprites/sprite_sheet/sprite_sheet_blue.png",
      { frameWidth: 230, frameHeight: 230 }
    );
    this.load.image("pentagram", [
      "assets/img/summon_circle.png",
      "assets/img/norm.png",
    ]);

    this.load.spritesheet("staticResources", "assets/img/arden_assets.png", {
      frameWidth: 500,
      frameHeight: 500,
    });
  }

  create() {
    this.scene.start("MainScene");

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
