/**
 * 答题音效管理工具
 */
class SoundEffectsManager {
  private sounds: Record<string, HTMLAudioElement> = {};
  private enabled: boolean = true;

  constructor() {
    // 预加载音效（占位，实际 URL 需要根据项目资源路径配置）
    const soundUrls = {
      correct: "/sounds/correct.mp3",
      incorrect: "/sounds/incorrect.mp3",
      hint: "/sounds/hint.mp3",
      complete: "/sounds/complete.mp3",
    };

    if (typeof window !== "undefined") {
      Object.entries(soundUrls).forEach(([key, url]) => {
        const audio = new Audio(url);
        audio.preload = "auto";
        this.sounds[key] = audio;
      });
    }
  }

  /** 播放指定音效 */
  public play(type: "correct" | "incorrect" | "hint" | "complete") {
    if (!this.enabled || !this.sounds[type]) return;

    try {
      const sound = this.sounds[type];
      sound.currentTime = 0;
      sound.play().catch((err) => console.warn("Sound playback failed:", err));
    } catch (err) {
      console.warn("Sound play error:", err);
    }
  }

  /** 设置是否启用音效 */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const SoundEffects = new SoundEffectsManager();
