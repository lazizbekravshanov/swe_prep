export class SilenceTimer {
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private readonly timeout: number;
  private readonly onTimeout: () => void;

  constructor(timeout: number, onTimeout: () => void) {
    this.timeout = timeout;
    this.onTimeout = onTimeout;
  }

  reset(): void {
    this.clear();
    this.timerId = setTimeout(() => {
      this.timerId = null;
      this.onTimeout();
    }, this.timeout);
  }

  clear(): void {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  get isRunning(): boolean {
    return this.timerId !== null;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
