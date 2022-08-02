import { GL_R8, GL_RED, GL_TEXTURE_2D, GL_UNSIGNED_BYTE } from './gl-constants';
import { gl } from './canvas';

export const randomTexture = gl.createTexture()!;

const source = new Uint8Array( 65536 ).map( () => 256.0 * Math.random() );

gl.bindTexture( GL_TEXTURE_2D, randomTexture );

gl.texImage2D(
  GL_TEXTURE_2D, // target
  0, // level
  GL_R8, // internalformat
  256, // width
  256, // height
  0, // border
  GL_RED, // format
  GL_UNSIGNED_BYTE, // type
  source, // pixels
);

// gl.texParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
// gl.texParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR );

// gl.bindTexture( GL_TEXTURE_2D, null );
