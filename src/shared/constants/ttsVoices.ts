/** Голоса, которые принимает ML TTS на бэкенде. */
export const ML_TTS_VOICES = [
  'aidar',
  'baya',
  'kseniya',
  'xenia',
  'eugene',
  'random',
] as const;

export type MlTtsVoice = (typeof ML_TTS_VOICES)[number];

export const DEFAULT_ML_TTS_VOICE: MlTtsVoice = 'random';

export const ML_TTS_VOICE_LABELS: Record<MlTtsVoice, string> = {
  aidar: 'Aidar',
  baya: 'Baya',
  kseniya: 'Kseniya',
  xenia: 'Xenia',
  eugene: 'Eugene',
  random: 'Случайный',
};

const LEGACY_VOICE_MAP: Record<string, MlTtsVoice> = {
  default: 'random',
  male: 'eugene',
  female: 'baya',
  robot: 'aidar',
  whisper: 'xenia',
};

export function normalizeMlTtsVoice(voice: string | null | undefined): MlTtsVoice {
  if (!voice) return DEFAULT_ML_TTS_VOICE;

  const lower = voice.toLowerCase();
  if (ML_TTS_VOICES.includes(lower as MlTtsVoice)) {
    return lower as MlTtsVoice;
  }

  return LEGACY_VOICE_MAP[lower] ?? DEFAULT_ML_TTS_VOICE;
}

export function isMlTtsVoice(voice: string): voice is MlTtsVoice {
  return ML_TTS_VOICES.includes(voice as MlTtsVoice);
}
