document.body.innerHTML = 'one-knob-cyberia<br>1st place in the Assembly Summer 2022 4KB Executable Gabber Compo<br><br>Gain:<input type=range min=0 max=1 step=.001 value=1><a>1.000</a><br>Knob:<input type=range min=0 max=1 step=.001><a>0.500</a><br>BPM:<input type=number min=1 value=190 style="width:80"><br><br><canvas width=256 height=256></canvas><canvas width=256 height=256 style="display:none"></canvas><br><br><button>Play</button><br>(Volume warning!)<style>body{text-align:center;font-family:monospace}input{width:240}';

export const [
  inputGain,
  inputKnob,
  inputBPM,
] = document.querySelectorAll( 'input' );
export const buttonPlayPause = document.querySelector( 'button' )!;
export const canvasLain = document.querySelectorAll( 'canvas' );

export let bps = 190.0 / 60.0;

const ass = document.querySelectorAll( 'a' );
inputGain.oninput = ( () => ass[ 0 ].innerText = parseFloat( inputGain.value ).toFixed( 3 ) );
inputKnob.oninput = ( () => ass[ 1 ].innerText = parseFloat( inputKnob.value ).toFixed( 3 ) );
inputBPM.oninput = ( () => bps = ( parseFloat( inputBPM.value ) || 190.0 ) / 60.0 );
