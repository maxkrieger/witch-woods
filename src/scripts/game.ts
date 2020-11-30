import "phaser";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";
import PhaserNavMeshPlugin from "./plugins/phaser-navmesh.min";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

// Disable right click menu
window.oncontextmenu = () => false;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: "#000000",
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, MainScene],
  plugins: {
    scene: [
      {key: "NavMeshPlugin", plugin: PhaserNavMeshPlugin, mapping: "navMeshPlugin", start: true}
    ]
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
    },
  },
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});
