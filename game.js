class Snake {
    constructor() {
        this.body = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    move(food) {
        const head = { ...this.body[0] };

        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        this.body.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            return true;
        }

        this.body.pop();
        return false;
    }

    changeDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (opposites[this.direction] !== newDirection) {
            this.direction = newDirection;
            this.nextDirection = newDirection;
        }
    }

    update() {
        this.direction = this.nextDirection;
    }

    checkCollision(gridSize) {
        const head = this.body[0];
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            return true;
        }

        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                return true;
            }
        }
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileSize = this.canvas.width / this.gridSize;
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.speed = 300;

        this.setupEventListeners();
        this.gameLoop();
    }

    generateFood() {
        const food = {
            x: Math.floor(Math.random() * this.gridSize),
            y: Math.floor(Math.random() * this.gridSize)
        };

        // 确保食物不会生成在蛇身上
        for (const segment of this.snake.body) {
            if (food.x === segment.x && food.y === segment.y) {
                return this.generateFood();
            }
        }
        return food;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const keyActions = {
                'ArrowUp': () => this.snake.changeDirection('up'),
                'ArrowDown': () => this.snake.changeDirection('down'),
                'ArrowLeft': () => this.snake.changeDirection('left'),
                'ArrowRight': () => this.snake.changeDirection('right'),
                'w': () => this.snake.changeDirection('up'),
                's': () => this.snake.changeDirection('down'),
                'a': () => this.snake.changeDirection('left'),
                'd': () => this.snake.changeDirection('right')
            };

            const action = keyActions[e.key];
            if (action) action();
        });
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制龙珠（食物）
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x + 0.5) * this.tileSize,
            (this.food.y + 0.5) * this.tileSize,
            this.tileSize * 0.4,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        this.ctx.strokeStyle = '#DAA520';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // 绘制龙身
        this.snake.body.forEach((segment, index) => {
            const x = segment.x * this.tileSize;
            const y = segment.y * this.tileSize;
            
            if (index === 0) {
                // 绘制龙头
                this.ctx.fillStyle = '#FF4500';
                this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                
                // 添加龙的眼睛
                const eyeSize = this.tileSize * 0.2;
                this.ctx.fillStyle = '#000';
                switch(this.snake.direction) {
                    case 'right':
                        this.ctx.fillRect(x + this.tileSize * 0.7, y + this.tileSize * 0.2, eyeSize, eyeSize);
                        this.ctx.fillRect(x + this.tileSize * 0.7, y + this.tileSize * 0.6, eyeSize, eyeSize);
                        break;
                    case 'left':
                        this.ctx.fillRect(x + this.tileSize * 0.1, y + this.tileSize * 0.2, eyeSize, eyeSize);
                        this.ctx.fillRect(x + this.tileSize * 0.1, y + this.tileSize * 0.6, eyeSize, eyeSize);
                        break;
                    case 'up':
                        this.ctx.fillRect(x + this.tileSize * 0.2, y + this.tileSize * 0.1, eyeSize, eyeSize);
                        this.ctx.fillRect(x + this.tileSize * 0.6, y + this.tileSize * 0.1, eyeSize, eyeSize);
                        break;
                    case 'down':
                        this.ctx.fillRect(x + this.tileSize * 0.2, y + this.tileSize * 0.7, eyeSize, eyeSize);
                        this.ctx.fillRect(x + this.tileSize * 0.6, y + this.tileSize * 0.7, eyeSize, eyeSize);
                        break;
                }
            } else {
                // 绘制龙身，使用渐变色
                const gradient = this.ctx.createLinearGradient(x, y, x + this.tileSize, y + this.tileSize);
                gradient.addColorStop(0, '#CD853F');
                gradient.addColorStop(1, '#8B4513');
                this.ctx.fillStyle = gradient;
                
                // 绘制圆角矩形作为龙的鳞片
                this.ctx.beginPath();
                this.ctx.roundRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4, 5);
                this.ctx.fill();
            }
        });

        // 绘制网格
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.tileSize, 0);
            this.ctx.lineTo(i * this.tileSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.tileSize);
            this.ctx.lineTo(this.canvas.width, i * this.tileSize);
            this.ctx.stroke();
        }

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(
                '按空格键重新开始',
                this.canvas.width / 2,
                this.canvas.height / 2 + 40
            );
        }
    }

    updateScore() {
        document.getElementById('scoreValue').textContent = this.score;
    }

    reset() {
        this.snake = new Snake();
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.updateScore();
    }

    gameLoop() {
        if (!this.gameOver) {
            this.snake.update();
            if (this.snake.move(this.food)) {
                this.score += 10;
                this.updateScore();
                this.food = this.generateFood();
                // 增加游戏难度
                if (this.speed > 100) {
                    this.speed -= 1;
                }
            }

            if (this.snake.checkCollision(this.gridSize)) {
                this.gameOver = true;
            }
        }

        this.draw();
        setTimeout(() => this.gameLoop(), this.speed);
    }
}

// 添加空格键重新开始游戏的功能
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const game = window.game;
        if (game.gameOver) {
            game.reset();
        }
    }
});

// 启动游戏
window.onload = () => {
    window.game = new Game();
};