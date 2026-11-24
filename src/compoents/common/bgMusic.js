import { useSyncExternalStore } from 'react';
import bgMusic from '../../assets/audio/sonican-enchanted-fantasy-356791.mp3';

const MUTE_KEY = 'bg-music-muted';

const readMuted = () => {
    try {
        return sessionStorage.getItem(MUTE_KEY) === '1';
    } catch {
        return false;
    }
};

let audio = null;
let muted = readMuted();
let suspended = 0;
let started = false;
let inited = false;
let armed = false;
let on = false;

const listeners = new Set();

const emit = () => {
    on = !muted && started;
    listeners.forEach((fn) => fn());
};

const getAudio = () => {
    if (!audio) {
        audio = new Audio(bgMusic);
        audio.loop = true;
        audio.volume = 0.4;
        audio.preload = 'auto';
    }
    return audio;
};

const onInteraction = (e) => {
    disarm();
    if (e.target.closest && e.target.closest('.sound-btn')) return;
    sync();
};

const arm = () => {
    if (armed) return;
    armed = true;
    document.addEventListener('pointerdown', onInteraction);
    document.addEventListener('keydown', onInteraction);
};

function disarm() {
    armed = false;
    document.removeEventListener('pointerdown', onInteraction);
    document.removeEventListener('keydown', onInteraction);
}

function sync() {
    const a = getAudio();

    if (muted || suspended > 0) {
        a.pause();
    } else if (a.paused) {
        a.play()
            .then(() => {
                started = true;
                emit();
            })
            .catch(arm);
    }

    emit();
}

export const initMusic = () => {
    if (inited) return;
    inited = true;
    sync();
};

export const suspendMusic = () => {
    suspended += 1;
    sync();
};

export const resumeMusic = () => {
    suspended = Math.max(0, suspended - 1);
    sync();
};

export const toggleMusic = () => {
    muted = on;

    try {
        sessionStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch {}

    sync();
};

const subscribe = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

const getSnapshot = () => on;

export const useMusicOn = () => useSyncExternalStore(subscribe, getSnapshot);