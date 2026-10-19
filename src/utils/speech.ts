/**
 * Kurdish Sorani Female Speech Synthesizer.
 * Uses Gemini TTS (gemini-3.8-flash-lite-tts with Kore female voice) to speak natural Kurdish Sorani.
 * NO MUSIC, NO CHIMES - Pure human spoken Kurdish voice.
 */

let currentAudio: HTMLAudioElement | null = null;
const audioCache = new Map<string, string>();

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try {
      window.speechSynthesis.getVoices();
    } catch {}
  };
}

/**
 * Pre-fetches the initial welcome greeting so it plays instantaneously without delay.
 */
export async function prefetchWelcomeVoice(): Promise<void> {
  const text = 'بەخێربێن، خۆشحاڵین بە هاتنتان. دەتوانیت لە ڕێگەی گۆگڵەوە خۆت تۆمار بکەیت، وە ئەگەر گۆگڵت نییە بە ژمارەی مۆبایل بچۆرە ژوورەوە.';
  if (audioCache.has(text)) return;

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type: 'welcome' }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        audioCache.set(text, data.audio);
      }
    }
  } catch (err) {
    console.debug('Prefetching Kurdish voice failed:', err);
  }
}

/**
 * Speaks Kurdish Sorani using real human AI female voice.
 * Pure speech without any background music or sound effects.
 */
export async function speakKurdishSorani(
  kurdishText: string,
  type: 'welcome' | 'registered' | 'custom' = 'custom',
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  // Stop any currently playing speech
  stopKurdishSpeech();

  // 1. Try Gemini AI Kurdish Text-to-Speech via backend
  try {
    let base64Audio = audioCache.get(kurdishText);

    if (!base64Audio) {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: kurdishText, type }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof data.audio === 'string') {
          base64Audio = data.audio;
          audioCache.set(kurdishText, data.audio);
        }
      }
    }

    if (base64Audio) {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onplay = () => {
        if (onStart) onStart();
      };

      audio.onended = () => {
        currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        currentAudio = null;
        // Fallback to speech synthesis if audio playback failed
        fallbackSpeechSynthesis(kurdishText, onStart, onEnd);
      };

      await audio.play();
      return;
    }
  } catch (err) {
    console.warn('Backend TTS failed, using browser speech synthesis fallback:', err);
  }

  // 2. Fallback to Browser SpeechSynthesis (pure voice, no music)
  fallbackSpeechSynthesis(kurdishText, onStart, onEnd);
}

function fallbackSpeechSynthesis(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    // Prioritize female Arabic / Kurdish / Persian voices
    const femaleVoice =
      voices.find(
        (v) =>
          (v.lang.startsWith('ar') || v.lang.startsWith('ku') || v.lang.startsWith('fa')) &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('woman') ||
            v.name.toLowerCase().includes('laila') ||
            v.name.toLowerCase().includes('mariam') ||
            v.name.toLowerCase().includes('salma') ||
            v.name.toLowerCase().includes('zira'))
      ) ||
      voices.find((v) => v.lang.startsWith('ar') || v.lang.startsWith('fa')) ||
      voices[0];

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.pitch = 1.2;
    utterance.rate = 0.9;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis fallback error:', e);
    if (onEnd) onEnd();
  }
}

export function stopKurdishSpeech(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
