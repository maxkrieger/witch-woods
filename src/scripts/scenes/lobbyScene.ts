export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }
  myName: string;
  message = "";
  preload() {
    this.load.audio("music", "assets/sound/ambient.m4a");
  }
  init({ name, message }: any) {
    if (name) {
      this.myName = name;
    }
    if (message) {
      this.message = message;
    }
  }
  create() {
    this.add.image(0, 0, "bgreeter").setOrigin(0);
    this.add.text(100, 100, this.message, {
      fontSize: "20px",
      color: "#FFFFFF",
    });
    this.cameras.main.setBackgroundColor("#000000");

    const form = document.createElement("form");

    const inp = document.createElement("input");
    inp.setAttribute("type", "text");
    if (this.myName) {
      inp.setAttribute("value", this.myName);
    }
    inp.style.backgroundColor = "#000000";
    inp.style.color = "#FFFFFF";
    inp.id = "nameInput";
    inp.setAttribute("placeholder", "your name");
    inp.setAttribute("maxLength", "30");
    const sub = document.createElement("input");
    sub.setAttribute("type", "submit");
    sub.value = "join!";
    form.onsubmit = (e) => {
      e.preventDefault();
      if (inp.value === "") {
        return false;
      }
      if (this.scene.isActive("MainScene")) {
        (this.scene.get("MainScene") as any).connect();
      }
      this.scene.start("MainScene", { name: inp.value });
      return false;
    };
    form.appendChild(inp);
    form.appendChild(sub);
    const container = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100
    );
    const btn = document.createElement("button");
    btn.innerHTML = "tutorial";
    btn.onclick = () => {
      this.scene.start("TutorialScene");
    };
    const el = this.add.dom(0, 0, form);
    const el1 = this.add.dom(0, 40, btn);
    container.add([el, el1]);

    this.sound.play("music");
  }
}
