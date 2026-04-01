/**
 * Monitors microphone input level to drive the voice orb animation.
 * Runs on a separate AudioContext — does NOT interfere with STT.
 */

export class AudioLevelMonitor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'AudioContext' in window;
  }

  async start(
    stream: MediaStream,
    onLevel: (level: number) => void, // 0.0 to 1.0
  ): Promise<void> {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;

    const tick = () => {
      if (!this.analyser || !this.dataArray) return;

      this.analyser.getByteFrequencyData(this.dataArray);

      // RMS (root mean square) for smooth level
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i] * this.dataArray[i];
      }
      const rms = Math.sqrt(sum / this.dataArray.length);
      const normalized = Math.min(rms / 128, 1.0);

      onLevel(normalized);
      this.animationFrame = requestAnimationFrame(tick);
    };

    tick();
  }

  stop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  get isRunning(): boolean {
    return this.animationFrame !== null;
  }
}
