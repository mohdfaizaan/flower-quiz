// Quran Learning Hub - Refined Elegant Audio Synthesizer

class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  // General click sound disabled for a quiet, dignified experience
  playClick() {
    // Intentionally silent as requested by user
  }

  // Gentle, dignified gold chime for correct answer
  playCorrect() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.18, this.audioCtx.currentTime + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + idx * 0.09);
        osc.stop(this.audioCtx.currentTime + idx * 0.09 + 0.4);
      });
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  playWrong() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, this.audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.2);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  playVictory() {
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const melody = [
        { freq: 523.25, duration: 0.15, delay: 0 },
        { freq: 659.25, duration: 0.15, delay: 0.15 },
        { freq: 783.99, duration: 0.2, delay: 0.3 },
        { freq: 1046.50, duration: 0.5, delay: 0.5 }
      ];

      melody.forEach(note => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, this.audioCtx.currentTime + note.delay);

        gain.gain.setValueAtTime(0, this.audioCtx.currentTime + note.delay);
        gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + note.delay + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + note.delay + note.duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + note.delay);
        osc.stop(this.audioCtx.currentTime + note.delay + note.duration + 0.05);
      });
    } catch (e) {
      console.log('Audio error:', e);
    }
  }
}

const sounds = new SoundManager();
