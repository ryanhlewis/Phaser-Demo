class PauseMenu extends Phaser.Scene {
    constructor() {
        super("PauseMenu");
    }

    preload() {}

    create(data) {
        // Since we know explicitly we're going to have
        // this information, we don't have to check for it.
        // It's located in functions under data..

        var rref = this;

        let box = rref.add.sprite(rref.sys.game.config.width / 2, ref.sys.game.config.height / 2, "box");
        box.setScale(0.4, 0.4);
        rref.add.text(ref.sys.game.config.width / 2 - 115, rref.sys.game.config.height / 2 - 110, "PAUSED", { fontFamily: "PublicPixel", fontSize: "40px" });
        let retry = rref.add.sprite(rref.sys.game.config.width / 2, rref.sys.game.config.height / 2 + 30, "resume");
        retry.setScale(0.2, 0.2);
        retry.setInteractive();

        retry.on("pointerover", () => {
            retry.tint = Math.random() * 0xffffff;
            retry.setScale(0.201, 0.201);
        });

        retry.on("pointerout", () => {
            retry.tint = 0xffffff;
            retry.setScale(0.2, 0.2);
        });

        retry.on("pointerdown", () => {
            retry.setScale(0.2, 0.2);
            ref.scene.resume();
            rref.scene.stop();
        });

        let quit = rref.add.sprite(rref.sys.game.config.width / 2, rref.sys.game.config.height / 2 + 100, "quit");
        quit.setScale(0.2, 0.2);
        quit.setInteractive();

        quit.on("pointerover", () => {
            quit.tint = Math.random() * 0xffffff;
            quit.setScale(0.201, 0.201);
        });

        quit.on("pointerout", () => {
            quit.tint = 0xffffff;
            quit.setScale(0.2, 0.2);
        });

        quit.on("pointerdown", () => {
            quit.setScale(0.2, 0.2);
            gameEnded = Boolean(1);
            enemies.children["entries"].forEach((enemy) => {
                ref.physics.world.colliders.destroy();
                enemy.destroy();
            });
            clearInterval(spawnerID);
            //player.destroy();
            var lastScene = ref.scene;
            ref.scene.launch("Menu" /*, { menu: Boolean(1), score: data.score, healthLevel: data.healthLevel, attackLevel: data.attackLevel }*/);
            ref.scene.bringToTop("Menu");
            rref.scene.stop();
            lastScene.stop();
        });
    }

    update() {}
}

class InGame extends Phaser.Scene {
    constructor() {
        super("InGame");
        ref = this;
    }

    preload() {
        if (!preloadedGame) {
            preloadedGame = Boolean(1);
            // Setting up Animations
            var frameNames;

            // Custom animation--
            frameNames = ref.anims.generateFrameNames("swordtrail", {
                start: 0,
                end: 2,
            });
            ref.anims.create({ key: "sword", frames: frameNames, frameRate: 8, repeat: 0 });

            // Spritesheet Animations
            // To speed this up--

            var customAnims = [
                // Player and Coin
                { a: "coin_anim_f", b: "coinSpin" },
                { a: "knight_f_idle_anim_f", b: "idle" },
                { a: "knight_f_run_anim_f", b: "run" },
                // Enemies
                { a: "goblin_run_anim_f", b: "goblinRun" },
                { a: "tiny_zombie_run_anim_f", b: "tinyzombieRun" },
                { a: "skelet_run_anim_f", b: "skeletonRun" },
                { a: "imp_run_anim_f", b: "impRun" },
                { a: "wogol_run_anim_f", b: "wogolRun" },
                { a: "chort_run_anim_f", b: "chortRun" },
                { a: "muddy_run_anim_f", b: "muddyRun" },
                { a: "masked_orc_run_anim_f", b: "maskedorcRun" },
                { a: "necromancer_run_anim_f", b: "necroRun" },
                { a: "orc_shaman_run_anim_f", b: "orcshamanRun" },
                { a: "orc_warrior_run_anim_f", b: "orcwarriorRun" },
                { a: "ice_zombie_run_anim_f", b: "icezombieRun" },
                { a: "zombie_run_anim_f", b: "zombieRun" },
                { a: "ogre_run_anim_f", b: "ogreRun" },
                { a: "big_zombie_run_anim_f", b: "bigzombieRun" },
                { a: "big_demon_run_anim_f", b: "bigdemonRun" },
            ];

            customAnims.forEach((item) => {
                makeAnim(item.a, item.b);
            });

            function makeAnim(animRealName, animName) {
                frameNames = ref.anims.generateFrameNames("spritesheet", {
                    start: 0,
                    end: 3,
                    prefix: animRealName,
                });
                ref.anims.create({ key: animName, frames: frameNames, frameRate: 8, repeat: -1 });
            }
        }
    }

