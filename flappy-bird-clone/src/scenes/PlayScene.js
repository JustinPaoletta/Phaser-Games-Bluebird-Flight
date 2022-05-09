import BaseScene from './BaseScene';

class PlayScene extends BaseScene {
    constructor(config) {
        super('PlayScene', config);
        this.bird = null;
        this.isPaused = false;
        this.flapVelocity = 300;
        this.initialBirdPosition = { x: config.width * 0.1, y: config.height / 2 };
        this.pipes = null;
        this.PIPES_TO_RENDER = 4;

        this.score = 0;
        this.scoreText = '';

        this.currentDifficulty = 'easy';

        this.difficulties = {
            'easy': {
                pipeHorizontalDistanceRange: [300, 350],
                pipeVerticalDistanceRange: [150, 200],
            },
            'normal': {
                pipeHorizontalDistanceRange: [280, 330],
                pipeVerticalDistanceRange: [140, 190],
            },
            'hard': {
                pipeHorizontalDistanceRange: [250, 310],
                pipeVerticalDistanceRange: [120, 170],
            },
        }
    }

    create() {
        super.create();
        this.createBird();
        this.createPipes();
        this.handleInputs();
        this.createScore();
        this.createColliders();
        this.createPause();
        this.listenToEvents();
        this.playMusic();

        if (!this.sound.get('flap')) {
            this.sound.add('flap');
        }

        if (!this.sound.get('splat')) {
            this.sound.add('splat');
        }


        this.anims.create({
            key: 'fly',
            frames: this.anims.generateFrameNumbers('bird', { start: 8, end: 15 }),
            // 24 fps default, it will play animation consisting of 24 frames in 1 sec
            frameRate: 8,
            // repeat infinitely
            repeat: -1
        });

        this.bird.play('fly');
    }

    update() {
        this.checkGameStatus();
        this.recyclePipes();
    }

    playMusic() {
        let theme;
        if (!this.sound.get('theme')) {
            theme = this.sound.add('theme');
        } else {
            theme = this.sound.get('theme');
        }
        theme.play({ loop: true, volume: 0.15 });
    }

    listenToEvents() {
        if (this.pauseEvent) return;
        this.pauseEvent = this.events.on('resume', () => {
            this.initialTime = 3;
            this.countDownText = this.add.text(...this.screenCenter, 'Fly in ' + this.initialTime, this.fontOptions)
                .setOrigin(0.5);
            this.timedEvent = this.time.addEvent({
                delay: 1000,
                callback: () => this.countDown(),
                callbackScope: this,
                loop: true
            })
        });
    }

    countDown() {
        this.initialTime--;
        this.countDownText.setText('Fly in: ' + this.initialTime);
        if (this.initialTime <= 0) {
            this.isPaused = false;
            this.playMusic();
            this.countDownText.setText('');
            this.physics.resume();
            this.timedEvent.remove();
        }
    }

    checkGameStatus() {
        if ((this.bird.y >= 540) || this.bird.y <= 0) {
            this.gameOver();
        }
    }

    createBackground() {
        this.add.image(this.config.width / 2, this.config.height / 2, 'sky');
    }

    createBird() {
        this.bird = this.physics.add.sprite(this.config.startPosition.x, this.config.startPosition.y, 'bird')
            .setFlipX(true)
            .setScale(3)
            .setOrigin(0);

        this.bird.setBodySize(this.bird.width, this.bird.height - 6);
        this.bird.body.gravity.y = 600;
        this.bird.setCollideWorldBounds(true);
    }

    createPipes() {
        this.pipes = this.physics.add.group();

        for (let i = 0; i < this.PIPES_TO_RENDER; i++) {
            const topPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable().setOrigin(0, 1);
            const bottomPipe = this.pipes.create(0, 0, 'pipe')
                .setImmovable().setOrigin(0, 0);

            this.placePipe(topPipe, bottomPipe);
        }

        this.pipes.setVelocityX(-200);
    }

