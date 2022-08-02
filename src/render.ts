import { FRAMES_PER_RENDER } from './constants';
import { GL_ARRAY_BUFFER, GL_DYNAMIC_COPY, GL_FLOAT, GL_POINTS, GL_STATIC_DRAW, GL_TEXTURE0, GL_TEXTURE_2D, GL_TRANSFORM_FEEDBACK, GL_TRANSFORM_FEEDBACK_BUFFER } from './gl-constants';
import { SHADER_IN_OFFSET, SHADER_UNIFORM_BPS, SHADER_UNIFORM_DELTA_SAMPLE, SHADER_UNIFORM_KNOB, SHADER_UNIFORM_TEXTURE_RANDOM, SHADER_UNIFORM_TIME_HEAD } from './shader-uniforms';
import { bps, canvasLain, inputKnob } from './ui';
import { gainNode, sampleRate } from './audio';
import { gl } from './canvas';
import { program } from './program';
import { randomTexture } from './randomTexture';

// == offset buffer ================================================================================
const offsetBufferArray = new Float32Array( FRAMES_PER_RENDER ).map( ( _, i ) => i );

const offsetBuffer = gl.createBuffer()!;

gl.bindBuffer( GL_ARRAY_BUFFER, offsetBuffer );
gl.bufferData( GL_ARRAY_BUFFER, offsetBufferArray, GL_STATIC_DRAW );
// gl.bindBuffer( GL_ARRAY_BUFFER, null );

// == transform feedback buffer ====================================================================
const tfBuffer0 = gl.createBuffer()!;
const tfBuffer1 = gl.createBuffer()!;

gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer0 );
gl.bufferData(
  GL_ARRAY_BUFFER,
  FRAMES_PER_RENDER * 4 /* Float32Array.BYTES_PER_ELEMENT */,
  GL_DYNAMIC_COPY,
);
// gl.bindBuffer( GL_ARRAY_BUFFER, null );

gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer1 );
gl.bufferData(
  GL_ARRAY_BUFFER,
  FRAMES_PER_RENDER * 4 /* Float32Array.BYTES_PER_ELEMENT */,
  GL_DYNAMIC_COPY,
);
// gl.bindBuffer( GL_ARRAY_BUFFER, null );

// == transform feedback ===========================================================================
const tf = gl.createTransformFeedback()!;

gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, tf );
gl.bindBufferBase( GL_TRANSFORM_FEEDBACK_BUFFER, 0, tfBuffer0 );
gl.bindBufferBase( GL_TRANSFORM_FEEDBACK_BUFFER, 1, tfBuffer1 );
// gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, null );

// == dst array ====================================================================================
export const dstArray0 = new Float32Array( FRAMES_PER_RENDER );
export const dstArray1 = new Float32Array( FRAMES_PER_RENDER );

// == render =======================================================================================
export function render( fourBar: number ): void {
  // gl.useProgram( program );

  // -- attrib -------------------------------------------------------------------------------------
  const attribLocation = gl.getAttribLocation( program, SHADER_IN_OFFSET );

  gl.bindBuffer( GL_ARRAY_BUFFER, offsetBuffer );
  gl.enableVertexAttribArray( attribLocation );
  gl.vertexAttribPointer( attribLocation, 1, GL_FLOAT, false, 0, 0 );

  // -- uniforms -----------------------------------------------------------------------------------
  const locationTextureRandom = gl.getUniformLocation( program, SHADER_UNIFORM_TEXTURE_RANDOM );
  const locationBps = gl.getUniformLocation( program, SHADER_UNIFORM_BPS );
  const locationDeltaSample = gl.getUniformLocation( program, SHADER_UNIFORM_DELTA_SAMPLE );
  const locationKnob = gl.getUniformLocation( program, SHADER_UNIFORM_KNOB );
  const locationTimeHead = gl.getUniformLocation( program, SHADER_UNIFORM_TIME_HEAD );

  gl.activeTexture( GL_TEXTURE0 );
  gl.bindTexture( GL_TEXTURE_2D, randomTexture );

  gl.uniform1i( locationTextureRandom, 0 );

  gl.uniform1f( locationBps, bps );
  gl.uniform1f( locationDeltaSample, 1.0 / sampleRate );
  gl.uniform1f( locationKnob, parseFloat( inputKnob.value ) );
  gl.uniform1f( locationTimeHead, fourBar / bps );

  // -- render -------------------------------------------------------------------------------------
  gl.bindTransformFeedback( GL_TRANSFORM_FEEDBACK, tf );
  // gl.enable( GL_RASTERIZER_DISCARD );

  gl.beginTransformFeedback( GL_POINTS );
  gl.drawArrays( GL_POINTS, 0, FRAMES_PER_RENDER );
  gl.endTransformFeedback();

  // gl.disable( GL_RASTERIZER_DISCARD );
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
  // gl.bindBuffer( GL_ARRAY_BUFFER, null );

  gl.bindBuffer( GL_ARRAY_BUFFER, tfBuffer1 );
  gl.getBufferSubData(
    GL_ARRAY_BUFFER,
    0,
    dstArray1,
    0,
    FRAMES_PER_RENDER,
  );
  // gl.bindBuffer( GL_ARRAY_BUFFER, null );

  // -- update lain --------------------------------------------------------------------------------
  const flip = ~~( fourBar % 2.0 );
  canvasLain.forEach( ( canvas ) => canvas.style.display = 'none' );
  const targetCanvasStyle = canvasLain[ ~~( 4.0 * fourBar % 4.0 ) ].style;
  targetCanvasStyle.display = '';
  targetCanvasStyle.transform = 'scale(' + gainNode.gain.value + ') scaleX(' + ( 1.0 - 2.0 * flip ) + ')';
  targetCanvasStyle.filter = 'hue-rotate(' + 180.0 * fourBar + 'deg)';
}
