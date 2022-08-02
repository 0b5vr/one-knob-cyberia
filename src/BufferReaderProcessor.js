/* eslint-disable */

const BLOCK_SIZE = 128;
const CHANNELS = 2;
const BUFFER_FRAMES_PER_CHANNEL = 32768;

let active = 0; // false;
let blocks = 0;
const buffer = new Float32Array( CHANNELS * BUFFER_FRAMES_PER_CHANNEL );

registerProcessor( 'a', class extends AudioWorkletProcessor {
  constructor() {
    super();

    this.port.onmessage = ( { data } ) => {
      if ( Array.isArray( data ) ) {
        buffer.set( ...data );
      } else {
        active = data;
      }
    };
  }

  process( inputs, outputs, parameters ) {
    if ( active ) {
      let offset = blocks * BLOCK_SIZE % BUFFER_FRAMES_PER_CHANNEL;
      outputs[ 0 ][ 0 ].set( buffer.subarray( offset, offset + BLOCK_SIZE ) );
      offset += BUFFER_FRAMES_PER_CHANNEL;
      outputs[ 0 ][ 1 ].set( buffer.subarray( offset, offset + BLOCK_SIZE ) );

      this.port.postMessage( blocks ++ );
    }

    return true;
  }
} );
