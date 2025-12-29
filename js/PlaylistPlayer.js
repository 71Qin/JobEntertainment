// js/PlaylistPlayer.js
export class PlaylistPlayer {
  constructor({
    audioId,
    listId,
    playBtnId,
    prevBtnId,
    nextBtnId,
    loopChkId,
    playlist = [],
  } = {}) {
    this.audio = document.getElementById(audioId);
    this.listEl = document.getElementById(listId);
    this.playBtn = document.getElementById(playBtnId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    this.loopChk = document.getElementById(loopChkId);

    if (!this.audio || !this.listEl || !this.playBtn || !this.prevBtn || !this.nextBtn || !this.loopChk) {
      throw new Error("PlaylistPlayer: missing required DOM elements.");
    }

    this.playlist = playlist;
    this.idx = 0;
  }

  init() {
    this._bindEvents();
    this._loadTrack();     // 只加载，不强制播放（避免被浏览器拦）
    this._renderList();
    return this;
  }

  _bindEvents() {
    this.playBtn.addEventListener("click", () => this.togglePlay());
    this.prevBtn.addEventListener("click", () => this.prev(true));
    this.nextBtn.addEventListener("click", () => this.next(true));

    this.loopChk.addEventListener("change", () => {
      this.audio.loop = this.loopChk.checked;
    });

    this.audio.addEventListener("ended", () => {
      if (!this.audio.loop) this.next(false);
    });
  }

  _renderList() {
    this.listEl.innerHTML = "";
    this.playlist.forEach((t, i) => {
      const li = document.createElement("li");
      li.textContent = t.title;
      li.className = i === this.idx ? "active" : "";
      li.addEventListener("click", async () => {
        this.idx = i;
        this._loadTrack();
        this._renderList();
        await this._tryPlay(); // 点击列表属于用户手势，尝试播放
      });
      this.listEl.appendChild(li);
    });
  }

  _loadTrack() {
    if (!this.playlist.length) return;
    this.audio.src = this.playlist[this.idx].src;
  }

  async _tryPlay() {
    try {
      await this.audio.play();
      this.playBtn.textContent = "⏸";
    } catch {
      // 被拦截就保持 ▶，用户再点一次
      this.playBtn.textContent = "▶";
    }
  }

  togglePlay() {
    if (this.audio.paused) {
      this._tryPlay();
    } else {
      this.audio.pause();
      this.playBtn.textContent = "▶";
    }
  }

  async prev(userGesture = false) {
    if (!this.playlist.length) return;
    this.idx = (this.idx - 1 + this.playlist.length) % this.playlist.length;
    this._loadTrack();
    this._renderList();
    if (userGesture) await this._tryPlay();
  }

  async next(userGesture = false) {
    if (!this.playlist.length) return;
    this.idx = (this.idx + 1) % this.playlist.length;
    this._loadTrack();
    this._renderList();
    if (userGesture) await this._tryPlay();
  }
}
