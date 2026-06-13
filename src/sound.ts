import { assetPath } from "./assetPath";

type BattleSoundId = "first" | "boss";
type GiftSoundVariant = "cream" | "black";
type RewardSoundStyle = "default" | "custom";
type MediaPlayResult = "playing" | "blocked" | "missing";

const punchSounds = [
  "/audio/punch-heavy-1.ogg",
  "/audio/punch-heavy-2.ogg",
  "/audio/punch-medium-1.ogg",
];

const heavyPunchSounds = ["/audio/punch-heavy-1.ogg", "/audio/punch-heavy-2.ogg"];

const metalSounds = [
  "/audio/metal-heavy-1.ogg",
  "/audio/metal-medium-1.ogg",
  "/audio/blade-clash-1.ogg",
];

const collectGoodSounds = ["/audio/collect-good-1.ogg", "/audio/collect-good-2.ogg"];
const collectBadSounds = ["/audio/collect-bad-1.ogg"];
const rewardWowSound = "/audio/reward-wow.mp3";
const rewardCustomSound = "/audio/reward-pop-custom.mp4";
const rewardFireworksSound = "/audio/reward-fireworks.wav";

type WebAudioWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let lastVictoryAt = 0;
let lastRewardFireworkAt = 0;
let albumAudio: HTMLAudioElement | null = null;
let albumAudioSrc = "";
let gameAudio: HTMLAudioElement | null = null;
let gameAudioSrc = "";
let finalAudio: HTMLAudioElement | null = null;
let finalAudioSrc = "";
const audioCache = new Map<string, HTMLAudioElement>();

function getAudioContext() {
  const AudioContextConstructor =
    window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;

  if (!AudioContextConstructor) return null;

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.24;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function connectOutput(node: AudioNode, context: AudioContext) {
  node.connect(masterGain ?? context.destination);
}

function getAudio(src: string) {
  const resolvedSrc = assetPath(src);
  const cached = audioCache.get(resolvedSrc);
  if (cached) return cached;

  const audio = new Audio(resolvedSrc);
  audio.preload = "auto";
  audioCache.set(resolvedSrc, audio);
  return audio;
}

function randomItem(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function playAsset(
  src: string,
  {
    volume = 0.8,
    playbackRate = 1,
  }: {
    volume?: number;
    playbackRate?: number;
  } = {},
) {
  const baseAudio = getAudio(src);
  const audio = baseAudio.cloneNode(true) as HTMLAudioElement;
  audio.volume = Math.min(Math.max(volume, 0), 1);
  audio.playbackRate = playbackRate;
  audio.currentTime = 0;
  void audio.play().catch(() => undefined);
}

function createAssetClip(
  src: string,
  {
    volume = 0.8,
    playbackRate = 1,
  }: {
    volume?: number;
    playbackRate?: number;
  } = {},
) {
  const baseAudio = getAudio(src);
  const audio = baseAudio.cloneNode(true) as HTMLAudioElement;
  audio.volume = Math.min(Math.max(volume, 0), 1);
  audio.playbackRate = playbackRate;
  audio.currentTime = 0;
  return audio;
}

function playClipsTogether(clips: HTMLAudioElement[]) {
  clips.forEach((clip) => {
    void clip.play().catch(() => undefined);
  });
}

function playTone(
  context: AudioContext,
  {
    startFrequency,
    endFrequency,
    duration,
    delay = 0,
    volume,
    type = "sine",
  }: {
    startFrequency: number;
    endFrequency?: number;
    duration: number;
    delay?: number;
    volume: number;
    type?: OscillatorType;
  },
) {
  const startAt = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, startAt);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(endFrequency, 1),
      startAt + duration,
    );
  }

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  connectOutput(gain, context);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.03);
}

function playNoise(
  context: AudioContext,
  {
    duration,
    delay = 0,
    volume,
    filterType,
    frequency,
  }: {
    duration: number;
    delay?: number;
    volume: number;
    filterType: BiquadFilterType;
    frequency: number;
  },
) {
  const sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index += 1) {
    const fade = 1 - index / sampleCount;
    data[index] = (Math.random() * 2 - 1) * fade;
  }

  const startAt = context.currentTime + delay;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  source.connect(filter);
  filter.connect(gain);
  connectOutput(gain, context);
  source.start(startAt);
  source.stop(startAt + duration + 0.02);
}