    create(data) {
        /*var attackLevel = 0;
        var healthLevel = 0;
        var coinCount = 0;
        var score = 0;*/

        score = 0;
        console.log(data);

        // Grab any data passed in
        /*if (data.attackLevel != undefined) {
            attackLevel = data.attackLevel;
            healthLevel = data.healthLevel;
            coinCount = data.score;
        }*/

        var health = 100 + 50 * healthLevel;
        var attack = 25 + 3 * attackLevel;

        //cursors = this.input.keyboard.createCursorKeys();
        cursors = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, left: Phaser.Input.Keyboard.KeyCodes.A, right: Phaser.Input.Keyboard.KeyCodes.D });

        // Groups:
        // all static objects / colliders
        var statics = this.physics.add.staticGroup();
        // all enemies
        enemies = this.physics.add.group({
            dragX: 300,
            dragY: 300,
        });

        playerGroup = this.physics.add.group();

        var healthbar = this.add.group();

        // background
        let bg = this.add.sprite(0, 0, "background");

        // change origin to the top-left of the sprite
        bg.setOrigin(0, 0);

        player = playerGroup.create(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 90, "spritesheet", "knight_f_idle_anim_f0");
        player.setScale(3, 3);
        player.depth = 50;
        player.anims.play("idle");
        player.setCollideWorldBounds(true);

        princess = statics.create(this.sys.game.config.width / 2, this.sys.game.config.height / 2, "spritesheet", "elf_f_run_anim_f1");
        princess.setScale(3.2, 3.2);
        //princess.tint = 0xcccccc;

        async function createCoin(x, y) {
            var coin;
            coin = ref.physics.add.sprite(x, y, "spritesheet", "coin_anim_f0");
            // Since we're making the coin after everyone, we
            // need to ensure its depth here so it doesn't appear on top.
            coin.depth = 0;
            coin.setScale(3.2, 3.2);
            coin.anims.play("coinSpin");
            coin.setGravityY(100);
            coin.setVelocityX(Math.random() * 500 - 250);
            coin.setVelocityY(-1 * (Math.random() * 150));
            coin.setCollideWorldBounds(true);

            await new Promise((r) =>
                setTimeout(
                    () =>
                        new (function () {
                            coin.setVelocityX(0);
                            coin.setVelocityY(0);
                            coin.setGravityY(0);
                            // Add collider only after coin has landed
                            ref.physics.add.collider(player, coin, collectCoin, null, this);
                        })(),
                    2000
                )
            );
        }

        // Player starts with 3 hearts.
        // Each are evenly spaced apart, starting at 30,
        // with a width of 50. They are accessed by the hearts array.
        var hearts = Array();
        function createHeart() {
            var heart = healthbar.create(30 + hearts.length * 50, 25, "spritesheet", "ui_heart_full");
            heart.depth = 100;
            heart.setScale(3.2, 3.2);
            hearts.push(heart);
        }
        for (let i = 0; i < healthLevel + 3; i++) {
            createHeart();
        }
        //console.log(hearts);

        // Create enemies.
        // Large array of them, as player score increases,
        // enemies will increase to include more of array.
        // Random will pick a random position in array-
        // more enemies in array, more chance of being picked.

        // Enemy Health determines speed- more health: slower.
        // It also determines how hard the enemy hits.
        // All enemies will be walkers for right now-
        // special enemy attacks, movements, can be done later.

        class Enemy {
            scale;
            animName;
            health;
            constructor(scale, animName, health) {
                this.scale = scale;
                this.animName = animName;
                this.health = health;
            }
        }

        var EnemyList = [
            new Enemy(3.2, "goblinRun", 50),
            new Enemy(3.2, "tinyzombieRun", 60),
            new Enemy(3.2, "skeletonRun", 70),
            new Enemy(3.2, "impRun", 80),
            new Enemy(3.2, "wogolRun", 100),
            new Enemy(3.2, "chortRun", 130),
            new Enemy(3.2, "muddyRun", 200),
            new Enemy(3.2, "maskedorcRun", 300),
            new Enemy(3.2, "necroRun", 200),
            new Enemy(3.2, "orcshamanRun", 150),
            new Enemy(3.2, "orcwarriorRun", 100),
            new Enemy(3.2, "icezombieRun", 400),
            new Enemy(3.2, "zombieRun", 350),
            new Enemy(3.2, "ogreRun", 800),
            new Enemy(3.2, "bigzombieRun", 900),
            new Enemy(3.2, "bigdemonRun", 1000),
        ];

        var currentEnemyList = Array();

        var lastScore = 0;

        // The more you've upgraded yourself in the Shop (attack-wise)
        // the harder your start will be...... (to keep things engaging)
        var intervalMax = (attackLevel * 200) > 4750 ? 4750 : attackLevel*100;

        // Add all previously levelled enemies---
        var maxEnemyCount = attackLevel >= EnemyList.length ? EnemyList.Length-1 : attackLevel;
        for(let x = 1; x <= maxEnemyCount; x++)
            addEnemy(x, Math.random() * (EnemyList.length - x));


        // Every five seconds, check player score,
        // and update current enemy list accordingly
        spawnerID = setInterval(updateEnemies, 5000);

        // The spawn time decreases as player levels up
        var intervalTime = 5000 - (intervalMax);
        var spawner = setInterval(createEnemy, intervalTime);

        //console.log(spawnerID);

        // Attempt to clear the intervals of everything--
        for (let x = 0; x < spawnerID; x++) {
            clearInterval(x);
        }

        function updateEnemies() {
            // Normalize the score--
            var normalizedScore = Math.round(score / 50);
            console.log(normalizedScore);
            console.log(lastScore);
            // If next enemy unlocked--
            if (normalizedScore > lastScore) {
                // Distribution is high for lower enemies, low for higher.
                addEnemy(normalizedScore, Math.random() * (EnemyList.length - normalizedScore));
                // Also add a higher enemy spawn rate--
                clearInterval(spawnerID);
                intervalTime -= 100;
                spawnerID = setInterval(updateEnemies, intervalTime);
                lastScore = normalizedScore;
            }
        }

        function addEnemy(num, loop) {
            for (let x = 0; x < loop; x++) currentEnemyList.push(EnemyList[num]);
        }

        for (let x = 0; x < 5; x++) currentEnemyList.push(EnemyList[0]);

        function createEnemy() {
            // RNG
            var RNG = Math.floor(Math.random() * currentEnemyList.length);
            createWalker(currentEnemyList[RNG]);
        }

        function createWalker(enemyType) {
            var pos = randomPos();
            var enemy = enemies.create(pos[0], pos[1], "spritesheet", "goblin_idle_anim_f0");
            enemy.setScale(enemyType.scale, enemyType.scale);
            enemy.anims.play(enemyType.animName);
            enemy.health = enemyType.health;
            enemy.setData('isHit', Boolean(0));

            //enemy.setCollideWorldBounds(true);
        }

        function randomPos() {
            // Random Spawner positions--
            // Rather than expensive calculations for positions,
            // or the "spawn and move if bad location" method,
            // each will simply pass a boolean to decide.

            // Top, Bottom, or Sides

            var x = -50;
            var y = -50;
            var pos = new Array();
            switch (Math.round(Math.random() * 4)) {
                case 0:
                    // Top
                    x += Math.random() * (ref.sys.game.config.width + 100);
                    break;
                case 1:
                    // Left
                    y += Math.random() * (ref.sys.game.config.height + 100);
                    break;
                case 2:
                    // Bottom
                    y = ref.sys.game.config.height + 50;
                    x += Math.random() * (ref.sys.game.config.width + 100);
                    break;
                case 3:
                    // Right
                    x = ref.sys.game.config.width + 50;
                    y += Math.random() * (ref.sys.game.config.height + 100);
            }
            pos[0] = x;
            pos[1] = y;
            return pos;
        }

        function deathScreen() {
            //console.log("player has died");
            player.setVelocityX(0);
            player.setVelocityY(0);
            sword.setVelocityX(0);
            sword.setVelocityY(0);
            sword.x = player.x;
            sword.y = player.y;
    
            player.anims.stop();
            player.setTexture("spritesheet", "knight_f_hit_anim_f0");

            let box = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2, "box");
            box.setScale(0.4, 0.4);
            var you = ref.add.text(ref.sys.game.config.width / 2 - 75, ref.sys.game.config.height / 2 - 130, "YOU", { fontFamily: "PublicPixel", fontSize: "50px" });
            var lost = ref.add.text(ref.sys.game.config.width / 2 - 95, ref.sys.game.config.height / 2 - 80, "LOST", { fontFamily: "PublicPixel", fontSize: "50px" });
            you.depth = 100;
            lost.depth = 100;
            box.depth = 100;

            let retry = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 + 30, "retry");
            retry.setScale(0.2, 0.2);
            retry.setInteractive();
            retry.depth = 100;

            retry.on("pointerover", () => {
                retry.tint = Math.random() * 0xffffff;
                retry.setScale(0.201, 0.201);
            });

            retry.on("pointerout", () => {
                retry.tint = 0xffffff;
                retry.setScale(0.2, 0.2);
            });

            retry.on("pointerdown", () => {
                retry.setScale(0.2, 0.2);
                enemies.children["entries"].forEach((enemy) => {
                    ref.physics.world.colliders.destroy();
                    enemy.destroy();
                });
                clearInterval(spawnerID);
                //player.destroy();
                // Results in mini black screen,
                // otherwise, results in Update() non-crashing error
                ref.scene.start("InGame" /*, { score: (score + coinCount), attackLevel: attackLevel, healthLevel: healthLevel }*/);
                ref.scene.bringToTop("InGame");
            });

            let quit = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 + 100, "quit");
            quit.setScale(0.2, 0.2);
            quit.setInteractive();
            quit.depth = 100;

            quit.on("pointerover", () => {
                quit.tint = Math.random() * 0xffffff;
                quit.setScale(0.201, 0.201);
            });

            quit.on("pointerout", () => {
                quit.tint = 0xffffff;
                quit.setScale(0.2, 0.2);
            });

            quit.on("pointerdown", () => {
                quit.setScale(0.2, 0.2);
                enemies.children["entries"].forEach((enemy) => {
                    ref.physics.world.colliders.destroy();
                    enemy.destroy();
                });
                clearInterval(spawnerID);
                var lastScene = ref.scene;
                //player.destroy();
                ref.scene.launch("Menu" /*, { menu: Boolean(1), score: (score + coinCount), attackLevel: attackLevel, healthLevel: healthLevel }*/);
                ref.scene.bringToTop("Menu");
                ref.scene.stop("InGame");
                lastScene.stop();
            });
        }

        this.physics.add.collider(player, enemies);
        this.physics.add.collider(player, statics);
        this.physics.add.collider(princess, enemies, hitPrincess, null, this);

        // UI

        var scoreText = this.add.text(ref.sys.game.config.width - 40, 10, "0", { fontFamily: "PublicPixel", fontSize: "30px", fill: "#000", align: "right" });
        scoreText.depth = 100;

        gameEnded = Boolean(0);

        function collectCoin(player, coinBody) {
            //console.log("coin");
            score += 10;
            coinCount += 10;
            console.log(score);
            scoreText.setText(score);
            // A trick to right-align.
            scoreText.x = ref.sys.game.config.width - 10 - scoreText.width;

            coinBody.destroy();
        }

        async function hitPrincess(bodyA, bodyB) {
            if (gameEnded || bodyB.getData('isHit')) return;


            bodyB.setData('isHit', Boolean(1));


            var xDistance = princess.x - bodyB.x;
            var yDistance = princess.y - bodyB.y;
            var hypotenuse = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

            var y = -2.4 * 200 * (yDistance / hypotenuse);
            var x = -2.4 * 200 * (xDistance / hypotenuse);

            bodyB.setVelocityX(x);
            bodyB.setVelocityY(y);
            health -= 10;
            // Since there's really no better way to do this
            // other than manually--

            // 3 hearts - 4 hearts - 5 hearts..
            // each heart represents a portion of health divided
            // into two sections, half and empty.

            // First, choose the right heart to act on-
            var divider = 100 / hearts.length;
            // Need to work this out to work with "bigger health hits".
            var chosenIndex = Math.floor(hearts.length * ((health + 10) / 100.0));
            // Math might be a little off- fix later
            if (chosenIndex >= hearts.length) chosenIndex = hearts.length - 1;
            //console.log(chosenIndex);
            //console.log(divider);
            //console.log(((chosenIndex))*divider + (divider/2));
            //console.log(((chosenIndex))*(divider));
            if (health < chosenIndex * divider + divider / 2) {
                //console.log("set texture 1");
                hearts[chosenIndex].setTexture("spritesheet", "ui_heart_half");
            }
            if (health <= chosenIndex * divider) {
                //console.log("set texture 2");
                hearts[chosenIndex].setTexture("spritesheet", "ui_heart_empty");
            }

            if (health <= 0) {
                // Ensure the deathScreen isn't called multiple times.
                bodyB.destroy();
                if (!gameEnded) deathScreen();
                gameEnded = Boolean(1);
                return;
            }
            bodyB.anims.pause();
            this.cameras.main.shake(1000, 0.005);

            await new Promise((r) =>
                setTimeout(
                    () =>
                        new (function () {
                            if (bodyB != undefined && bodyB.health > 0) {
                                // In case an undefined enemy sneaks by-
                                try {
                                    bodyB.setVelocityX(0);
                                    bodyB.setVelocityY(0);
                                    bodyB.anims.resume();
                                    bodyB.setData('isHit', Boolean(0));
                                } catch (err) {
                                    //ignore
                                }
                            }
                        })(),
                    2000
                )
            );
        }

        // Attack doesn't just get better, let's give our hero
        // a bigger sword based on his attack level.

        var swordIndex = attackLevel >= swordList.length ? swordList.length - 1 : attackLevel;
        sword = playerGroup.create(70, this.sys.game.config.height / 2 + 30, "spritesheet", swordList[swordIndex].a);
        sword.setScale(3.2, 3.2);
        sword.setOrigin(0.1, 0.7);

        this.physics.add.collider(sword, enemies, hitEnemies, null, this);

        async function hitEnemies(bodyA, bodyB) {
            if (overrideSword && !bodyB.getData('isHit')) {

                // hit enemy
                bodyB.setData('isHit', Boolean(1));

                // Geometry- distance between points
                var xDistance = bodyA.x - bodyB.x;
                var yDistance = bodyA.y - bodyB.y;
                var hypotenuse = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

                // Speed is determined by health of enemy
                var y = -0.8 * 200 * (yDistance / hypotenuse);
                var x = -0.8 * 200 * (xDistance / hypotenuse);

                bodyB.setVelocityX(x);
                bodyB.setVelocityY(y);
                bodyB.anims.pause();

                bodyB.health -= attack;
                // amount of hits it took
                bodyB.name += ".";
                if (bodyB.health <= 0) {
                    // normalize this length by attackDamage
                    var possibleCoins = bodyB.name.length / (attack) / 2;
                    console.log(possibleCoins);
                    var RNGcoins = Math.random() * possibleCoins + 1;
                    for (let x = 1; x < RNGcoins; x++) createCoin(bodyB.x, bodyB.y);
                    bodyB.destroy();
                    return;
                }

                bodyB.tint = Math.random() * 0xffffff;

                await new Promise((r) =>
                    setTimeout(
                        () =>
                            new (function () {
                                // In case our enemy has died by the time
                                // their knockback is reset.
                                if (bodyB.health > 0) {
                                    try {
                                        bodyB.setVelocityX(0);
                                        bodyB.setVelocityY(0);
                                        bodyB.anims.resume();
                                        bodyB.setData('isHit', Boolean(0));
                                    } catch (err) {
                                        //ignore
                                    }
                                }
                            })(),
                        2000
                    )
                );
            }
        }

        var id;

        this.input.on(
            "pointerdown",
            async function (pointer) {
                if (gameEnded) return;

                overrideSword = Boolean(1);

                if (sword.angle <= 180) sword.angle = 0;
                else sword.angle = 360;

                clearInterval(id);

                id = setInterval(frame, 1);

                // Temporary sword trail
                let trail = ref.add.sprite(sword.x, sword.y, "sword");
                trail.tint = swordTrailColor;
                trail.setScale(0.5, 0.5);
                trail.anims.play("sword");
                if (player.flipX) {
                    trail.setFlipX(true);
                }
                // Destroy after anim done
                //trail.destroy();

                function frame() {
                    if (player.flipX) {
                        if (sword.angle < -140) {
                            clearInterval(id);
                            return;
                        } else {
                            sword.angle -= 5;
                        }
                    }
                    if (!player.flipX) {
                        if (sword.angle > 140) {
                            clearInterval(id);
                            return;
                        } else {
                            sword.angle += 5;
                        }
                    }
                }

                await new Promise((r) =>
                    setTimeout(
                        () =>
                            new (function () {
                                overrideSword = Boolean(0);
                                trail.destroy();
                            })(),
                        500
                    )
                );
            },
            this
        );

        getAngle = function getAngle(obj1, obj2) {
            //I use the offset because the sword is pointing down
            //at the 6 o'clock position
            //set to 0 if your sprite is facing 3 o'clock
            //set to 180 if your sprite is facing 9 o'clock
            //set to 270 if your sprite is facing 12 o'clock
            //
            var offSet = 90;
            // angle in radians
            //var angleRadians = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
            // angle in degrees
            var angleDeg = (Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * 180) / Math.PI;
            //add the offset
            angleDeg += offSet;
            return angleDeg;
        };

        overrideSword = Boolean(0);

        // Create ONCE---- in the entire game.
        // Needs to be here to access some variables----
        if (!createOnce) {
            createOnce = Boolean(1);

            // Setting up the Pause Menu
            ref.input.keyboard.on("keydown_ESC", function (event) {
                if (gameEnded) return;

                //console.log('Game Paused');
                if (ref.scene.isActive("PauseMenu")) {
                    ref.scene.stop("PauseMenu");
                    ref.scene.bringToTop("InGame");
                    ref.scene.resume();
                } else {
                    ref.scene.launch("PauseMenu" /*, { score: (score + coinCount), attackLevel: attackLevel, healthLevel: healthLevel, enemies: enemies }*/);
                    ref.scene.bringToTop("PauseMenu");
                    ref.scene.pause();
                }
            });
        }
    }

    update(time, delta) {
        var moving = Boolean(0);

        if (!gameEnded) {
            if (player.flipX) sword.x = player.x - 10;
            else sword.x = player.x + 10;

            sword.y = player.y + 30;

            if (!overrideSword) sword.angle = getAngle(sword, this.sys.game.input.activePointer);

            if ((sword.angle > 30) & (sword.angle < 150)) {
                player.setFlipX(false);
                sword.setOrigin(0.1, 0.7);
                sword.x = player.x + 15;
            } else if ((sword.angle < -30) & (sword.angle > -210)) {
                player.setFlipX(true);
                sword.setOrigin(0.8, 0.7);
                sword.x = player.x - 15;
            }

            // Player Movement
            if (cursors.left.isDown) {
                playerGroup.setVelocityX(-160);
                player.anims.play("run", true);
                moving = Boolean(1);
                //player.setFlipX(true);
            } else if (cursors.right.isDown) {
                playerGroup.setVelocityX(160);
                player.anims.play("run", true);
                moving = Boolean(1);
                //player.setFlipX(false);
            } else {
                moving = Boolean(0);
                playerGroup.setVelocityX(0);
            }

            if (cursors.up.isDown) {
                playerGroup.setVelocityY(-160);
                player.anims.play("run", true);
                moving = Boolean(1);
            } else if (cursors.down.isDown) {
                playerGroup.setVelocityY(160);
                player.anims.play("run", true);
                moving = Boolean(1);
            } else {
                if (!moving) {
                    player.anims.play("idle", true);
                }
                playerGroup.setVelocityY(0);
            }
        }

        enemies.children["entries"].forEach((enemy) => {
            if(!enemy.getData('isHit')) {
            var xDistance = princess.x - enemy.x;
            var yDistance = princess.y - enemy.y;
            var hypotenuse = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
            if (hypotenuse < 1000) {
                //Speed determined by enemy health
                // dont let the enemies go too fast if they get too low on health
                var multiplier = enemy.health < 100 ? 100 : enemy.health;
                enemy.y += 0.008 * (0.4 / (multiplier / 100)) * 200 * (yDistance / hypotenuse);
                enemy.x += 0.008 * (0.4 / (multiplier / 100)) * 200 * (xDistance / hypotenuse);
            }
        }
        });
        
    }
}

