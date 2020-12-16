export default class WinLoseScene extends Phaser.Scene {
  constructor() {
    super({ key: "WinLoseScene" });
  }
  myName: string;
  message = "";
  preload() {}
  init({ name, message }: any) {
    this.myName = name;
    this.message = message;
  }
  create() {
    this.add.image(0, 0, this.message).setOrigin(0);

    this.cameras.main.setBackgroundColor("#000000");
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");
    button1.innerHTML = "rejoin next match";
    button1.onclick = () => {
      if (this.scene.isActive("MainScene")) {
        (this.scene.get("MainScene") as any).connect();
      }
      this.scene.start("MainScene", { name: this.myName });
      return false;
    };
    button2.innerHTML = "main menu";
    button2.onclick = () => {
      this.scene.start("LobbyScene", { name: this.myName });
      return false;
    };

    const container = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    const el = this.add.dom(0, 0, button1);
    const el2 = this.add.dom(100, 0, button2);
    container.add([el, el2]);
  }
}
