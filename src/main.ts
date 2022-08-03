import './lain';
import { audio, gainNode } from './audio';
import { buttonPlayStop, inputGain } from './ui';
import { isPlaying, togglePlay, updateMusic } from './music';

setInterval( () => {
  gainNode.gain.value = +inputGain.value;
  updateMusic();
} );

buttonPlayStop.onclick = () => {
  audio.resume();
  togglePlay();
  buttonPlayStop.innerText = isPlaying ? 'Stop' : 'Play';
};
