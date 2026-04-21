import { Audio, AVPlaybackStatus } from 'expo-av';

class AudioService {
  private sound: Audio.Sound | null = null;

  async init() {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (e) { console.error('AudioService.init error:', e); }
  }

  async play(uri: string, onStatus?: (s: AVPlaybackStatus) => void) {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri, headers: { 'User-Agent': 'NYX/1.0' } },
        { shouldPlay: true, volume: 1, progressUpdateIntervalMillis: 500 },
        onStatus
      );
      this.sound = sound;
    } catch (e) { console.error('AudioService.play error:', e); throw e; }
  }

  async pause() { try { await this.sound?.pauseAsync(); } catch {} }
  async resume() { try { await this.sound?.playAsync(); } catch {} }
  async stop() {
    try { await this.sound?.stopAsync(); await this.sound?.unloadAsync(); this.sound = null; } catch {}
  }
  async seekTo(ms: number) { try { await this.sound?.setPositionAsync(ms); } catch {} }
  async setVolume(v: number) { try { await this.sound?.setVolumeAsync(v); } catch {} }
  isLoaded() { return this.sound !== null; }
}

export default new AudioService();