function playPunch(context: AudioContext, intensity = 1) {
  playTone(context, {
    startFrequency: 94,
    endFrequency: 32,
    duration: 0.16,
    volume: 0.5 * intensity,
    type: "sine",
  });
  playTone(context, {
    startFrequency: 190,
    endFrequency: 74,
    duration: 0.07,
    delay: 0.005,
    volume: 0.2 * intensity,
    type: "square",
  });
  playNoise(context, {
    duration: 0.045,
    volume: 0.34 * intensity,
    filterType: "lowpass",
    frequency: 980,
  });
}

function playHeavyPunch(context: AudioContext) {
  playTone(context, {
    startFrequency: 72,
    endFrequency: 24,
    duration: 0.22,
    volume: 0.74,
    type: "sine",
  });
  playTone(context, {
    startFrequency: 132,
    endFrequency: 42,
    duration: 0.1,
    delay: 0.006,
    volume: 0.3,
    type: "square",
  });
  playNoise(context, {
    duration: 0.06,
    volume: 0.48,
    filterType: "lowpass",
    frequency: 720,
  });
  playNoise(context, {
    duration: 0.035,
    delay: 0.018,
    volume: 0.16,
    filterType: "highpass",
    frequency: 1900,
  });
}

function playMagic(context: AudioContext) {
  playTone(context, {
    startFrequency: 580,
    endFrequency: 1160,
    duration: 0.16,
    volume: 0.11,
    type: "triangle",
  });
  playTone(context, {
    startFrequency: 920,
    endFrequency: 1640,
    duration: 0.12,
    delay: 0.035,
    volume: 0.08,
    type: "sine",
  });
  playNoise(context, {
    duration: 0.11,
    delay: 0.01,
    volume: 0.09,
    filterType: "highpass",
    frequency: 1800,
  });
}

function playSword(context: AudioContext) {
  playNoise(context, {
    duration: 0.075,
    volume: 0.24,
    filterType: "highpass",
    frequency: 1850,
  });
  playTone(context, {
    startFrequency: 1920,
    endFrequency: 620,
    duration: 0.12,
    delay: 0.012,
    volume: 0.13,
    type: "sawtooth",
  });
}

export function primeGameAudio() {
  void getAudioContext();
  [
    ...punchSounds,
    ...metalSounds,
    ...collectGoodSounds,
    ...collectBadSounds,
    rewardWowSound,
    rewardCustomSound,
    rewardFireworksSound,
  ].forEach((src) => {
    getAudio(src).load();
  });
}

export function playBattleHitSound(id: BattleSoundId) {
  const context = getAudioContext();

  if (id === "first") {
    playAsset(randomItem(heavyPunchSounds), {
      volume: 1,
      playbackRate: 0.78 + Math.random() * 0.08,
    });
    playAsset(randomItem(heavyPunchSounds), {
      volume: 0.46,
      playbackRate: 0.62 + Math.random() * 0.06,
    });
    if (context) playHeavyPunch(context);
    return;
  }

  playAsset(randomItem(punchSounds), {
    volume: 0.82,
    playbackRate: 0.92 + Math.random() * 0.12,
  });
  if (context) playPunch(context, 1);

  const style = Math.floor(Math.random() * 3);
  if (style === 0) {
    playAsset(randomItem(metalSounds), {
      volume: 0.72,
      playbackRate: 0.96 + Math.random() * 0.12,
    });
    if (context) playMagic(context);
  } else if (style === 1) {
    playAsset(randomItem(metalSounds), {
      volume: 0.82,
      playbackRate: 0.88 + Math.random() * 0.16,
    });
    if (context) playSword(context);
  } else {
    playAsset(randomItem(metalSounds), {
      volume: 0.76,
      playbackRate: 0.98 + Math.random() * 0.08,
    });
    if (context) {
      playMagic(context);
      playSword(context);
    }
  }
}

export function playBattleVictorySound(id: BattleSoundId) {
  const context = getAudioContext();
  if (!context) return;

  const now = performance.now();
  if (now - lastVictoryAt < 500) return;
  lastVictoryAt = now;

  const base = id === "boss" ? 392 : 440;
  [0, 1, 2, 4].forEach((step, index) => {
    playTone(context, {
      startFrequency: base * 2 ** (step / 12),
      duration: 0.15,
      delay: index * 0.075,
      volume: 0.1,
      type: "triangle",
    });
  });
  playNoise(context, {
    duration: 0.18,
    delay: 0.12,
    volume: 0.05,
    filterType: "highpass",
    frequency: 2200,
  });
}

