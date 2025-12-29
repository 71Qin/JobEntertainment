import { SnakeGame } from "./snake.js";
import { BreakoutGame } from "./breakout.js";
import { Game2048 } from "./game2048.js";

const canvas = document.getElementById("game");
const infoEl = document.getElementById("info");

let current = null;

const games = {
  snake: () => new SnakeGame(canvas, infoEl),
  breakout: () => new BreakoutGame(canvas, infoEl),
  "2048": () => new Game2048(canvas, infoEl),
};

function startGame(key){
  if(current) current.stop();
  current = games[key]();
  current.start();
}

document.querySelectorAll("button[data-game]").forEach(btn=>{
  btn.addEventListener("click", ()=> startGame(btn.dataset.game));
});

document.getElementById("stop").addEventListener("click", ()=>{
  if(current) current.stop();
  current = null;
  infoEl.textContent = "已停止。请选择一个游戏开始。";
});
