// js/forum.app.js
import { ParticleBackground } from "./ParticleBackground.js";
import { PlaylistPlayer } from "./PlaylistPlayer.js";

// 1) 跳到留言区（给 HTML onclick 用）
window.scrollToComments = function () {
  document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// 2) 粒子背景
new ParticleBackground({
  canvasId: "particles",
  count: 70,
  maxLinkDist: 140,
}).start();

// 3) 播放器（Playlist）
new PlaylistPlayer({
  audioId: "bgm-audio",
  listId: "bgm-list",
  playBtnId: "playBtn",
  prevBtnId: "prevBtn",
  nextBtnId: "nextBtn",
  loopChkId: "loopChk",
  playlist: [
    { title: "I Miss You", src: "assets/I Miss You-罗百吉&宝贝.m4a" },
    { title: "画", src: "assets/邓紫棋-画.m4a" },
    { title: "Sakura Tears", src: "assets/Sakura Tears.m4a" },
  ],
}).init();