export function playRewardFireworkSound(
  variant: GiftSoundVariant = "cream",
  soundStyle: RewardSoundStyle = "default",
) {
  primeGameAudio();

  const now = performance.now();
  if (now - lastRewardFireworkAt < 420) return;
  lastRewardFireworkAt = now;

  playCelebrationAssets(variant, "burst", soundStyle);

  const context = getAudioContext();
  if (!context) return;

  [0, 4, 7, 12, 16].forEach((step, index) => {
    playTone(context, {
      startFrequency: 523.25 * 2 ** (step / 12),
      endFrequency: 659.25 * 2 ** (step / 12),
      duration: 0.11,
      delay: index * 0.055,
      volume: variant === "black" ? 0.055 : 0.072,
      type: "triangle",
    });
  });

  [0.03, 0.14, 0.24].forEach((delay, index) => {
    playNoise(context, {
      duration: 0.1 + index * 0.035,
      delay,
      volume: variant === "black" ? 0.075 : 0.092,
      filterType: "highpass",
      frequency: 3200 + index * 900,
    });
  });

  playTone(context, {
    startFrequency: variant === "black" ? 196 : 262,
    endFrequency: variant === "black" ? 98 : 132,
    duration: 0.18,
    delay: 0.02,
    volume: variant === "black" ? 0.12 : 0.09,
    type: "sine",
  });
}

export function playCounterAttackSound(id: BattleSoundId) {
  primeGameAudio();

  const context = getAudioContext();

  if (id === "first") {
    playAsset("/audio/punch-heavy-2.ogg", {
      volume: 0.62,
      playbackRate: 0.76,
    });

    if (!context) return;
    playTone(context, {
      startFrequency: 168,
      endFrequency: 72,
      duration: 0.13,
      volume: 0.18,
      type: "square",
    });
    playNoise(context, {
      duration: 0.07,
      delay: 0.015,
      volume: 0.16,
      filterType: "lowpass",
      frequency: 980,
    });
    return;
  }

  playAsset("/audio/metal-heavy-1.ogg", {
    volume: 0.72,
    playbackRate: 0.92,
  });

  if (!context) return;
  playMagic(context);
  playSword(context);
}

export function playGiftOpenSound(
  variant: GiftSoundVariant = "cream",
  soundStyle: RewardSoundStyle = "default",
) {
  primeGameAudio();

  playCelebrationAssets(variant, "open", soundStyle);

  const context = getAudioContext();
  if (!context) return;

  playTone(context, {
    startFrequency: variant === "black" ? 196 : 246,
    endFrequency: variant === "black" ? 84 : 132,
    duration: 0.14,
    volume: variant === "black" ? 0.2 : 0.14,
    type: "sine",
  });
  [0, 4, 7, 12].forEach((step, index) => {
    playTone(context, {
      startFrequency: 523.25 * 2 ** (step / 12),
      duration: 0.1,
      delay: 0.045 + index * 0.055,
      volume: variant === "black" ? 0.055 : 0.075,
      type: "triangle",
    });
  });
  playTone(context, {
    startFrequency: 740,
    endFrequency: 1480,
    duration: 0.18,
    delay: 0.025,
    volume: 0.11,
    type: "triangle",
  });
  playTone(context, {
    startFrequency: 988,
    endFrequency: 1760,
    duration: 0.16,
    delay: 0.085,
    volume: 0.08,
    type: "sine",
  });
  playNoise(context, {
    duration: 0.12,
    delay: 0.025,
    volume: 0.08,
    filterType: "highpass",
    frequency: 2600,
  });
}

export function playCollectGoodSound() {
  primeGameAudio();
  playAsset(randomItem(collectGoodSounds), {
    volume: 0.72,
    playbackRate: 1 + Math.random() * 0.08,
  });

  const context = getAudioContext();
  if (!context) return;
  playTone(context, {
    startFrequency: 880,
    endFrequency: 1320,
    duration: 0.11,
    volume: 0.08,
    type: "triangle",
  });
}

