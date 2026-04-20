import { Audio, AVPlaybackStatus } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;

  async init() {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
    });
  }

  async play(uri: string, onStatus?: (s: AVPlaybackStatus) => void) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      this.onStatusUpdate = onStatus || null;
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1 },
        this.onStatusUpdate || undefined
      );
      this.sound = sound;
    } catch (e) {
      console.error('AudioService.play error:', e);
    }
  }

  async pause() {
    try { await this.sound?.pauseAsync(); } catch {}
  }

  async resume() {
    try { await this.sound?.playAsync(); } catch {}
  }

  async stop() {
    try {
      await this.sound?.stopAsync();
      await this.sound?.unloadAsync();
      this.sound = null;
    } catch {}
  }

  async seekTo(ms: number) {
    try { await this.sound?.setPositionAsync(ms); } catch {}
  }

  async setVolume(v: number) {
    try { await this.sound?.setVolumeAsync(v); } catch {}
  }

  isLoaded() {
    return this.sound !== null;
  }
}

export default new AudioService();