    createScore() {
        this.score = 0;
        const bestScore = localStorage.getItem('bestScore');
        this.scoreText = this.add.text(16, 16, `Score ${0}`, {
            fontSize: '32px',
            fill: '#000',
            backgroundColor: 'rgba(255,255,255,0.5)',
            fixedWidth: 200,
            align: 'center',
            fixedHeight: 90,
        }).setPadding(8, 8)
        this.add.text(16, 70, `Best score: ${bestScore || 0}`,
            { 
                fontSize: '18px',
                fill: '#000',
                backgroundColor: 'rgba(255,255,255,0.7)',
                fixedWidth: 200,
                align: 'center', 
            });
    }

    createPause() {
        this.isPaused = false;
        const pauseButton = this.add.image(this.config.width - 10, this.config.height - 10, 'pause')
            .setInteractive()
            .setScale(3)
            .setOrigin(1);

        pauseButton.on('pointerdown', () => {
            this.isPaused = true;
            this.sound.stopAll();
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('PauseScene');
        });

        var pauseKey = this.input.keyboard.addKey('Q');
        pauseKey.on('down', () => {
            this.isPaused = true;
            this.sound.stopAll();
            this.physics.pause();
            this.scene.pause();
            this.scene.launch('PauseScene');
        });
    }

    createColliders() {
        this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
    }

    flap() {
        if (this.isPaused) return;
        this.bird.body.velocity.y = -this.flapVelocity;
        this.sound.get('flap').play({ loop: false });
    }

    increaseScore() {
        this.score++;
        this.scoreText.setText(`Score ${this.score}`)
    }

    getRightMostPipe() {
        let rightMostPipe = 0;

        this.pipes.getChildren().forEach((pipe) => {
            rightMostPipe = Math.max(pipe.x, rightMostPipe)
        });

        return rightMostPipe;
    }

    handleInputs() {
        this.input.on('pointerdown', this.flap, this);
        this.input.keyboard.on('keydown_SPACE', this.flap, this);
    }

    placePipe(tPipe, bPipe) {
        const difficulty = this.difficulties[this.currentDifficulty];
        const rightMostPipe = this.getRightMostPipe();
        const pipeVerticalDistance = Phaser.Math.Between(...difficulty.pipeVerticalDistanceRange);
        const pipeVerticalPosition = Phaser.Math.Between(20, this.config.height - 20 - pipeVerticalDistance);
        const pipeHorizontalDistance = Phaser.Math.Between(...difficulty.pipeHorizontalDistanceRange);

        tPipe.x = rightMostPipe + pipeHorizontalDistance;
        tPipe.y = pipeVerticalPosition;

        bPipe.x = tPipe.x;
        bPipe.y = tPipe.y + pipeVerticalDistance;
    }

    recyclePipes() {
        const tempPipes = [];

        this.pipes.getChildren().forEach((pipe) => {
            if (pipe.getBounds().right <= 0) {
                tempPipes.push(pipe);
                if (tempPipes.length === 2) {
                    this.placePipe(...tempPipes);
                    this.increaseScore();
                    this.setBestScore();
                    this.increaseDifficulty();
                }
            }
        });
    }

    increaseDifficulty() {
        if (this.score === 30) {
            this.currentDifficulty = 'normal';
        }

        if (this.score === 60) {
            this.currentDifficulty = 'hard';
        }
    }

    setBestScore() {
        const bestScoreText = localStorage.getItem('bestScore');
        const bestScore = bestScoreText && parseInt(bestScoreText, 10);

        if (!bestScore || this.score > bestScore) {
            localStorage.setItem('bestScore', this.score);
        }
    }

    gameOver() {
        localStorage.setItem('gameOver', 'true');
        localStorage.setItem('currentScore', this.score);
        this.sound.get('splat').play({ loop: false });
        this.sound.stopByKey('theme');
        this.scene.pause();
        this.scene.start('ScoreScene');
    }
}

export default PlayScene;
