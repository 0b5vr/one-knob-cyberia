import { audio, gainNode } from './audio';
import { buttonPlayPause, inputGain } from './ui';
import { isPlaying, togglePlay, updateMusic } from './music';

const update = (): void => {
  gainNode.gain.value = parseFloat( inputGain.value );
  updateMusic();
  requestAnimationFrame( update );
};
update();

buttonPlayPause.onclick = () => {
  audio.resume();
  togglePlay();
  buttonPlayPause.innerText = isPlaying ? 'Pause' : 'Play';
};
