import { BLOCKS_PER_RENDER, BLOCK_SIZE, BUFFER_FRAMES_PER_CHANNEL, FRAMES_PER_RENDER, LATENCY_BLOCKS } from './constants';
import { bps } from './ui';
import { bufferReaderNode, readBlocks } from './BufferReaderNode';
import { dstArray0, dstArray1, render } from './render';
import { sampleRate } from './audio';

export let isPlaying = false;

export function togglePlay(): void {
  isPlaying = !isPlaying;
  bufferReaderNode!.port.postMessage( isPlaying );
}

let fourBar = 0;
let bufferWriteBlocks = 0;

export function updateMusic(): void {
  if ( isPlaying && bufferReaderNode ) {
    // -- choose a right write block ---------------------------------------------------------------
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

    // -- render -----------------------------------------------------------------------------------
    render( fourBar );

    const offset = bufferWriteBlocks * BLOCK_SIZE % BUFFER_FRAMES_PER_CHANNEL;

    bufferReaderNode.port.postMessage( [
      dstArray0.subarray( 0, FRAMES_PER_RENDER ),
      offset,
    ] );

    bufferReaderNode.port.postMessage( [
      dstArray1.subarray( 0, FRAMES_PER_RENDER ),
      offset + BUFFER_FRAMES_PER_CHANNEL,
    ] );

    // -- update write blocks and position ---------------------------------------------------------
    fourBar = ( fourBar + BLOCKS_PER_RENDER * BLOCK_SIZE / sampleRate * bps ) % 16.0;
    bufferWriteBlocks += BLOCKS_PER_RENDER;
  }
}
