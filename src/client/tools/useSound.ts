import { useState } from 'react';

const sounds = {
  beep: '/sounds/beep.mp3',
  // beep: '/sounds/beep1.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  reminder: '/sounds/play_reminder.ogg',
  message: '/sounds/message.mp3',
};

export type SoundEffect = keyof typeof sounds;

let context: { muted: boolean; toggleMute: () => boolean };

const toggleMute = () => {
  context.muted = !context.muted;
  return context.muted;
};

const getContext = () => {
  if (context) {
    return context;
  }

  context = { muted: false, toggleMute };

  return context;
};

export const sound = (path: SoundEffect, volume: number = 0.2) => {
  if (getContext().muted) return;

  const audio = new Audio(sounds[path]);
  audio.volume = volume || 0.2;
  audio.play().catch((e) => {
    // This catches errors if the browser blocks autoplay
    // (e.g., user hasn't interacted with the page yet)
    console.warn('Audio play failed', e);
  });
};

export const useSoundState: () => [boolean, () => void] = () => {
  const [muted, setMuted] = useState<boolean>(getContext().muted);
  const toggleMuted = () => {
    setMuted(() => (getContext().toggleMute()));
  };

  return [muted, toggleMuted];
};
