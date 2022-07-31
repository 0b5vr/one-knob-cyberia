const fs = require( 'fs' );
const { resolve } = require( 'path' );
const { parse } = require( 'svg-parser' );
const { traverse } = require( '@0b5vr/experimental' );

( async () => {
  const inputPath = resolve( process.cwd(), process.argv[ 2 ] );
  const input = fs.readFileSync( inputPath, { encoding: 'utf8' } );

  const result = parse( input );
  const viewport = result.children[ 0 ].properties.viewBox
    .split( ' ' )
    .map( ( s ) => parseFloat( s ) );
  const width = viewport[ 2 ];
  const height = viewport[ 3 ];

  // assuming aspect ratio is > 1
  const xshift = ( width - height ) / 2.0;

  const entries = [];

  traverse( result, ( node ) => {
    if ( node.tagName === 'path' ) {
      let d = node.properties.d;
      d = d.replace( 'M', '' );
      d = d.replace( 'Z', '' );

      const vertices = d
        .split( 'L' )
        .map( ( s ) => s.split( ',' ) )
        .map( ( v ) => {
          const x = parseFloat( v[ 0 ] ) - xshift;
          const y = parseFloat( v[ 1 ] );
          return [
            Math.round( x / height * 256.0 ),
            Math.round( y / height * 256.0 ),
          ];
        } )
        .flat();

      const style = node.properties.style;

      let fill = [ 0, 0, 0 ];

      const fillMatchRgb = style.match( /fill:rgb\(([0-9,]+)\)/ )?.[ 1 ];
      if ( fillMatchRgb ) {
        fill = fillMatchRgb
          .split( ',' )
          .map( ( s ) => parseFloat( s ) );
      }

      const fillMatchNone = style.match( /fill:none/ );
      if ( fillMatchNone ) {
        fill = [ 0, 0, 0, 0 ];
      }

      entries.push( [
        fill.map( ( v ) => Math.floor( v / 16.0 ).toString( 16 ) ).join( '' ),
        vertices.map( ( v ) => ( '0' + v.toString( 16 ) ).slice( -2 ) ).join( '' ),
      ].join( ',' ) );
    }

    return node.children;
  } );

  console.log( entries.join( ';' ) );
} )();
