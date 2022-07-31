import { bufferReaderNode } from './BufferReaderNode';
import { dstArray0, dstArray1, render } from './render';
import { sampleRate } from './audio';

export const BLOCK_SIZE = 128;
export const BLOCKS_PER_RENDER = 16;
export const FRAMES_PER_RENDER = BLOCK_SIZE * BLOCKS_PER_RENDER;
export const LATENCY_BLOCKS = 16;

export let isPlaying = false;

export function togglePlay(): void {
  isPlaying = !isPlaying;
}

let bufferWriteBlocks = 0;

export function updateMusic(): void {
  if ( !bufferReaderNode ) { return; }

  const readBlocks = bufferReaderNode.readBlocks;

  bufferReaderNode.setActive( isPlaying );

  // -- early abort? -------------------------------------------------------------------------------
  if ( !isPlaying ) { return; }

  // -- choose a right write block -----------------------------------------------------------------
  const blockAhead = bufferWriteBlocks - readBlocks;

  // we don't have to render this time
  if ( blockAhead > LATENCY_BLOCKS ) {
    return;
  }

  // we're very behind
  if ( blockAhead < 0 ) {
    bufferWriteBlocks = (
      ~~( readBlocks / BLOCKS_PER_RENDER ) + 1
    ) * BLOCKS_PER_RENDER;
  }

  // -- render -------------------------------------------------------------------------------------
  const time = BLOCK_SIZE * bufferWriteBlocks / sampleRate;

  render( time );

  bufferReaderNode.write( 0, bufferWriteBlocks, 0, dstArray0.subarray( 0, FRAMES_PER_RENDER ) );
  bufferReaderNode.write( 1, bufferWriteBlocks, 0, dstArray1.subarray( 0, FRAMES_PER_RENDER ) );

  // -- update write blocks ------------------------------------------------------------------------
  bufferWriteBlocks += BLOCKS_PER_RENDER;
}
