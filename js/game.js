var game = new Game();


//圖庫
var imageRepository = new function () {
    //初始化圖片
    this.background = new Image();
    this.cloud = new Image();
    this.spaceship = new Image();
    this.bullet = new Image();
    this.AH64_blade = new Image();

    this.enemy = new Image();
    this.enemyBullet = new Image();

    this.enemys = new Array();
    for (var i = 1; i <= 4; i++) {
        this.enemys[i] = new Image();
        this.enemys[i].src = "imgs/queen" + i + ".png";

    }

    this.enemyBullets = new Array();
    for (var i = 1; i <= 4; i++) {
        this.enemyBullets[i] = new Image();
        this.enemyBullets[i].src = "imgs/bullet_enemy" + i + ".png";
    }

    this.background.src = "imgs/Sky.jpg";
    this.cloud.src = "imgs/cloud.png";
    this.spaceship.src = "imgs/AH64_body.png";
    this.bullet.src = "imgs/bullet.png";
    this.AH64_blade.src = "imgs/AH64_blade.png";
    this.enemy.src = this.enemys[game.level].src;
    this.enemyBullet.src = this.enemyBullets[game.level].src;
}

//遊戲物件
function Drawable() {
    this.init = function (x, y, width, height) {
        // Defualt variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.collidableWith = "";
    this.isColliding = false;
    this.type = "";

    //virtual function
    this.draw = function () {
    };
    this.move = function () {
    };
    this.isCollidableWith = function (object) {
        return (this.collidableWith === object.type);
    };
}

//背景物件
function Background() {
    this.speed = 1;
    this.draw = function () {
        //this.y += this.speed;
        this.context.drawImage(imageRepository.background, 0, 0);
        //this.context.drawImage(imageRepository.cloud,this.x ,this.y);
        //this.context.drawImage(imageRepository.background,this.x ,this.y - this.canvasHeight);

        if (this.y >= this.canvasHeight) {
            this.y = 0;
        }
    };
}
Background.prototype = new Drawable();

//雲朵物件
function Cloud() {
    this.speed = 1;
    this.draw = function () {
        this.context.clearRect(this.x, this.y, this.width, this.height);
        this.y += this.speed;
        this.context.drawImage(imageRepository.cloud, this.x, this.y);
        if (this.y >= this.canvasHeight) {
            this.y = -this.canvasHeight;
        }
    };
}
Cloud.prototype = new Drawable();


//子彈物件
function Bullet(object) {
    this.alive = false; //是否被使用
    var self = object;

    this.spawn = function (x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.alive = true;
    };

    //繪出子彈
    this.draw = function () {
        if (self === "bullet") {
            this.context.clearRect(this.x - 1, this.y, imageRepository.bullet.width + 2, imageRepository.bullet.height);
        }
        else if (self === "enemyBullet") {
            this.context.clearRect(this.x - 1, this.y - 1, imageRepository.enemyBullet.width + 2, imageRepository.enemyBullet.height + 2);
        }

        this.y -= this.speed;
        if (this.isColliding) { //被碰撞
            return true;
        }

        if (self === "bullet" && this.y <= 0 - this.height) { //當子彈跑出螢幕
            return true;
        }
        else if (self === "enemyBullet" && this.y >= this.canvasHeight) {
            return true;
        }
        else {
            if (self === "bullet") {
                this.context.drawImage(imageRepository.bullet, this.x, this.y);
            }
            else if (self === "enemyBullet") {
                this.context.drawImage(imageRepository.enemyBullet, this.x, this.y);
            }
            return false;
        }
    };

    //清除子彈
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Bullet.prototype = new Drawable();

//阿帕契機體
function Ship() {
    this.magazine = 12;
    this.speed = 3;
    this.bulletPool = new Pool(this.magazine);
    this.bulletPool.init("bullet");

    var fireRate = 15; //開火延遲
    var counter = 0;

    this.collidableWith = "enemyBullet";
    this.type = "ship"

    this.init = function (x, y, width, height) {
        // Defualt variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.alive = true;
        this.isColliding = false;
        this.bulletPool.init("bullet");
    }

    this.draw = function () {
        this.context.save();
        this.context.translate(this.x, this.y);
        this.context.drawImage(imageRepository.spaceship, 0, 0);

        this.context.save();
        this.context.translate((imageRepository.AH64_blade.width / 2), (imageRepository.AH64_blade.height / 2));
        this.context.rotate(counter * 12 * Math.PI / 180);
        this.context.drawImage(imageRepository.AH64_blade, -(imageRepository.AH64_blade.width / 2), -(imageRepository.AH64_blade.height / 2));
        this.context.restore();

        this.context.restore();

    };
    this.move = function () {
        counter++;
        //若有移動
        if (KEY_STATUS.left || KEY_STATUS.right ||
            KEY_STATUS.down || KEY_STATUS.up) {

            this.context.clearRect(this.x - 12, this.y - 12, this.width + 25, this.height + 15);

            //方向鍵控制
            if (KEY_STATUS.left) {
                this.x -= this.speed
                if (this.x <= 0) // Keep player within the screen
                    this.x = 0;
            } else if (KEY_STATUS.right) {
                this.x += this.speed
                if (this.x >= this.canvasWidth - this.width)
                    this.x = this.canvasWidth - this.width;
            } else if (KEY_STATUS.up) {
                this.y -= this.speed
                if (this.y <= this.canvasHeight / 4 * 2)
                    this.y = this.canvasHeight / 4 * 2;
            } else if (KEY_STATUS.down) {
                this.y += this.speed
                if (this.y >= this.canvasHeight - this.height)
                    this.y = this.canvasHeight - this.height;
            }

            if (!this.isColliding) {
                this.draw();
            }
            else { //若被擊中
                this.alive = false;
                game.gameOver();
            }
        }
        //清掉前一個位置
        if (counter % 3 == 0) {
            this.context.clearRect(this.x - 12, this.y - 12, this.width + 25, this.height + 15);
            if (!this.isColliding) {
                this.draw();
            }
            else { //若被擊中
                this.alive = false;
                game.isplaying = false;
                game.gameOver();
            }
        }


        //空白鍵開火
        if (KEY_STATUS.space && counter >= fireRate) {

            this.fire();
            counter = 0;
        }
    };

    //發射兩發子彈
    this.fire = function () {
        this.bulletPool.getTwo(this.x + 9, this.y, 3,
            this.x + 33, this.y, 3);

    };
}
Ship.prototype = new Drawable();


//敵機
function Enemy() {
    var percentFire = .005;
    var chance = 0;
    this.cnt = 0;
    this.alive = false;

    this.collidableWith = "bullet";
    this.type = "enemy";

    this.spawn = function (x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.speedX = 0;
        this.speedY = speed;
        this.alive = true;
        this.leftEdge = this.x - 100;
        this.rightEdge = this.x + 100;
        this.bottomEdge = this.y + 160;
    };

    //敵機移動
    this.draw = function () {
        this.context.clearRect(this.x - 1, this.y, imageRepository.enemy.width + 2, imageRepository.enemy.height);
        this.x += this.speedX;
        this.y += this.speedY;


        if (this.x <= this.leftEdge) {
            this.speedX = this.speed;
        }
        else if (this.x >= this.rightEdge + this.width) {
            this.speedX = -this.speed;
        }

        if (this.cnt >= 60 && game.level > 2) {

            console.log("cnt");
            chance = Math.floor(Math.random() * 101) / 100;
            if (chance < 0.1) {
                console.log('change');
                if (this.x <= game.ship.x) {
                    this.speedX = this.speed;
                }
                else if (this.x > game.ship.x) {
                    this.speedX = -this.speed;
                }
            }
        }

        if (this.y >= this.bottomEdge) {
            this.speed = 1.5;
            this.speedY = 0;
            this.y -= 5;
            this.speedX = -this.speed;
        }

        if (!this.isColliding) {
            this.context.drawImage(imageRepository.enemy, this.x, this.y);

            // Enemy has a chance to shoot every movement
            chance = Math.floor(Math.random() * 101) / 100;
            if (chance < percentFire * game.level) {
                this.fire();
            }

            return false;
        }
        else {
            game.playerScore += 10 * game.enemy_num;
            return true;
        }
        this.cnt += 1;
        if (this.cnt > 60) {
            this.cnt = 0;
        }

    };

    /*
     * Fires a bullet
     */
    this.fire = function () {
        game.enemyBulletPool.get(this.x + this.width / 2, this.y + this.height, -2.5)

    }

    /*
     * Resets the enemy values
     */
    this.clear = function () {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Enemy.prototype = new Drawable();


/**
 * QuadTree object.
 *
 * The quadrant indexes are numbered as below:
 *     |
 *  1  |  0
 * ----+----
 *  2  |  3
 *     |
 */
//用於碰撞偵測
function QuadTree(boundBox, lvl) {
    var maxObjects = 10;
    this.bounds = boundBox || {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    var objects = [];
    this.nodes = [];
    var level = lvl || 0;
    var maxLevels = 5;

    /*
     * Clears the quadTree and all nodes of objects
     */
    this.clear = function () {
        objects = [];

        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].clear();
        }

        this.nodes = [];
    };

    /*
     * Get all objects in the quadTree
     */
    this.getAllObjects = function (returnedObjects) {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].getAllObjects(returnedObjects);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }

        return returnedObjects;
    };

    /*
     * Return all objects that the object could collide with
     */
    this.findObjects = function (returnedObjects, obj) {
        if (typeof obj === "undefined") {
            console.log("UNDEFINED OBJECT");
            return;
        }

        var index = this.getIndex(obj);
        if (index != -1 && this.nodes.length) {
            this.nodes[index].findObjects(returnedObjects, obj);
        }

        for (var i = 0, len = objects.length; i < len; i++) {
            returnedObjects.push(objects[i]);
        }

        return returnedObjects;
    };

    /*
     * Insert the object into the quadTree. If the tree
     * excedes the capacity, it will split and add all
     * objects to their corresponding nodes.
     */
    this.insert = function (obj) {
        if (typeof obj === "undefined") {
            return;
        }

        if (obj instanceof Array) {
            for (var i = 0, len = obj.length; i < len; i++) {
                this.insert(obj[i]);
            }

            return;
        }

        if (this.nodes.length) {
            var index = this.getIndex(obj);
            // Only add the object to a subnode if it can fit completely
            // within one
            if (index != -1) {
                this.nodes[index].insert(obj);

                return;
            }
        }

        objects.push(obj);

        // Prevent infinite splitting
        if (objects.length > maxObjects && level < maxLevels) {
            if (this.nodes[0] == null) {
                this.split();
            }

            var i = 0;
            while (i < objects.length) {

                var index = this.getIndex(objects[i]);
                if (index != -1) {
                    this.nodes[index].insert((objects.splice(i, 1))[0]);
                }
                else {
                    i++;
                }
            }
        }
    };

    /*
     * Determine which node the object belongs to. -1 means
     * object cannot completely fit within a node and is part
     * of the current node
     */
    this.getIndex = function (obj) {

        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

        // Object can fit completely within the top quadrant
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        // Object can fit completely within the bottom quandrant
        var bottomQuadrant = (obj.y > horizontalMidpoint);

        // Object can fit completely within the left quadrants
        if (obj.x < verticalMidpoint &&
            obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        // Object can fix completely within the right quandrants
        else if (obj.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }

        return index;
    };

    /*
     * Splits the node into 4 subnodes
     */
    this.split = function () {
        // Bitwise or [html5rocks]
        var subWidth = (this.bounds.width / 2) | 0;
        var subHeight = (this.bounds.height / 2) | 0;

        this.nodes[0] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[1] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[2] = new QuadTree({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[3] = new QuadTree({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
    };
}

//管理並重複利用物件
function Pool(maxSize) {
    var size = maxSize;
    var pool = [];

    this.getPool = function () {
        var obj = [];
        for (var i = 0; i < size; i++) {
            if (pool[i].alive) {
                obj.push(pool[i]);
            }
        }
        return obj;
    }

    this.init = function (object) {
        if (object == "bullet") { //阿帕契子彈
            for (var i = 0; i < size; i++) {
                // Initalize the object
                var bullet = new Bullet("bullet");
                bullet.init(0, 0, imageRepository.bullet.width, imageRepository.bullet.height);
                bullet.collidableWith = "enemy";
                bullet.type = "bullet"

                pool[i] = bullet;
            }
        }
        else if (object == "enemy") { //敵人機體
            for (var i = 0; i < size; i++) {
                var enemy = new Enemy();
                enemy.init(0, 0, imageRepository.enemy.width, imageRepository.enemy.height);
                pool[i] = enemy;
            }
        }
        else if (object == "enemyBullet") { //敵方子彈
            for (var i = 0; i < size; i++) {
                var bullet = new Bullet("enemyBullet");
                bullet.init(0, 0, imageRepository.enemyBullet.width, imageRepository.enemyBullet.height);
                bullet.collidableWith = "ship";
                bullet.type = "enemyBullet"

                pool[i] = bullet;
            }
        }
    };

    this.get = function (x, y, speed) {
        if (!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed); //產生子彈
            pool.unshift(pool.pop()); //將最後一個移到array開頭
        }
    };

    this.getTwo = function (x1, y1, speed1, x2, y2, speed2) {
        if (!pool[size - 1].alive && !pool[size - 2].alive) {
            this.get(x1, y1, speed1);
            this.get(x2, y2, speed2);
        }
    };


    this.animate = function () {
        for (var i = 0; i < size; i++) {
            // 回收可使用的子彈
            if (pool[i].alive) { //若子彈使用中
                if (pool[i].draw()) //且跑出螢幕外
                {
                    pool[i].clear();
                    pool.push((pool.splice(i, 1))[0]);
                }
            }
            else
                break;
        }
    };
}

//遊戲主體
function Game() {
    this.playerScore = 0;
    this.enemy_num = 1;
    this.level = 1;
    this.isplaying = false;

    this.init = function () {
        this.sceneCanvas = document.getElementById('scene');
        this.cloudCanvas = document.getElementById('cloud');
        this.shipCanvas = document.getElementById('ship');
        this.mainCanvas = document.getElementById('main');

        if (this.sceneCanvas.getContext) {
            this.sceneContext = this.sceneCanvas.getContext('2d');
            this.cloudContext = this.cloudCanvas.getContext('2d');
            this.shipContext = this.shipCanvas.getContext('2d');
            this.mainContext = this.mainCanvas.getContext('2d');

            Background.prototype.context = this.sceneContext;
            Background.prototype.canvasHeight = this.sceneCanvas.height;
            Background.prototype.canvasWidth = this.sceneCanvas.width;

            Cloud.prototype.context = this.cloudContext;
            Cloud.prototype.canvasHeight = this.cloudCanvas.height;
            Cloud.prototype.canvasWidth = this.cloudCanvas.width;

            Ship.prototype.context = this.shipContext;
            Ship.prototype.canvasWidth = this.shipCanvas.width;
            Ship.prototype.canvasHeight = this.shipCanvas.height;

            Bullet.prototype.context = this.mainContext;
            Bullet.prototype.canvasWidth = this.mainCanvas.width;
            Bullet.prototype.canvasHeight = this.mainCanvas.height;

            Enemy.prototype.context = this.mainContext;
            Enemy.prototype.canvasWidth = this.mainCanvas.width;
            Enemy.prototype.canvasHeight = this.mainCanvas.height;
            //背景初始化
            this.background = new Background();
            this.background.init(0, 0);

            this.cloud = new Cloud();
            this.cloud.init(0, 0, imageRepository.cloud.width, imageRepository.cloud.height);

            //阿帕契初始化
            this.ship = new Ship();
            this.shipStartX = this.shipCanvas.width / 2 - imageRepository.spaceship.width;
            this.shipStartY = this.shipCanvas.height - imageRepository.spaceship.height;
            this.ship.init(this.shipStartX, this.shipStartY, imageRepository.spaceship.width,
                imageRepository.spaceship.height);

            //敵機初始化
            this.enemyPool = new Pool(30);
            this.enemyPool.init("enemy");
            this.spawnWave();

            this.enemyBulletPool = new Pool(50);
            this.enemyBulletPool.init("enemyBullet");

            // Start QuadTree
            this.quadTree = new QuadTree({x: 0, y: 0, width: this.mainCanvas.width, height: this.mainCanvas.height});

            this.playerScore = 0;
            this.enemy_num = 1;
            this.level = 1;

        }
    };
    //產生一波敵機
    this.spawnWave = function () {
        var height = imageRepository.enemys[this.level].height;
        var width = imageRepository.enemys[this.level].width;
        var x = 100;
        var y = -height;
        var spacer = y * 1.5;
        for (var i = 1; i <= this.enemy_num; i++) {
            this.enemyPool.get(x, y, (game.level / 2) + 2);
            x += width + 40;
            if (i % 5 == 0) {
                x = 100;
            }
        }

    }
    this.start = function () {
        isplaying = true;
        this.ship.draw();
        animate();
    }
    // Restart the game
    this.restart = function () {
        $("#game-over").slideUp(500);
        this.playerScore = 0;
        this.enemy_num = 1;
        this.level = 1;

        this.sceneContext.clearRect(0, 0, this.sceneCanvas.width, this.sceneCanvas.height);
        this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
        this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        this.cloudContext.clearRect(0, 0, this.cloudCanvas.width, this.cloudCanvas.height);

        this.quadTree.clear();

        this.background.init(0, 0);
        this.cloud.init(0, 0, imageRepository.cloud.width, imageRepository.cloud.height);

        this.ship.init(this.shipStartX, this.shipStartY,
            imageRepository.spaceship.width, imageRepository.spaceship.height);

        this.enemyPool.init("enemy");
        this.spawnWave();
        this.enemyBulletPool.init("enemyBullet");

        imageRepository.enemyBullet = imageRepository.enemyBullets[game.level];
        imageRepository.enemy = imageRepository.enemys[game.level];

        this.start();

    };

    // Game over
    this.gameOver = function () {
        $("#game-over").fadeIn(500);
        $(document).keypress(keyUpFunc);
    };
}


function animate() {
    if (game.isplaying) {
        $("#score").html("SCORE: " + game.playerScore);
        $("#level").html("LEVEL: " + game.level);

        // 將物件加入quadTree
        game.quadTree.clear();
        game.quadTree.insert(game.ship);
        game.quadTree.insert(game.ship.bulletPool.getPool());
        game.quadTree.insert(game.enemyPool.getPool());
        game.quadTree.insert(game.enemyBulletPool.getPool());
        detectCollision(); //偵測碰撞

        //產生新的一波敵機
        if (game.enemyPool.getPool().length === 0) {
            if (game.enemy_num < game.level + 2) {
                game.enemy_num += 1;
                game.spawnWave();
            }
            else {
                game.level += 1;
                if (game.level <= 4) {
                    imageRepository.enemyBullet = imageRepository.enemyBullets[game.level];
                    imageRepository.enemy = imageRepository.enemys[game.level];
                }
                else {
                    alert("No Cheating!!!");
                    game.isplaying = false;
                    game.gameOver();

                }

                game.enemy_num = game.level;
                game.spawnWave();
            }
        }
        //遊戲物件動畫
        requestAnimFrame(animate);

        game.background.draw();
        game.cloud.draw();
        game.ship.move();
        game.ship.bulletPool.animate();
        game.enemyPool.animate();
        game.enemyBulletPool.animate();
    }
}

function detectCollision() {
    var objects = [];
    game.quadTree.getAllObjects(objects);

    for (var x = 0, len = objects.length; x < len; x++) {
        game.quadTree.findObjects(obj = [], objects[x]);

        for (y = 0, length = obj.length; y < length; y++) {

            // DETECT COLLISION ALGORITHM
            if (objects[x].collidableWith === obj[y].type &&
                (objects[x].x < obj[y].x + obj[y].width &&
                objects[x].x + objects[x].width > obj[y].x &&
                objects[x].y < obj[y].y + obj[y].height &&
                objects[x].y + objects[x].height > obj[y].y)) {
                objects[x].isColliding = true;
                obj[y].isColliding = true;
            }
        }
    }
};

