import { canvasLain } from './ui';

import lainDance1 from './assets/lain-dance-1-compromise.svg?lain-dance';
import lainDance2 from './assets/lain-dance-2-compromise.svg?lain-dance';
import lainDance3 from './assets/lain-dance-3-compromise.svg?lain-dance';
import lainDance4 from './assets/lain-dance-4-compromise.svg?lain-dance';

/*
 * Vertex format!!
 *
 * the format goes like: `color,path1,path2;color,path1;color,path1,path2,path3;...`
 *
 * Each string of the array below represents a single artwork.
 * An artwork consists of polyline paths, separated by `;`.
 * Each path starts by arguing its fill color in a 3-char hex.
 * It can be a 4-char hex when the fill color has transparency.
 * After the separator `,`, it tells the positions of vertices.
 * A vertex position is stored in an 8-bit hex, and it's a delta from its previous vertex.
 * When the value exceeds 256 by adding the diff, it takes a modulo by 256.
 * Think like we're using signed 8-bit int.
 * If consecutive two paths (or more) have the same color, they are concatenated by `,`.
 *
 * Shoutouts to STNICCC 2000
 * http://arsantica-online.com/st-niccc-competition/
 */

[
  lainDance1,
  lainDance2,
  lainDance3,
  lainDance4,
].map( ( dance, i ) => {
  const context = canvasLain[ i ].getContext( '2d' )!;

  dance
    .split( ';' )
    .map( ( s ) => {
      const path = s.split( ',' );

      context.fillStyle = '#' + path.shift();

      path.map( ( verticesStr ) => {
        context.beginPath();

        const a = verticesStr.split( '' );

        let x = 0;
        let y = 0;

        while ( a.length ) {
          x += parseInt( a.shift()! + a.shift()!, 16 );
          y += parseInt( a.shift()! + a.shift()!, 16 );

          context.lineTo( x % 256, y % 256 );
        }

        context.fill();
        context.stroke();
      } );
    } );
} );

export default null;