class Menu extends Phaser.Scene {
    constructor() {
        super("Menu");
    }

    preload() {
        // Called once- never called again
        if (!gameStarted) {
            // A marker to access this class in functions
            gameStarted = Boolean(1);

            // Preloading all game images.
            this.load.image("background", "assets/grass.png");
            this.load.image("play", "assets/play.png");
            this.load.image("story", "assets/story.png");
            this.load.image("shop", "assets/shop.png");
            this.load.image("quit", "assets/quit.png");
            this.load.image("settings", "assets/gear.png");
            this.load.image("x", "assets/x.png");
            this.load.image("box", "assets/box.png");
            this.load.atlas("spritesheet", "assets/fixedphas.png", "assets/fixedphas.json");
            this.load.image("background", "assets/grass.png");
            this.load.image("retry", "assets/retry.png");
            this.load.image("background", "assets/grass.png");
            this.load.image("resume", "assets/resume.png");
            this.load.spritesheet("swordtrail", "assets/swordtrail.png", { frameWidth: 282, frameHeight: 214 });
            this.load.image("back", "assets/back.png");
            this.load.image("logo", "assets/logo.png");

            //console.log(ref);

            /*
                // Setting up the Pause Menu
                ref.input.keyboard.on('keydown_ESC', function (event) { 
                console.log('Game Paused');
                if(ref.scene.isActive('PauseMenu')) {
                    ref.scene.stop('PauseMenu');
                    ref.scene.bringToTop('InGame');
                    ref.scene.resume();
                } else {
                    ref.scene.launch('PauseMenu', {score:0});
                    ref.scene.bringToTop('PauseMenu');
                    ref.scene.pause();   
                }
                });*/

            // Setting up Movement
        }
    }

