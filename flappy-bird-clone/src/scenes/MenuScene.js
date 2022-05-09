import BaseScene from './BaseScene';

class MenuScene extends BaseScene {
    constructor(config) {
        super('MenuScene', config),
        this.menu = [
            {scene: 'PlayScene', text: 'Play'},
            {scene: 'ScoreScene', text: 'High Score'},
        ]
    }

    create() {
        super.create();
        const image = this.add.image(400, 150, "title");
        image.setScale(.5);

        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', {start: 8, end: 15}),
            // 24 fps default, it will play animation consisting of 24 frames in 1 sec
            frameRate: 8,
            // repeat infinitely
            repeat: -1
        });

        
        this.bird = this.physics.add.sprite(400, 230, 'bird')
        .setFlipX(true)
        .setScale(3);

        this.bird.play('fly');

        this.createMenu(this.menu, this.setupMenuEvents.bind(this));
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();

        textGO.on('pointerover', () => {
            textGO.setStyle({fill: '#ff0'});
        });

        textGO.on('pointerout', () => {
            textGO.setStyle({fill: '#fff'});
        });

        textGO.on('pointerup', () => {
            menuItem.scene && this.scene.start(menuItem.scene);
        });
    }
}

export default MenuScene;
