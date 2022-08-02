import { CHANNELS } from './constants';
import { audio, gainNode } from './audio';
import processorCode from './BufferReaderProcessor.js?worklet';

const processorBlob = new Blob( [ processorCode ], { type: 'text/javascript' } );
const processorUrl = URL.createObjectURL( processorBlob );

// export class BufferReaderNode extends AudioWorkletNode {
//   public readBlocks: number;

//   public constructor( audio: AudioContext ) {
//     super( audio, 'buffer-reader-processor', {
//       outputChannelCount: [ CHANNELS ],
//     } );

//     this.readBlocks = 0;

//     this.port.onmessage = ( ( { data } ) => {
//       this.readBlocks = data;
//     } );
//   }

//   public setActive( isActive: boolean ): void {
//     this.port.postMessage( isActive );
//   }

//   /**
//    * ```js
//    * offset = BUFFER_SIZE_PER_CHANNEL * channel + ( BLOCK_SIZE * block ) % BUFFER_SIZE_PER_CHANNEL + offset
//    * ```
//    */
//   public write( offset: number, buffer: ArrayLike<number> ): void {
//     this.port.postMessage( [
//       buffer,
//       offset,
//     ] );
//   }
// }

export let readBlocks = 0;

export let bufferReaderNode: AudioWorkletNode | undefined;

audio.audioWorklet.addModule( processorUrl ).then( () => {
  bufferReaderNode = new AudioWorkletNode( audio, 'a', {
    outputChannelCount: [ CHANNELS ],
  } );

  bufferReaderNode.port.onmessage = ( ( { data } ) => {
    readBlocks = data;
  } );

  bufferReaderNode.connect( gainNode );
} );
