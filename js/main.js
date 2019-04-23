var game = new Phaser.Game(240, 400, Phaser.CANVAS, 'game')
var upKey
game.Mystate = {}
//boot state 一般是对游戏进行一些设置
game.score = 0
game.Mystate.boot = {
    preload: function () {
        game.load.image('preload', 'assets/preloader.gif')//进度条
        if (!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT//屏幕适应
        }

    },
    create: function () {
        game.state.start('load')
    }
}//加载场景
game.Mystate.load = {
    //load state，一般加载资源
    preload: function () {
        console.log('preload1')
        var preloadSprite = game.add.sprite(game.width / 2 - 220 / 2, game.height / 2 - 19 / 2, 'preload')//加入进度条位置
        //    preloadSprite.anchor.setTo(0.5,0.5)//锚点
        game.load.setPreloadSprite(preloadSprite)
        game.load.image('background', 'assets/bg.jpg');
        game.load.image('copyright', 'assets/copyright.png');
        game.load.spritesheet('myplane', 'assets/myplane.png', 40, 40, 4);
        game.load.spritesheet('startbutton', 'assets/startbutton.png', 100, 40, 2);
        game.load.spritesheet('replaybutton', 'assets/replaybutton.png', 80, 30, 2);
        game.load.spritesheet('sharebutton', 'assets/sharebutton.png', 80, 30, 2);
        game.load.image('mybullet', 'assets/mybullet.png');
        game.load.image('bullet', 'assets/bullet.png');
        game.load.image('enemy1', 'assets/enemy1.png');
        game.load.image('enemy2', 'assets/enemy2.png');
        game.load.image('enemy3', 'assets/enemy3.png');
        game.load.spritesheet('explode1', 'assets/explode1.png', 20, 20, 3);
        game.load.spritesheet('explode2', 'assets/explode2.png', 30, 30, 3);
        game.load.spritesheet('explode3', 'assets/explode3.png', 50, 50, 3);
        game.load.spritesheet('myexplode', 'assets/myexplode.png', 40, 40, 3);
        game.load.image('award', 'assets/award.png');
        game.load.onFileComplete.add(function (process) {
            console.log(process)
        })//可以显示加载百分比
        game.load.audio('normalback', 'assets/normalback.mp3');
        game.load.audio('playback', 'assets/playback.mp3');
        game.load.audio('fashe', 'assets/fashe.mp3');
        game.load.audio('crash1', 'assets/crash1.mp3');
        game.load.audio('crash2', 'assets/crash2.mp3');
        game.load.audio('crash3', 'assets/crash3.mp3');
        game.load.audio('ao', 'assets/ao.mp3');
        game.load.audio('pi', 'assets/pi.mp3');
        game.load.audio('deng', 'assets/deng.mp3');
    },
    create: function () {
        game.state.start('start')
    }
}//场景1
game.Mystate.start = {
    //start state 游戏开始界面
    create: function () {
        // console.log('create1')
        game.add.sprite(0, 0, 'background')//背景
        game.add.image(12, game.height - 16, 'copyright')
        var myplane = game.add.sprite(100, 100, 'myplane')
        myplane.animations.add('fly')
        myplane.animations.play('fly', 12, true)
        game.add.button(70, 200, 'startbutton', this.onStartClick, this, 1, 1, 0)
    },
    onStartClick: function () {
        console.log('click')
        game.state.start('play')
    }

}//场景1
game.Mystate.over = {//游戏结束界面

    create: function () {
        game.add.sprite(0, 0, 'background')//背景
        game.add.image(12, game.height - 16, 'copyright')
        var myplane = game.add.sprite(100, 100, 'myplane')
        myplane.animations.add('fly')
        myplane.animations.play('fly', 12, true)
        var style = { font: "bold 32px Arial", fill: "#f00", boundsAlignH: "center", boundsAlignV: "middle" }
        text = game.add.text(0, 0, "Score:  " + game.score, style)
        text.setTextBounds(0, 0, game.width, game.height)
        game.add.button(30, 300, 'replaybutton', this.onReplayClick, this, 0, 0, 1)
        game.add.button(130, 300, 'sharebutton', this.onShareClick, this, 0, 0, 1)

    },
    onReplayClick: function () {
        game.state.start('play')
        game.score = 0
    },
    onShareClick: function () {

    }
}//加载场景
game.Mystate.play = {
    //play state 游戏主界面
    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE)//开启ARCADE物理引擎
        var bg = game.add.tileSprite(0, 0, game.width, game.height, 'background')//可滚动背景
        bg.autoScroll(0, 20)//设置背景自动向下滚动20
        this.myplane = game.add.sprite(100, 100, 'myplane')//创建飞机
        this.myplane.animations.add('fly')
        this.myplane.animations.play('fly', 12, true);
        game.physics.arcade.enable(this.myplane);//精灵物理属性
        this.myplane.body.collideWorldBounds = true;//使飞机与游戏边界进行碰撞

        //飞机飞到底部的动画
        var tween = game.add.tween(this.myplane).to({ y: game.height - 40 }, 1000, null, true)//渐变动画
        tween.onComplete.add(this.onStart, this)//渐变动画完成之后触发回调函数
    },
    update: function () {

        if (this.myplane.myStartFile) {//每隔500毫秒发射一颗子弹
            this.myPlaneFire();
            this.generateEnemy();
            this.enemyFire();
            // this.generateAward()
            //我方子弹和敌机碰撞检测
            game.physics.arcade.overlap(this.myBullets, this.enemys, this.hitEnemy, null, this)
            //敌方子弹和我方飞机碰撞检测
            game.physics.arcade.overlap(this.enemyBullets, this.myplane, this.hitPlane, null, this)
            //我方飞机与奖牌碰撞检测
            game.physics.arcade.overlap(this.awards, this.myplane, this.getAward, null, this)
        }

    },
    getAward:function(myplane,award){
        award.kill()
        if(myplane.life<3){
            myplane.life=myplane.life+1
        }
    },
    hitEnemy: function (bullet, enemy) {
        enemy.life = enemy.life - 1
        if (enemy.life <= 0) {
            enemy.kill()//发生碰撞时，飞机消失
            var explode = game.add.sprite(enemy.x, enemy.y, 'explode' + enemy.index)
            explode.anchor.setTo(0.5, 0.5)
            var anmi = explode.animations.add('explode')
            anmi.play(30, false, false)
            anmi.onComplete.addOnce(function () {
                explode.destroy();
                game.score = game.score + enemy.score
                this.text.text = "Score: " + game.score;
            }, this)
        }
        //  enemy.kill()//发生碰撞时，飞机消失

        bullet.kill()//发生碰撞时，子弹消失
    },
    hitPlane: function (myplane, bullet) {
        bullet.kill()
        myplane.life = myplane.life - 1
        if (this.myplane.life <= 0) {
            myplane.kill()

            var explode = game.add.sprite(myplane.x, myplane.y, 'myexplode')
            //   explode.anchor.setTo(0.5,0.5)
            var anmi = explode.animations.add('explode')
            anmi.play(30, false, false)
            anmi.onComplete.addOnce(function () {
                explode.destroy();
                game.state.start('over')

            })
        }

    },
    onStart: function () {
        this.myplane.inputEnabled = true//允许输入
        this.myplane.input.enableDrag(true)//允许拖拽
        this.myplane.myStartFile = true;//做标记
        this.myplane.life = 2;
        this.lastBulletTime = 0;//初始值，后面判断子弹发出间隔
        this.myBullets = game.add.group()//创建飞机group
        // this.myBullets.createMultiple(50, 'mybullet')
        // this.myBullets.enableBody = true;//物理引擎
        // this.myBullets.setAll('outOfBoundsKill',true)
        // this.myBullets.setAll('checkWorldBounds',true)//检测是否碰撞
        this.enemys = game.add.group();//创建敌方飞机组
        this.enemys.lastEnemyime = 0
        this.enemyBullets = game.add.group()//创建敌方子弹组
        var style = { font: "16px Arial", fill: "#ff0000" }
        this.text = game.add.text(0, 0, "Score: 0", style)//设置左上角分数字体样式并加入
        //奖牌组
        this.awards = game.add.group();
        //奖牌每隔30秒产生一次
        game.time.events.loop(Phaser.Timer.SECOND * 15, this.generateAward, this)
    },
    generateAward: function () {
        var awardSize = game.cache.getImage('award')
        var x = game.rnd.integerInRange(0, game.width - awardSize.width)
        var y = -awardSize.height
        var award = this.awards.getFirstExists(false, true, x, y, 'award')
        award.outOfBoundsKill = true;
        award.checkWorldBounds = true;
        game.physics.arcade.enable(award);
        award.body.velocity.y = 300
    },
    myPlaneFire: function () {
        var getMyPlaneBullet = function () {
            var myBullet = this.myBullets.getFirstExists(false)
            if (myBullet) { //获取到了


                myBullet.reset(this.myplane.x + 15, this.myplane.y - 10)//重置位置

                // this.myBullets.add(myBullet)//将子弹加到group里面使其具有物理属性
            } else {
                //没有获取到，就创建一个
                myBullet = game.add.sprite(this.myplane.x + 15, this.myplane.y - 10, 'mybullet')
                //把他加到组里面
                myBullet.checkWorldBounds = true;
                myBullet.outOfBoundsKill = true
                this.myBullets.addChild(myBullet)
                game.physics.enable(myBullet, Phaser.Physics.ARCADE);//物理属性
            }
            return myBullet
        }

        var now = new Date().getTime()
        if (this.myplane.alive && now - this.lastBulletTime > 500) {//每隔500毫秒发射一颗子弹
            var myBullet = getMyPlaneBullet.call(this)
            myBullet.body.velocity.y = -200;//子弹向上速度
            this.lastBulletTime = now;
            if (this.myplane.life >= 2) {//使飞机同时发射三颗子弹
                myBullet = getMyPlaneBullet.call(this)
                myBullet.body.velocity.y = -200;//子弹向上速度
                myBullet.body.velocity.x = -20;//子弹向上速度
                myBullet = getMyPlaneBullet.call(this)
                myBullet.body.velocity.y = -200;//子弹向上速度
                myBullet.body.velocity.x = 20;//子弹向上速度

            }
            if (this.myplane.life >= 3) {//使飞机同时发射五颗子弹
                myBullet = getMyPlaneBullet.call(this)
                myBullet.body.velocity.y = -200;//子弹向上速度
                myBullet.body.velocity.x = -40;//子弹横向速度(向左)
                myBullet = getMyPlaneBullet.call(this)
                myBullet.body.velocity.y = -200;//子弹向上速度
                myBullet.body.velocity.x = 40;//子弹横向速度(向右)

            }
        }
    },
    generateEnemy: function () {
        //取一个随机数
        var now = new Date().getTime()
        if (now - this.enemys.lastEnemyime > 2000) {
            var enemyIndex = game.rnd.integerInRange(0, 2)
            var key = 'enemy' + (enemyIndex + 1)
            var size = game.cache.getImage(key).width
            var x = game.rnd.integerInRange(size / 2, game.width - size / 2)
            var y = 0
            console.log(key, x, y, size)
            var enemy = this.enemys.getFirstExists(false, true, x, y, key)//从池中获取飞机
            enemy.anchor.setTo(0.5, 0.5);//锚点
            enemy.outOfBoundsKill = true;
            enemy.checkWorldBounds = true;
            game.physics.arcade.enable(enemy);//精灵物理属性
            enemy.body.setSize(size, size)//解决
            enemy.size = size
            enemy.index = enemyIndex + 1
            enemy.body.velocity.y = 20//飞机下落速度
            enemy.lastFireTime = 0;
            if (enemyIndex == 0) {
                enemy.bulletV = 50;
                enemy.bulletTime = 6000;
                enemy.life = 1
                enemy.score = 20
            } else if (enemyIndex == 1) {
                enemy.bulletV = 80;
                enemy.bulletTime = 4000;
                enemy.life = 3
                enemy.score = 30
            } else if (enemyIndex == 2) {
                enemy.bulletV = 120;
                enemy.bulletTime = 2000;
                enemy.life = 5
                enemy.score = 50
            }
            this.enemys.lastEnemyime = now

        }
        console.log(this.enemys.length)
    },
    // render: function () {
    //     if (this.enemys) {
    //         this.enemys.forEachAlive(function (enemy) {
    //             game.debug.body(enemy)
    //         })
    //     }
    // },
    enemyFire: function () {
        var now = new Date().getTime()
        this.enemys.forEachAlive(function (enemy) {
            // console.log("fash")
            if (now - enemy.lastFireTime > enemy.bulletTime) {

                //敌人发射子弹
                var bullet = this.enemyBullets.getFirstExists(false, true, enemy.x, enemy.y + enemy.size, "bullet")
                bullet.anchor.setTo(0.5, 0.5);//锚点
                bullet.outOfBoundsKill = true;
                bullet.checkWorldBounds = true;
                game.physics.arcade.enable(bullet);//精灵物理属性
                //   bullet.body.setSize(size, size)//解决

                bullet.body.velocity.y = enemy.bulletV//飞机下落速度
                enemy.lastFireTime = now;
            }
        }, this)
    }


}

// var  state={preload:preload,create:create,update:update}//定义场景
// function preload(){
//     console.log("preload")
// }
// function create(){
//     console.log("create")
// }
// function update(){
//     console.log("update")
// }
// function state(){
//     this.preload=function(){
//         console.log('preload')
//     }
// }
game.state.add('boot', game.Mystate.boot)//加入场景1

game.state.add('load', game.Mystate.load)//加入场景1

game.state.add('start', game.Mystate.start)//加入场景1
game.state.add('play', game.Mystate.play)//加入场景1
game.state.add('over', game.Mystate.over)//加入场景1


// game.state.add('state2', game.Mystate.state2)//加入场景2

game.state.start('boot')//开始场景state