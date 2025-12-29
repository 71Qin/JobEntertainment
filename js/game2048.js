export class Game2048 {
  constructor(canvas, infoEl){
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.infoEl = infoEl;

    this.size = 4;
    this.cell = 110;
    this.gap = 12;

    this.running = false;

    this._onKey = (e) => {
      const k = e.key.toLowerCase();
      const map = {
        arrowup: "up", arrowdown:"down", arrowleft:"left", arrowright:"right",
        w:"up", s:"down", a:"left", d:"right"
      };
      if(!map[k]) return;
      e.preventDefault();
      this.move(map[k]);
    };
  }

  start(){
    this.stop();
    this.running = true;

    this.score = 0;
    this.grid = Array.from({length:this.size},()=>Array(this.size).fill(0));
    this._spawn();
    this._spawn();

    window.addEventListener("keydown", this._onKey, {passive:false});
    this._draw();
    this.infoEl.textContent = "2048：方向键或 WASD。";
  }

  stop(){
    this.running = false;
    window.removeEventListener("keydown", this._onKey);
    this._clear();
  }

  _spawn(){
    const empties = [];
    for(let r=0;r<this.size;r++){
      for(let c=0;c<this.size;c++){
        if(this.grid[r][c]===0) empties.push([r,c]);
      }
    }
    if(!empties.length) return;
    const [r,c] = empties[Math.floor(Math.random()*empties.length)];
    this.grid[r][c] = Math.random()<0.9 ? 2 : 4;
  }

  move(dir){
    if(!this.running) return;

    const before = JSON.stringify(this.grid);

    const rotate = (g)=>g[0].map((_,i)=>g.map(row=>row[i]).reverse());
    const flip = (g)=>g.map(row=>row.slice().reverse());

    let g = this.grid.map(r=>r.slice());

    // 统一处理成“向左合并”
    if(dir==="up"){ g = rotate(g); }
    else if(dir==="right"){ g = flip(g); }
    else if(dir==="down"){ g = rotate(rotate(rotate(g))); }

    const merged = g.map(row => this._mergeRowLeft(row));

    // 还原方向
    let out = merged;
    if(dir==="up"){ out = rotate(rotate(rotate(out))); }
    else if(dir==="right"){ out = flip(out); }
    else if(dir==="down"){ out = rotate(out); }

    this.grid = out;

    const after = JSON.stringify(this.grid);
    if(before !== after){
      this._spawn();
      this._draw();
      if(this._isGameOver()){
        this.infoEl.textContent = `游戏结束！得分：${this.score}（点击上方按钮可重开）`;
        this.stop();
      } else {
        this.infoEl.textContent = `2048：方向键/WASD。得分：${this.score}`;
      }
    }
  }

  _mergeRowLeft(row){
    const arr = row.filter(x=>x!==0);
    for(let i=0;i<arr.length-1;i++){
      if(arr[i]===arr[i+1]){
        arr[i]*=2;
        this.score += arr[i];
        arr[i+1]=0;
        i++;
      }
    }
    const out = arr.filter(x=>x!==0);
    while(out.length<this.size) out.push(0);
    return out;
  }

  _isGameOver(){
    // 有空格就没结束
    for(let r=0;r<this.size;r++){
      for(let c=0;c<this.size;c++){
        if(this.grid[r][c]===0) return false;
      }
    }
    // 有可合并就没结束
    for(let r=0;r<this.size;r++){
      for(let c=0;c<this.size;c++){
        const v = this.grid[r][c];
        if(r+1<this.size && this.grid[r+1][c]===v) return false;
        if(c+1<this.size && this.grid[r][c+1]===v) return false;
      }
    }
    return true;
  }

  _clear(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
  }

  _draw(){
    const ctx = this.ctx;
    this._clear();

    const boardW = this.size*this.cell + (this.size-1)*this.gap;
    const boardH = boardW;
    const startX = (this.canvas.width - boardW)/2;
    const startY = (this.canvas.height - boardH)/2;

    // 背板
    ctx.fillStyle = "#f2f3ff";
    ctx.fillRect(startX-14,startY-14,boardW+28,boardH+28);

    // 格子
    for(let r=0;r<this.size;r++){
      for(let c=0;c<this.size;c++){
        const x = startX + c*(this.cell+this.gap);
        const y = startY + r*(this.cell+this.gap);
        const v = this.grid[r][c];

        ctx.fillStyle = v===0 ? "#ffffff" : "#ffe2f0";
        ctx.fillRect(x,y,this.cell,this.cell);

        if(v!==0){
          ctx.fillStyle = "#222";
          ctx.font = "bold 34px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(v), x+this.cell/2, y+this.cell/2);
        }
      }
    }
  }
}
