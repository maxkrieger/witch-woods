import "phaser";
import MainScene from "./scenes/mainScene";
import PreloadScene from "./scenes/preloadScene";

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 720;

import { io, Socket } from "socket.io-client";
import LobbyScene from "./scenes/lobbyScene";

export const socket = io(
  process.env.NODE_ENV === "production"
    ? "wss://witch-woods.maxkrieger.repl.co"
    : // : "wss://witch-woods.maxkrieger.repl.co"
      "ws://localhost:6660"
);
socket.on("connect", () => {
  console.log("SOCKET CONNECTED", socket.connected, socket.id);
});

// Disable right click menu
window.oncontextmenu = () => false;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  backgroundColor: "#000000",
  dom: {
    createContainer: true,
  },
  scale: {
    parent: "phaser-game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  },
  scene: [PreloadScene, LobbyScene, MainScene],
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
