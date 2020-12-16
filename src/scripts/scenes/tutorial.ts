export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: "TutorialScene" });
  }
  currentSlide = 1;
  preload() {}
  init() {
    this.currentSlide = 1;
  }
  create() {
    const img = this.add.image(0, 0, "tut1").setOrigin(0);

    this.cameras.main.setBackgroundColor("#000000");
    this.input.on("pointerdown", () => {
      if (this.currentSlide >= 7) {
        this.currentSlide = 1;
        this.scene.start("LobbyScene");
        return;
      }
      this.currentSlide++;
      img.setTexture(`tut${this.currentSlide}`);
    });
  }
}
