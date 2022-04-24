import Phaser from 'phaser';

class BaseScene extends Phaser.Scene {
    constructor(key, config) {
        super(key)
        this.config = config;
        this.screenCenter = [config.width/2, config.height/2];
        this.fontSize = 34;
        this.lineHeight = 42;
        this.fontOptions = {fontSize: `${this.fontSize}px`, fill: '#FFF'};
    }

    create() {
        this.add.image(0, 0, 'sky').setOrigin(0);

        if (this.config.canGoBack) {
            this.createBackButton();
        }
    }

    createMenu(menu, setupMenuEvents) {
        let lastMenuPositionY = 0;

       menu.forEach((item) => {
           const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
           item.textGO = this.add.text(...menuPosition, item.text, this.fontOptions).setOrigin(0.5, 1)
           lastMenuPositionY += this.lineHeight;
           setupMenuEvents(item);
       })
    }

    createBackButton() {
        const backButton = this.add.image(this.config.width - 10, this.config.height - 10, 'back')
        .setInteractive()
        .setScale(2)
        .setOrigin(1);
 
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        })
     }
}

export default BaseScene;