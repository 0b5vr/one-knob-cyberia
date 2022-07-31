document.body.innerHTML = '<input type=range min=0 max=1 step=.001><a>0.500</a><br><input type=range min=0 max=1 step=.001 value=1 /><a>1.000</a><br><button>Play';

const inputs = document.querySelectorAll( 'input' );
export const inputKnob = inputs[ 0 ];
export const inputGain = inputs[ 1 ];
export const buttonPlayPause = document.querySelector( 'button' )!;

const ass = document.querySelectorAll( 'a' );
inputKnob.oninput = ( () => ass[ 0 ].innerText = parseFloat( inputKnob.value ).toFixed( 3 ) );
inputGain.oninput = ( () => ass[ 1 ].innerText = parseFloat( inputGain.value ).toFixed( 3 ) );
