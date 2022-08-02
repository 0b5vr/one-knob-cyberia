import { ElementNode, parse } from 'svg-parser';
import { Plugin } from 'vite';
import { traverse } from '@0b5vr/experimental';
import fs from 'fs';

const fileRegex = /\?lain-dance$/;

export const lainDancePlugin: () => Plugin = () => {
  return {
    name: 'lain-dance',
    enforce: 'pre',
    async transform( _: string, id: string ) {
      if ( fileRegex.test( id ) ) {
        const filepath = id.split( '?' )[ 0 ];
        const src = await fs.promises.readFile( filepath, { encoding: 'utf8' } );

        const result = parse( src );
        const svg = result.children[ 0 ] as ElementNode;
        const viewport = ( svg.properties!.viewBox as string )
          .split( ' ' )
          .map( ( s ) => parseFloat( s ) );
        const width = viewport[ 2 ];
        const height = viewport[ 3 ];

        // assuming aspect ratio is > 1
        const xshift = ( width - height ) / 2.0;

        const entries: [ string, string ][] = [];

        // traverse and convert paths
        traverse( svg, ( node: ElementNode ) => {
          if ( node.tagName === 'path' ) {
            let d = node.properties!.d as string;
            d = d.replace( 'M', '' );
            d = d.replace( 'Z', '' );

            let px = 0;
            let py = 0;

            const vertices = d
              .split( 'L' )
              .map( ( s ) => s.split( ',' ) )
              .map( ( v ) => {
                const x = Math.round( ( parseFloat( v[ 0 ] ) - xshift ) / height * 256.0 );
                const y = Math.round( parseFloat( v[ 1 ] ) / height * 256.0 );

                const dx = ( x - px + 256 ) % 256;
                const dy = ( y - py + 256 ) % 256;

                px = x;
                py = y;

                return [ dx, dy ];
              } )
              .flat();

            const style = node.properties!.style as string;

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
            ] );
          }

          return node.children as ElementNode[];
        } );

        // join consecutive path which color is same
        let lastColor = '';
        const concatenatedEntries = entries.reduce( ( e, v ) => {
          if ( lastColor === v[ 0 ] ) {
            e[ e.length - 1 ].push( v[ 1 ] );
          } else {
            lastColor = v[ 0 ];
            e.push( v );
          }

          return e;
        }, [] as [ string, ...string[] ][] );

        // join with `,`
        // it will look like color,path1,path2,...
        const strEntries = concatenatedEntries.map( ( v ) => v.join( ',' ) );

        return {
          code: `export default \`${ strEntries.join( ';' ) }\`;`,
        };
      }
    }
  };
};
