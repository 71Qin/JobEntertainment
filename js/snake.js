export class SnakeGame {
  constructor(canvas, infoEl){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.infoEl = infoEl;

    this.grid = 20;
    this.cols = Math.floor(canvas.width / this.grid);
    this.rows = Math.floor(canvas.height / this.grid);

    this.running = false;
    this.timer = null;

    this._onKey = (e) => {
      const k = e.key.toLowerCase();
      if(k === "arrowup" && this.dir.y !== 1) this.dir = {x:0,y:-1};
      if(k === "arrowdown" && this.dir.y !== -1) this.dir = {x:0,y:1};
      if(k === "arrowleft" && this.dir.x !== 1) this.dir = {x:-1,y:0};
      if(k === "arrowright" && this.dir.x !== -1) this.dir = {x:1,y:0};
    };
  }

  start(){
    this.stop();
    this.running = true;

    this.snake = [{x:5,y:5},{x:4,y:5},{x:3,y:5}];
    this.dir = {x:1,y:0};
    this.food = this._randFood();
    this.score = 0;

    window.addEventListener("keydown", this._onKey);
    this.infoEl.textContent = "贪吃蛇：方向键控制。";

    this.timer = setInterval(()=>this._tick(), 110);
    this._draw();
  }

  stop(){
    this.running = false;
    if(this.timer) clearInterval(this.timer);
    this.timer = null;
    window.removeEventListener("keydown", this._onKey);
    this._clear();
  }

  _randFood(){
    while(true){
      const p = {x:Math.floor(Math.random()*this.cols), y:Math.floor(Math.random()*this.rows)};
      if(!this.snake?.some(s=>s.x===p.x && s.y===p.y)) return p;
    }
  }

  _tick(){
    if(!this.running) return;

    const head = this.snake[0];
    const next = {x: head.x + this.dir.x, y: head.y + this.dir.y};

    // 撞墙
    if(next.x<0 || next.y<0 || next.x>=this.cols || next.y>=this.rows){
      return this._gameOver();
    }
    // 撞自己
    if(this.snake.some(s=>s.x===next.x && s.y===next.y)){
      return this._gameOver();
    }

    this.snake.unshift(next);

    // 吃到食物
    if(next.x===this.food.x && next.y===this.food.y){
      this.score++;
      this.food = this._randFood();
    } else {
      this.snake.pop();
    }

    this._draw();
  }

  _gameOver(){
    this.infoEl.textContent = `游戏结束！得分：${this.score}（点击上方按钮可重新开始）`;
    this.stop();
  }

  _clear(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  }

  _draw(){
    const ctx = this.ctx;
    this._clear();

    // 背景网格（轻微）
    ctx.globalAlpha = 0.15;
    for(let x=0;x<this.canvas.width;x+=this.grid){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,this.canvas.height); ctx.stroke();
    }
    for(let y=0;y<this.canvas.height;y+=this.grid){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(this.canvas.width,y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 食物
    ctx.fillStyle = "#ff6aa2";
    ctx.fillRect(this.food.x*this.grid, this.food.y*this.grid, this.grid, this.grid);

    // 蛇
    ctx.fillStyle = "#6aa9ff";
    for(const s of this.snake){
      ctx.fillRect(s.x*this.grid, s.y*this.grid, this.grid, this.grid);
    }

    this.infoEl.textContent = `贪吃蛇：方向键控制。得分：${this.score}`;
  }
}
