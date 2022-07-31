import { FRAMES_PER_RENDER } from './Music';
import { GL_ARRAY_BUFFER, GL_DYNAMIC_COPY, GL_FLOAT, GL_POINTS, GL_RASTERIZER_DISCARD, GL_STATIC_DRAW, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRANSFORM_FEEDBACK, GL_TRANSFORM_FEEDBACK_BUFFER } from './gl-constants';
import { canvasLain, inputKnob } from './ui';
import { gainNode, sampleRate } from './audio';
import { gl } from './canvas';
import { program } from './program';
import { randomTexture } from './randomTexture';

const MUSIC_BPM = 190.0;

const BEAT = 60.0 / MUSIC_BPM;
const BAR = 240.0 / MUSIC_BPM;
const FOUR_BAR = 960.0 / MUSIC_BPM;

// == offset buffer ================================================================================
const offsetBufferArray = new Float32Array( FRAMES_PER_RENDER ).map( ( _, i ) => i );

const offsetBuffer = gl.createBuffer()!;

gl.bindBuffer( GL_ARRAY_BUFFER, offsetBuffer );
gl.bufferData( GL_ARRAY_BUFFER, offsetBufferArray, GL_STATIC_DRAW );

// == transform feedback buffer ====================================================================
const tfBuffer0 = gl.createBuffer()!;
const tfBuffer1 = gl.createBuffer()!;

gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer0 );
gl.bufferData(
  GL_ARRAY_BUFFER,
  FRAMES_PER_RENDER * 4 /* Float32Array.BYTES_PER_ELEMENT */,
  GL_DYNAMIC_COPY,
);

gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer1 );
gl.bufferData(
  GL_ARRAY_BUFFER,
  FRAMES_PER_RENDER * 4 /* Float32Array.BYTES_PER_ELEMENT */,
  GL_DYNAMIC_COPY,
);

gl.bindBuffer( GL_ARRAY_BUFFER, null );

// == transform feedback ===========================================================================
const tf = gl.createTransformFeedback()!;

gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, tf );
gl.bindBufferBase( GL_TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer0 );
gl.bindBufferBase( GL_TRANSFORM_FEEDBACK_BUFFER, 1, tfBuffer1 );
gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, null );

// == dst array ====================================================================================
export const dstArray0 = new Float32Array( FRAMES_PER_RENDER );
export const dstArray1 = new Float32Array( FRAMES_PER_RENDER );

// == render =======================================================================================
export function render( time: number ): void {
  // -- attrib -------------------------------------------------------------------------------------
  const attribLocation = gl.getAttribLocation( program, 'off' );

  gl.bindBuffer( GL_ARRAY_BUFFER, offsetBuffer );
  gl.enableVertexAttribArray( attribLocation );
  gl.vertexAttribPointer( attribLocation, 1, GL_FLOAT, false, 0, 0 );

  // -- uniforms -----------------------------------------------------------------------------------
  const locationRandomTexture = gl.getUniformLocation( program, 'addEventListener' );
  const locationDeltaSample = gl.getUniformLocation( program, 'ds' );
  const locationKnob = gl.getUniformLocation( program, 'knob' );
  const locationTimeLength = gl.getUniformLocation( program, 'tl' );
  const locationTimeHead = gl.getUniformLocation( program, 'th' );

  gl.activeTexture( GL_TEXTURE0 );
  gl.bindTexture( GL_TEXTURE_2D, randomTexture );

  gl.uniform1i( locationRandomTexture, 0 );

  gl.uniform1f( locationDeltaSample, 1.0 / sampleRate );
  gl.uniform1f( locationKnob, parseFloat( inputKnob.value ) );
  gl.uniform4f(
    locationTimeLength,
    BEAT,
    BAR,
    FOUR_BAR,
    1E16
  );
  gl.uniform4f(
    locationTimeHead,
    time % BEAT,
    time % BAR,
    time % FOUR_BAR,
    time
  );

  // -- render -------------------------------------------------------------------------------------
  gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, tf );
  gl.enable( GL_RASTERIZER_DISCARD );

  gl.beginTransformFeedback( GL_POINTS );
  gl.drawArrays( GL_POINTS, 0, FRAMES_PER_RENDER );
  gl.endTransformFeedback();

  gl.disable( GL_RASTERIZER_DISCARD );
  gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, null );

  // feedback
  gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer0 );
  gl.getBufferSubData(
    GL_ARRAY_BUFFER,
    0,
    dstArray0,
    0,
    FRAMES_PER_RENDER,
  );
  gl.bindBuffer( GL_ARRAY_BUFFER, null );

  gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer1 );
  gl.getBufferSubData(
    GL_ARRAY_BUFFER,
    0,
    dstArray1,
    0,
    FRAMES_PER_RENDER,
  );
  gl.bindBuffer( GL_ARRAY_BUFFER, null );

  // -- update lain --------------------------------------------------------------------------------
  const flip = ~~( time / BEAT % 2.0 );
  const layer = ~~( 2.0 * time / BEAT % 2.0 );
  canvasLain[ layer ].style.display = '';
  canvasLain[ layer ].style.transform = 'scale(' + gainNode.gain.value + ') scaleX(' + ( 1.0 - 2.0 * flip ) + ')';
  canvasLain[ layer ].style.filter = 'hue-rotate(' + 400.0 * time + 'deg)';
  canvasLain[ 1 - layer ].style.display = 'none';
}
