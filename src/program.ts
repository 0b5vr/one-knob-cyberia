import { GL_COMPILE_STATUS, GL_FRAGMENT_SHADER, GL_LINK_STATUS, GL_SEPARATE_ATTRIBS, GL_VERTEX_SHADER } from './gl-constants';
import { SHADER_OUT_L, SHADER_OUT_R } from './shader-uniforms';
import { gl } from './canvas';
import shader from './shader.glsl?shader';

const frag = '#version 300 es\nvoid main(){discard;}';

// == vert =========================================================================================
const vertexShader = gl.createShader( GL_VERTEX_SHADER )!;

gl.shaderSource( vertexShader, shader );
gl.compileShader( vertexShader );

if ( import.meta.env.DEV ) {
  if ( !gl.getShaderParameter( vertexShader, GL_COMPILE_STATUS ) ) {
    throw new Error( gl.getShaderInfoLog( vertexShader ) ?? undefined );
  }
}

// == frag =========================================================================================
const fragmentShader = gl.createShader( GL_FRAGMENT_SHADER )!;

gl.shaderSource( fragmentShader, frag );
gl.compileShader( fragmentShader );

if ( import.meta.env.DEV ) {
  if ( !gl.getShaderParameter( fragmentShader, GL_COMPILE_STATUS ) ) {
    throw new Error( gl.getShaderInfoLog( fragmentShader ) ?? undefined );
  }
}

// == program ======================================================================================
export const program = gl.createProgram()!;

gl.attachShader( program, vertexShader );
gl.attachShader( program, fragmentShader );

gl.transformFeedbackVaryings(
  program,
  [ SHADER_OUT_L, SHADER_OUT_R ],
  GL_SEPARATE_ATTRIBS,
);

gl.linkProgram( program );

if ( import.meta.env.DEV ) {
  if ( !gl.getProgramParameter( program!, GL_LINK_STATUS ) ) {
    throw new Error( gl.getProgramInfoLog( program! ) ?? undefined );
  }
}

// == use, I hope this is the only shader you use ==================================================
gl.useProgram( program );
