import { AudioWave } from './wave';

const bitrate = (256 * 1000) / 8;
export class StreamPlayer {
  private wave?: AudioWave;
  private audioElement: HTMLAudioElement;
  private mediaSource: MediaSource;
  private sourceBuffer!: SourceBuffer;
  private bufferQueue: ArrayBuffer[] = [];
  private isBufferAppending = false;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  private audioContext: AudioContext;
  private totalBytes: number = 0;
  private receiveEnd = false;
  private isPlayEnd = false;

  public onend?: () => void;

  constructor(canvas: HTMLCanvasElement | null) {
    if (canvas) {
      this.wave = new AudioWave(canvas);
    }

    this.audioElement = document.createElement('audio');

    this.audioElement.addEventListener('timeupdate', () => {
      const currentTime = this.audioElement.currentTime;
      if (this.receiveEnd && !this.isPlayEnd && this.totalBytes / bitrate - currentTime < 0.1) {
        this.isPlayEnd = true;
        this.onend?.();
        this.wave?.clear();
      }
    });

    this.mediaSource = new MediaSource();

    this.mediaSource.addEventListener('sourceopen', () => {
      if (this.mediaSource.sourceBuffers.length === 0) {
        this.sourceBuffer = this.mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
        this.sourceBuffer.mode = 'sequence';
        this.sourceBuffer.addEventListener('updateend', () => this.processQueue());
      } else {
        this.sourceBuffer = this.mediaSource.sourceBuffers[0];
        // 确保 updateend 事件监听器已绑定（避免重复绑定可加判断）
        if (!this.sourceBuffer.onupdateend) {
          this.sourceBuffer.addEventListener('updateend', () => this.processQueue());
        }
      }
    });

    this.audioElement.src = URL.createObjectURL(this.mediaSource);

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaElementSource(this.audioElement);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024; // 设置 FFT 计算精度
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.draw();
  }

  private processQueue() {
    if (this.sourceBuffer && this.bufferQueue.length > 0 && !this.sourceBuffer.updating) {
      const nextBuffer = this.bufferQueue.shift()!;
      this.sourceBuffer.appendBuffer(nextBuffer);
      this.isBufferAppending = true;
    } else {
      this.isBufferAppending = false;
    }

    if (this.audioElement.paused && this.mediaSource.readyState === 'open') {
      this.audioElement.play();
    }
  }

  private draw() {
    if (!this.wave) return;
    requestAnimationFrame(this.draw.bind(this));
    this.analyser.getByteTimeDomainData(this.dataArray);
    this.wave.draw(this.dataArray);
  }

  receive(data: ArrayBuffer) {
    this.totalBytes += data.byteLength;
    this.bufferQueue.push(data);
    if (!this.isBufferAppending) {
      this.processQueue();
    }
  }

  stop() {
    this.receiveEnd = true;
  }
}

export class LocalPlayer {
  wave?: AudioWave;
  buffer?: AudioBuffer;
  context: AudioContext;
  analyser: AnalyserNode;
  running: boolean;
  data: Uint8Array;
  node: AudioBufferSourceNode | null;

  public onend?: () => void;

  constructor(buffer: ArrayBuffer, canvas: HTMLCanvasElement | null) {
    if (canvas) {
      this.wave = new AudioWave(canvas);
    }
    this.running = false;
    this.context = new AudioContext();

    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.data = new Uint8Array(this.analyser.frequencyBinCount);
    this.node = null;

    this.context.decodeAudioData(buffer).then((value) => {
      this.buffer = value;
    });
  }

  start() {
    if (!this.buffer) return;

    this.node = this.context.createBufferSource();
    this.node.buffer = this.buffer;
    this.node.connect(this.context.destination);
    this.node.connect(this.analyser);

    this.node.onended = () => {
      this.running = false;
      this.onend?.();
      this.wave?.clear();
    };

    this.node.start(0);
    this.running = true;
    this.draw();
  }

  stop() {
    if (!this.node) return;
    this.running = false;
    this.node.stop();
    this.node.disconnect();
    this.node = null;
  }

  draw() {
    if (!this.wave || !this.running) return;
    requestAnimationFrame(this.draw.bind(this));
    this.analyser.getByteTimeDomainData(this.data);
    this.wave.draw(this.data);
  }
}
