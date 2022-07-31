export const audio = new AudioContext();
export const sampleRate = audio.sampleRate;

export const gainNode = audio.createGain();
gainNode.connect( audio.destination );
