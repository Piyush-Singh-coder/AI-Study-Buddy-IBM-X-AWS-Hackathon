// Audio & Theme Utilities inspired by Folio & Flow

let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;

  if (!sharedAudioCtx) {
    try {
      sharedAudioCtx = new AudioCtxClass();
    } catch {
      return null;
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

export const playAudioChime = (type: "click" | "success" | "toggle" = "click") => {
  // Execute asynchronously in a microtask/timer to never block UI rendering or modal pops
  setTimeout(() => {
    try {
      const audioCtx = getAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);

      if (type === "click") {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.05);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "toggle") {
        const osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.07);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === "success") {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc2.frequency.setValueAtTime(783.99, now); // G5
        osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.14); // C6
        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
      }
    } catch {
      // Audio errors must never disrupt UI interactions
    }
  }, 0);
};

export const getStoredTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("study_theme") || localStorage.getItem("folio_theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const setDocumentTheme = (theme: "dark" | "light") => {
  if (typeof window === "undefined") return;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("study_theme", theme);
  localStorage.setItem("folio_theme", theme);
};
