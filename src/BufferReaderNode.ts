import { audio, gainNode } from './audio';
import processorCode from './BufferReaderProcessor.js?worklet';

const BLOCK_SIZE = 128;
const CHANNELS = 2;
const BUFFER_SIZE_PER_CHANNEL = 65536;

const processorBlob = new Blob( [ processorCode ], { type: 'text/javascript' } );
const processorUrl = URL.createObjectURL( processorBlob );

export class BufferReaderNode extends AudioWorkletNode {
  public readBlocks: number;

  public setActive( isActive: boolean ): void {
    this.port.postMessage( isActive );
  }

  public constructor( audio: AudioContext ) {
    super( audio, 'buffer-reader-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [ CHANNELS ],
    } );

    this.readBlocks = 0;

    this.port.onmessage = ( ( { data } ) => {
      this.readBlocks = data;
    } );
  }

  public write( channel: number, block: number, offset: number, buffer: ArrayLike<number> ): void {
    const totalOffset = (
      BUFFER_SIZE_PER_CHANNEL * channel
      + ( BLOCK_SIZE * block ) % BUFFER_SIZE_PER_CHANNEL
      + offset
    );

    this.port.postMessage( [
      buffer,
      totalOffset,
    ] );
  }
}

export let bufferReaderNode: BufferReaderNode | undefined;

audio.audioWorklet.addModule( processorUrl ).then( () => {
  bufferReaderNode = new BufferReaderNode( audio );
  bufferReaderNode.connect( gainNode );
} );
