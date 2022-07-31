document.body.innerHTML = 'one-knob-cyberia<br>1st place in the Assembly Summer 2022 4KB Executable Gabber Compo<br><br>Knob:<input type=range min=0 max=1 step=.001><a>0.500</a><br>Gain:<input type=range min=0 max=1 step=.001 value=1 /><a>1.000</a><br><br><canvas width=256 height=256></canvas><canvas width=256 height=256 style="display:none"></canvas><br><br><button>Play</button><br>(Volume warning!)<style>body{text-align:center;font-family:monospace}';

const inputs = document.querySelectorAll( 'input' );
export const inputKnob = inputs[ 0 ];
export const inputGain = inputs[ 1 ];
export const buttonPlayPause = document.querySelector( 'button' )!;
export const canvasLain = document.querySelectorAll( 'canvas' );

const ass = document.querySelectorAll( 'a' );
inputKnob.oninput = ( () => ass[ 0 ].innerText = parseFloat( inputKnob.value ).toFixed( 3 ) );
inputGain.oninput = ( () => ass[ 1 ].innerText = parseFloat( inputGain.value ).toFixed( 3 ) );