export function playCollectBadSound() {
  primeGameAudio();
  playAsset(randomItem(collectBadSounds), {
    volume: 0.68,
    playbackRate: 0.94,
  });

  const context = getAudioContext();
  if (!context) return;
  playTone(context, {
    startFrequency: 190,
    endFrequency: 95,
    duration: 0.12,
    volume: 0.12,
    type: "sawtooth",
  });
}

function getAlbumAudio(src: string) {
  const resolvedSrc = assetPath(src);

  if (!albumAudio || albumAudioSrc !== resolvedSrc) {
    albumAudio?.pause();
    albumAudio = new Audio(resolvedSrc);
    albumAudio.preload = "auto";
    albumAudio.loop = true;
    albumAudio.volume = 0.38;
    albumAudioSrc = resolvedSrc;
  }

  return albumAudio;
}

function getGameAudio(src: string) {
  const resolvedSrc = assetPath(src);

  if (!gameAudio || gameAudioSrc !== resolvedSrc) {
    gameAudio?.pause();
    gameAudio = new Audio(resolvedSrc);
    gameAudio.preload = "auto";
    gameAudio.loop = true;
    gameAudio.volume = 0.22;
    gameAudioSrc = resolvedSrc;
  }

  return gameAudio;
}

function getFinalAudio(src: string) {
  const resolvedSrc = assetPath(src);

  if (!finalAudio || finalAudioSrc !== resolvedSrc) {
    finalAudio?.pause();
    finalAudio = new Audio(resolvedSrc);
    finalAudio.preload = "auto";
    finalAudio.loop = true;
    finalAudio.volume = 0.34;
    finalAudioSrc = resolvedSrc;
  }

  return finalAudio;
}

function seekAudio(audio: HTMLAudioElement, seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return;

  const applySeek = () => {
    try {
      audio.currentTime = seconds;
    } catch {
      audio.addEventListener(
        "loadedmetadata",
        () => {
          try {
            audio.currentTime = seconds;
          } catch {
            // Some browsers reject early media seeking until more data is loaded.
          }
        },
        { once: true },
      );
    }
  };

  applySeek();
}

function playCelebrationAssets(
  variant: GiftSoundVariant,
  phase: "burst" | "open",
  soundStyle: RewardSoundStyle = "default",
) {
  const isBlack = variant === "black";
  const isOpen = phase === "open";
  const useCustomSound = soundStyle === "custom";

  const rewardClip = createAssetClip(
    useCustomSound ? rewardCustomSound : rewardWowSound,
    {
      volume: useCustomSound ? (isBlack ? 0.15 : 0.18) : isBlack ? 0.22 : 0.28,
      playbackRate: isOpen ? 1 : 0.96,
    },
  );
  const fireworkClip = createAssetClip(rewardFireworksSound, {
    volume: isBlack ? 0.68 : 0.78,
    playbackRate: isOpen ? 1.02 : 0.96,
  });

  playClipsTogether([rewardClip, fireworkClip]);
}

export async function playGameBgm(src: string): Promise<MediaPlayResult> {
  const audio = getGameAudio(src);
  audio.loop = true;
  audio.volume = 0.22;

  if (!audio.paused) return "playing";

  try {
    await audio.play();
    return "playing";
  } catch {
    return audio.error ? "missing" : "blocked";
  }
}

export function pauseGameBgm() {
  gameAudio?.pause();
}

export function isGameBgmPlaying() {
  return Boolean(gameAudio && !gameAudio.paused);
}

export async function playFinalBgm(
  src: string,
  startAt = 0,
): Promise<MediaPlayResult> {
  const audio = getFinalAudio(src);
  audio.loop = true;
  audio.volume = 0.34;

  if (!audio.paused) return "playing";

  seekAudio(audio, startAt);

  try {
    await audio.play();
    return "playing";
  } catch {
    return audio.error ? "missing" : "blocked";
  }
}

export function pauseFinalBgm() {
  finalAudio?.pause();
}

export function isFinalBgmPlaying() {
  return Boolean(finalAudio && !finalAudio.paused);
}

export async function playAlbumBgm(src: string): Promise<MediaPlayResult> {
  const audio = getAlbumAudio(src);
  audio.loop = true;
  audio.volume = 0.38;

  try {
    await audio.play();
    return "playing";
  } catch {
    return audio.error ? "missing" : "blocked";
  }
}

export function pauseAlbumBgm() {
  albumAudio?.pause();
}

export function isAlbumBgmPlaying() {
  return Boolean(albumAudio && !albumAudio.paused);
}
