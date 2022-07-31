import { GL_RASTERIZER_DISCARD } from './gl-constants';

export const canvas = document.createElement( 'canvas' );

export const gl = canvas.getContext( 'webgl2' )!;
gl.enable( GL_RASTERIZER_DISCARD );
