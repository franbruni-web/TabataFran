
class AudioService {
  private audioCtx: AudioContext | null = null;

  private initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  unlock() {
    this.initContext();
    if (!this.audioCtx) return;
    
    // Play a silent oscillator for 10ms to unlock audio
    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    oscillator.start(0);
    oscillator.stop(this.audioCtx.currentTime + 0.01);
  }

  private playBell(frequency: number, duration: number, volume: number = 0.5) {
    this.initContext();
    if (!this.audioCtx) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    // Sonido metálico de campana (oscilador triangular con armónicos)
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  playStart() {
    // Campana de inicio de round (Doble golpe fuerte)
    this.playBell(1200, 1.5, 1.5);
    setTimeout(() => this.playBell(1200, 1.5, 1.5), 250);
  }

  playRest() {
    // Campana de fin de round (Un golpe más grave)
    this.playBell(800, 2.0, 1.5);
  }

  playComplete() {
    // Triple campana de final de pelea
    this.playBell(1000, 1.5, 1.5);
    setTimeout(() => this.playBell(1000, 1.5, 1.5), 300);
    setTimeout(() => this.playBell(1000, 2.0, 1.5), 600);
  }
  
  playTick() {
    // Tic tac sutil
    this.playBell(1500, 0.05, 0.2);
  }
}

export const audioService = new AudioService();
