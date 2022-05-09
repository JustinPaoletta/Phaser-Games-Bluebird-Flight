import BaseScene from './BaseScene';

class ScoreScene extends BaseScene {
    constructor(config) {
        super('ScoreScene', { ...config, canGoBack: true });
        this.menu = [
            {scene: 'PlayScene', text: 'Play Again'},
        ]
    }

    create() {
        super.create();
        const bestScore = localStorage.getItem('bestScore');
        const currentScore = localStorage.getItem('currentScore');
        console.log(localStorage.getItem('gameOver'))
        if (localStorage.getItem('gameOver')) {
            this.add.text(...[this.config.width/2, this.config.height/3.5], `Game Over`, this.fontOptions)
            .setOrigin(0.5);
            this.add.text(...[this.config.width/2, this.config.height/2.5], `Current Score: ${currentScore}`, this.fontOptions)
            .setOrigin(0.5);
            this.createMenu(this.menu, this.setupMenuEvents.bind(this));
        }
        this.add.text(...this.screenCenter, `High Score: ${bestScore || 0}`, this.fontOptions)
            .setOrigin(0.5);
    }

    setupMenuEvents(menuItem) {
        const textGO = menuItem.textGO;
        textGO.setInteractive();
        textGO.setOrigin(0.5, -1.5);

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

export default ScoreScene;
