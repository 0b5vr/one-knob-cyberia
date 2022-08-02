import uiHtml from './ui.html?html';

document.body.innerHTML = uiHtml;

export const [
  inputGain,
  inputKnob,
  inputBPM,
] = document.querySelectorAll( 'input' );
export const [
  buttonPlayStop,
] = document.querySelectorAll( 'button' );
export const canvasLain = document.querySelectorAll( 'canvas' );

export let bps = 190.0 / 60.0;

const ass = document.querySelectorAll( 'a' );
inputGain.oninput = ( () => ass[ 0 ].innerText = parseFloat( inputGain.value ).toFixed( 3 ) );
inputKnob.oninput = ( () => ass[ 1 ].innerText = parseFloat( inputKnob.value ).toFixed( 3 ) );
inputBPM.oninput = ( () => bps = ( parseFloat( inputBPM.value ) || 190.0 ) / 60.0 );
