export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: "LobbyScene" });
  }
  preload() {
    this.load.image("bgreeter", "assets/img/screens/loadingscreen2.png");
  }
  create() {
    this.add.image(0, 0, "bgreeter").setOrigin(0);
    this.cameras.main.setBackgroundColor("#000000");

    const form = document.createElement("form");

    const inp = document.createElement("input");
    inp.setAttribute("type", "text");
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
      this.scene.start("MainScene", { name: inp.value });
      return false;
    };
    form.appendChild(inp);
    form.appendChild(sub);
    const container = this.add.container(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    const el = this.add.dom(0, 0, form);
    container.add(el);
  }
}
