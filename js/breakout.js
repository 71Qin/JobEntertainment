export class BreakoutGame {
  constructor(canvas, infoEl){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.infoEl = infoEl;

    this.running = false;
    this.raf = null;

    this._onMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.paddle.x = x - this.paddle.w/2;
      this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.w, this.paddle.x));
    };

    this._onTouch = (e) => {
      if(!e.touches?.length) return;
      const t = e.touches[0];
      this._onMove({clientX:t.clientX, clientY:t.clientY});
    };
  }

  start(){
    this.stop();
    this.running = true;

    this.score = 0;
    this.lives = 3;

    this.paddle = {w:120,h:14,x:(this.canvas.width-120)/2,y:this.canvas.height-28};
    this.ball = {r:8,x:this.canvas.width/2,y:this.canvas.height-60,vx:4,vy:-4};

    this.brick = {rows:5, cols:10, w:78, h:18, pad:10, top:50, left:30};
    this.bricks = [];
    for(let r=0;r<this.brick.rows;r++){
      for(let c=0;c<this.brick.cols;c++){
        this.bricks.push({r,c,alive:true});
      }
    }

    this.canvas.addEventListener("mousemove", this._onMove);
    this.canvas.addEventListener("touchmove", this._onTouch, {passive:true});
    this.infoEl.textContent = "打砖块：鼠标/触摸移动挡板。";

    this._loop();
  }

  stop(){
    this.running = false;
    if(this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.canvas.removeEventListener("mousemove", this._onMove);
    this.canvas.removeEventListener("touchmove", this._onTouch);
    this._clear();
  }

  _loop(){
    if(!this.running) return;
    this._update();
    this._draw();
    this.raf = requestAnimationFrame(()=>this._loop());
  }

  _update(){
    const b = this.ball;

    b.x += b.vx;
    b.y += b.vy;

    // 撞墙
    if(b.x-b.r<0 || b.x+b.r>this.canvas.width) b.vx *= -1;
    if(b.y-b.r<0) b.vy *= -1;

    // 挡板碰撞
    const p = this.paddle;
    if(b.y+b.r >= p.y && b.y+b.r <= p.y+p.h && b.x >= p.x && b.x <= p.x+p.w){
      b.vy = -Math.abs(b.vy);
      // 根据击中位置改变vx
      const hit = (b.x - (p.x+p.w/2)) / (p.w/2);
      b.vx = hit * 6;
    }

    // 砖块碰撞
    const {w,h,pad,top,left,cols} = this.brick;
    for(const br of this.bricks){
      if(!br.alive) continue;
      const x = left + br.c*(w+pad);
      const y = top + br.r*(h+pad);
      if(b.x > x && b.x < x+w && b.y-b.r < y+h && b.y+b.r > y){
        br.alive = false;
        b.vy *= -1;
        this.score++;
        break;
      }
    }

    // 掉下去
    if(b.y-b.r > this.canvas.height){
      this.lives--;
      if(this.lives<=0){
        this.infoEl.textContent = `游戏结束！得分：${this.score}（点击上方按钮可重开）`;
        return this.stop();
      }
      // 复位球
      this.ball = {r:8,x:this.canvas.width/2,y:this.canvas.height-60,vx:4,vy:-4};
    }

    // 胜利
    if(this.bricks.every(x=>!x.alive)){
      this.infoEl.textContent = `通关！得分：${this.score}（点击上方按钮可重开）`;
      return this.stop();
    }

    this.infoEl.textContent = `打砖块：鼠标/触摸移动挡板。得分：${this.score} 生命：${this.lives}`;
  }

  _clear(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  }

  _draw(){
    const ctx = this.ctx;
    this._clear();

    // 砖块
    const {w,h,pad,top,left} = this.brick;
    for(const br of this.bricks){
      if(!br.alive) continue;
      const x = left + br.c*(w+pad);
      const y = top + br.r*(h+pad);
      ctx.fillStyle = "#6aa9ff";
      ctx.fillRect(x,y,w,h);
    }

    // 挡板
    ctx.fillStyle = "#111";
    ctx.fillRect(this.paddle.x,this.paddle.y,this.paddle.w,this.paddle.h);

    // 球
    ctx.beginPath();
    ctx.arc(this.ball.x,this.ball.y,this.ball.r,0,Math.PI*2);
    ctx.fillStyle = "#ff9fd2";
    ctx.fill();
  }
}
