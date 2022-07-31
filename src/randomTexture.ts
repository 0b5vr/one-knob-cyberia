import { GL_LINEAR, GL_RGBA, GL_RGBA8, GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_TEXTURE_MIN_FILTER, GL_UNSIGNED_BYTE } from './gl-constants';
import { gl } from './canvas';

export const randomTexture = gl.createTexture()!;

const source = new Uint8Array( 262144 ).map( () => 256.0 * Math.random() );

gl.bindTexture( GL_TEXTURE_2D, randomTexture );

gl.texImage2D(
  GL_TEXTURE_2D, // target
  0, // level
  GL_RGBA8, // internalformat
  256, // width
  256, // height
  0, // border
  GL_RGBA, // format
  GL_UNSIGNED_BYTE, // type
  source, // pixels
);

gl.texParameteri( GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR );
gl.texParameteri( GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR );
