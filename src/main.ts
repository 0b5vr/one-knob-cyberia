import './lain';
import { audio, gainNode } from './audio';
import { buttonPlayStop, inputGain } from './ui';
import { isPlaying, togglePlay, updateMusic } from './music';

const update = (): void => {
  gainNode.gain.value = +inputGain.value;
  updateMusic();
  requestAnimationFrame( update );
};
update();

buttonPlayStop.onclick = () => {
  audio.resume();
  togglePlay();
  buttonPlayStop.innerText = isPlaying ? 'Stop' : 'Play';
};
