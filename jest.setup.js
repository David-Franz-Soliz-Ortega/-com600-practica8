const { TransformStream, CompressionStream, DecompressionStream } = require('node:stream/web');
const { TextEncoder, TextDecoder } = require('node:util');

Object.assign(globalThis, {
  TransformStream,
  CompressionStream,
  DecompressionStream,
  TextEncoder,
  TextDecoder
});