    create(data) {
        // This will pass the "Data", that is, the
        // players coin count and levels back.
        /*var coinCount = 0;
        var attackLevel = 0;
        var healthLevel = 0;*/

        var ref = this;

        /*console.log(data);
        if (data.score != undefined) {
            coinCount = data.score;
            attackLevel = data.attackLevel;
            healthLevel = data.healthLevel;
        }*/

        cursors = this.input.keyboard.createCursorKeys();
        let bg = this.add.sprite(0, 0, "background");
        // change origin to the top-left of the sprite
        bg.setOrigin(0, 0);

        //let play = this.add.sprite(this.sys.game.config.width / 2, (this.sys.game.config.height / 2)+100, 'play');
        // change origin to the top-left of the sprite

        // If player is quitting to menu, and not main menu-
        if (menu) {
            displayMenu();
            return;
        }

        let logo = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 - 50, "logo");
        logo.setScale(0.3, 0.3);

        let play = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2 + 100, "play");
        play.setScale(0.3, 0.3);
        play.setInteractive();

        play.on("pointerover", () => {
            play.tint = Math.random() * 0xffffff;
            play.setScale(0.31, 0.31);
        });

        play.on("pointerout", () => {
            play.tint = 0xffffff;
            play.setScale(0.3, 0.3);
        });

        play.on("pointerdown", () => {
            play.setScale(0.3, 0.3);
            displayMenu();
        });

        function displayMenu() {
            if (!menu) {
                logo.destroy();
                play.destroy();
            }

            menu = Boolean(1);

            let story = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 - 100, "story");
            story.setScale(0.3, 0.3);
            story.setInteractive();

            story.on("pointerover", () => {
                story.tint = Math.random() * 0xffffff;
                story.setScale(0.31, 0.31);
            });

            story.on("pointerout", () => {
                story.tint = 0xffffff;
                story.setScale(0.3, 0.3);
            });

            story.on("pointerdown", () => {
                story.setScale(0.3, 0.3);
                //ref.scene.stop('InGame');
                ref.scene.launch("InGame" /*, { score: coinCount, attackLevel: attackLevel, healthLevel: healthLevel }*/);
                ref.scene.bringToTop("InGame");
                ref.scene.stop("Menu");
            });

            let shop = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2, "shop");
            shop.setScale(0.3, 0.3);
            shop.setInteractive();

            shop.on("pointerover", () => {
                shop.tint = Math.random() * 0xffffff;
                shop.setScale(0.31, 0.31);
            });

            shop.on("pointerout", () => {
                shop.tint = 0xffffff;
                shop.setScale(0.3, 0.3);
            });

            shop.on("pointerdown", () => {
                shop.setScale(0.3, 0.3);
                story.destroy();
                shop.destroy();
                quit.destroy();
                displayShop();
            });

            let quit = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 + 100, "quit");
            quit.setScale(0.3, 0.3);
            quit.setInteractive();

            quit.on("pointerover", () => {
                quit.tint = Math.random() * 0xffffff;
                quit.setScale(0.31, 0.31);
            });

            quit.on("pointerout", () => {
                quit.tint = 0xffffff;
                quit.setScale(0.3, 0.3);
            });

            quit.on("pointerdown", () => {
                quit.setScale(0.3, 0.3);
                menu = Boolean(0);
                ref.scene.start("Menu" /*, { score: coinCount, attackLevel: attackLevel, healthLevel: healthLevel }*/);
            });

            // Settings Menu- commented out until further notice.
            /*let settings = ref.add.sprite(ref.sys.game.config.width-40, (ref.sys.game.config.height-40), 'settings');
                settings.setScale(0.1,0.1);
                settings.setInteractive();

                settings.on('pointerover', () => { 
                    settings.tint = Math.random() * 0xffffff;
                    settings.setScale(0.11,0.11);
                });

                settings.on('pointerout', () => { 
                    settings.tint = 0xffffff;
                    settings.setScale(0.1,0.1);
                });

                settings.on('pointerdown', () => { 
                    settings.setScale(0.1,0.1);
                    story.destroy();
                    shop.destroy();
                    quit.destroy();
                    displaySettings();
                });*/

            function displayShop() {
                let box = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2, "box");
                box.setScale(0.4, 0.4);

                let chest = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 - 170, "spritesheet", "chest_empty_open_anim_f0");
                chest.setScale(7, 7);

                var scoreText = ref.add.text(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 - 130, "" + coinCount, { fontFamily: "PublicPixel", fontSize: "30px", fill: "#fff", align: "center" }).setOrigin(0.5);

                var swordLevel = ref.add.text(ref.sys.game.config.width / 2 - 110, ref.sys.game.config.height / 2 - 80, "Level " + attackLevel, { fontFamily: "PublicPixel", fontSize: "12px", fill: "#fff", align: "center" });
                var heartLevel = ref.add.text(ref.sys.game.config.width / 2 + 20, ref.sys.game.config.height / 2 - 80, "Level " + healthLevel, { fontFamily: "PublicPixel", fontSize: "12px", fill: "#fff", align: "center" });

                var swordCost = ref.add.text(ref.sys.game.config.width / 2 - 80, ref.sys.game.config.height / 2 + 30, "" + (attackLevel + 1) * 100, { fontFamily: "PublicPixel", fontSize: "15px", fill: "#fff", align: "center" });
                var heartCost = ref.add.text(ref.sys.game.config.width / 2 + 40, ref.sys.game.config.height / 2 + 30, "" + (healthLevel + 3) * 100, { fontFamily: "PublicPixel", fontSize: "15px", fill: "#fff", align: "center" });

                var swordIndex = attackLevel >= swordList.length ? swordList.length - 1 : attackLevel;
                let weapon = ref.add.sprite(ref.sys.game.config.width / 2 - 60, ref.sys.game.config.height / 2 - 20, "spritesheet", swordList[swordIndex].a);
                weapon.setScale(4, 4);
                // The dreaded while loop!
                // Only used once!
                while (weapon.displayHeight > 84) {
                    weapon.setScale(weapon.scaleX - 0.5, weapon.scaleY - 0.5);
                }
                //console.log(weapon.displayHeight);
                weapon.setInteractive();

                weapon.on("pointerover", () => {
                    weapon.tint = Math.random() * 0xffffff;
                    weapon.setScale(weapon.scaleX + 0.3, weapon.scaleY + 0.3);
                });

                weapon.on("pointerout", () => {
                    weapon.tint = 0xffffff;
                    weapon.setScale(weapon.scaleX - 0.3, weapon.scaleY - 0.3, 4);
                });

                weapon.on("pointerdown", () => {
                    // Attempt to buy a sword upgrade
                    var upgradeCost = (attackLevel + 1) * 100;
                    if (coinCount >= upgradeCost) {
                        //console.log("bought!");
                        attackLevel++;
                        coinCount -= upgradeCost;
                        // add new sword trail color
                        swordTrailColor = Math.random() * 0xffffff;
                        // refresh the shop
                        deleteShop();
                        displayShop();
                    } else {
                        // Not enough money!
                    }
                });

                let heart = ref.add.sprite(ref.sys.game.config.width / 2 + 60, ref.sys.game.config.height / 2 - 20, "spritesheet", "ui_heart_full");
                heart.setScale(4, 4);
                heart.setInteractive();

                heart.on("pointerover", () => {
                    heart.tint = Math.random() * 0xffffff;
                    heart.setScale(4.3, 4.3);
                });

                heart.on("pointerout", () => {
                    heart.tint = 0xffffff;
                    heart.setScale(4, 4);
                });

                heart.on("pointerdown", () => {
                    heart.setScale(4, 4);
                    // Attempt to buy a health upgrade
                    var upgradeCost = (healthLevel + 3) * 100;
                    if (coinCount >= upgradeCost) {
                        //console.log("bought!");
                        healthLevel++;
                        coinCount -= upgradeCost;
                        // refresh the shop
                        deleteShop();
                        displayShop();
                    } else {
                        // Not enough money!
                    }
                });

                let x = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2 + 100, "back");
                x.setScale(0.24, 0.24);
                x.setInteractive();

                x.on("pointerover", () => {
                    x.tint = Math.random() * 0xffffff;
                    x.setScale(0.245, 0.245);
                });

                x.on("pointerout", () => {
                    x.tint = 0xffffff;
                    x.setScale(0.24, 0.24);
                });

                x.on("pointerdown", () => {
                    x.setScale(0.24, 0.24);
                    deleteShop();
                    displayMenu();
                });

                function deleteShop() {
                    box.destroy();
                    chest.destroy();
                    scoreText.destroy();
                    swordLevel.destroy();
                    heartLevel.destroy();
                    swordCost.destroy();
                    heartCost.destroy();
                    weapon.destroy();
                    heart.destroy();
                    x.destroy();
                }
            }

            function displaySettings() {
                let box = ref.add.sprite(ref.sys.game.config.width / 2, ref.sys.game.config.height / 2, "box");
                box.setScale(0.4, 0.4);

                let x = ref.add.sprite(ref.sys.game.config.width / 2 + 130, ref.sys.game.config.height / 2 - 155, "x");
                x.setScale(0.15, 0.15);
                x.setInteractive();

                x.on("pointerover", () => {
                    x.tint = Math.random() * 0xffffff;
                    x.setScale(0.151, 0.151);
                });

                x.on("pointerout", () => {
                    x.tint = 0xffffff;
                    x.setScale(0.15, 0.15);
                });

                x.on("pointerdown", () => {
                    x.setScale(0.15, 0.15);
                    x.destroy();
                    box.destroy();
                    displayMenu();
                });
            }
        }
    }

    update(time, delta) {}
}

var config = {
    type: Phaser.AUTO,
    width: 640,
    height: 640,
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
        },
    },
    scene: [Menu, InGame, PauseMenu],
};
var game = new Phaser.Game(config);
// These variables are temporarily global until
// I can refactor the code to make them not.
// The refactor in mind is just a GameInfo class object
// which I can pass easily around the scenes.
var cursors;
var player;
var princess;
var sword;
var playerGroup;
var getAngle;
var overrideSword;
var enemies;
var ref;
var spawnerID;
var gameStarted = Boolean(0);
var preloadedGame = Boolean(0);
var gameEnded;
var createOnce = Boolean(0);
// If you're looking for the variable I use to pass values
// between scenes, it's not in the global variables.
// It's already being passed directly between scenes.
// CTRL-F "launch"

// Scratch what I said above. Phaser is absolutely atrocious at passing
// variables between scenes. Honestly one of the worst engines I've used
// to fail to do something so simple. Here's the global fallback-
var score = 0;
var coinCount = 0;
var attackLevel = 0;
var healthLevel = 0;
var menu = Boolean(0);
var enemies;
var swordTrailColor = 0xffffff;

var swordList = [
    { a: "weapon_rusty_sword" },
    { a: "weapon_regular_sword" },
    { a: "weapon_saw_sword" },
    { a: "weapon_red_gem_sword" },
    { a: "weapon_axe" },
    { a: "weapon_duel_sword" },
    { a: "weapon_green_magic_staff" },
    { a: "weapon_anime_sword" },
    { a: "weapon_machete" },
    { a: "weapon_spear" },
    { a: "weapon_hammer" },
    { a: "weapon_baton_with_spikes" },
    { a: "weapon_mace" },
    { a: "weapon_katana" },
    { a: "weapon_knight_sword" },
    { a: "weapon_golden_sword" },
    { a: "weapon_lavish_sword" },
    { a: "weapon_knife" },
    { a: "weapon_big_hammer" },
];
