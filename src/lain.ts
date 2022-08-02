import { canvasLain } from './ui';

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
  '732,9fe2fb0dff0ef40005ef03f40a02,56f706fafff107eff8fef811ff0a00090504;c13,a87dff6ab1e921b02ffd;d78,796df30402dd0b1f;121,ae77e9eef2cfe300022303020713ff07fc0705060e0422fb06f8;fda,d34907000305f905fcff01f7,522001fb03fd05000203fa08fbfd,7e3bf904fd01fafcfa00f7f101ea09fa1713fe17,671efdfffe00,7b23fdfefc01;fee,918912f508eff9ebf90107ff1fff11fc00f905fcf8fed9fbf7fbf902f5fef604001e0c2b,7188fce001e904edfcfefa00faf8f900fffc00f902f7fa02fafbf7281f0a00fa0006012903080708;411,7e4b03fc02ee0ad9d702fa07fe010202fe0f02fe05f406f80201010904fe030904fc02060500ff1d0108;877,832cfb000004050000fc;edc,83350c0200fb07fc00f802ecf7f6f7fcf400fa04f900f7080e010b07050a0307fe030009;865,7e0c04fefefdfb000305,700c0302080003fcfcfdfafffc030003,780efefcfcfe;c13,6132fc04fc0a0007fe0000f904f400f605fc010c,8a320406fb0b0310fe01feeffbf507fa,9607fa00ff04fe000704000405fefff9fefd;000,6722ff04fd0000fb0401,762bfcff00fb03000302fe04,6b36fd01',
  '732,a0ddfb10010dfd03f700fdfe07f002f10a01,40d7010706ff05f611eefbf9f20cf611;c13,ad7efa32002ef000d5f0ebf300f710f313d23301;d78,7e6dea060be00b1a;121,a485e7b2e10a112cff07fc0706070e031800;fda,d35907010204fa05fcff01f7,552b02f809ff0004f808fdfd,8745f208eff7fae705f52a14f611,6e35fbfefb00,7f36fcfefa01;fee,a3890cf503f4fbeff70009002703fffa04fadaf0f8faf3fdf1fd0120152d,668206ea08f102efecf3fcebfa03fdf9fb12fc180d03140102fdfe03f9170017;411,8c52ffbfd712fc11050006f4060d02fc030603fc080302fe0303081b;877,8b3bfc010004040000fb;edc,7b260a05080e0c00fcf404fafdfa00eaf4f9f201f00af6151902;865,781a04fffefdfb000304,6e1905fdfefdfc010105,6c1e030206ff03fbfefbfbfffc04ff06,731ffefcfb01;c13,6540fb01f507fefe0bf800fa05f80210,95360403000c070bfe01f3eb04fa,8b01f502fe020600000307ff030402fd0403fef8f9fe;000,7d380304fc00fefc0300,6c3bfd01fefb03000204,7948fc00',
  '732,a2d5fd1bf90cf801fefb07f502e70b01,50abfb01f610010905000bf315fffbf7f301fbfc;c13,b37e0052fe07dffde4f2eae80efe04fb13d830ff;d78,8574f30405e60816;121,a188f8acec04f5150827fc0a0c071703;fda,ce780bfa0206fa04f9fc,642e03fa05ff0506ff08f4f9,9d20ed22fd00fefcf5f8f9f701f705f00cf61816,831cfbfefa02,9322fcfdfa00,8233fe01fdfe;fee,958d1df404f9fef2f2f90e071b0e08fa0401fffcebeef6f1fafef4f4f1fbf9190237,7a8506cb03edf700f802fe0402ecf901f9fbfb10001b16fe01fdff03fa1d000c07080400;411,874b0cf509f0040802fd0802eed4e5fff50f080207f50500fe0d03f9020a05fb030604000208f022;877,9a30fbfdfe05050202fc,781afbfefe04050302fb;edc,790d0cff0e050a0efc09010505ff010608fc02fc07fffff0f8f3f2f6ec01f506fe04;865,930a04fffffdfbff0205,8a0a060204fefefafbfffa00ff040403,8f0bfffcf9ff;c13,732ffc00f70ffefe0af200f307fffe0f,9e2c0109f805f90bfeff07f502f30700,b316fafbfc020401000803ff020401f7;000,9127fe03fc0000fa03ff0304,7d26fe00fffc03fe0103ff03',
  '732,a2e10308fc0efb06f800fffd07f200f7fbef0d02000d,73fb06fc00ef0fecf4fff413fe0a010b0402;c13,b47c093b001ce705d3fbe6f108e81bd03400;d78,816df0020be4051a;121,ae77f0c5d90a0a2cfa07100a15000ef4;fda,b53a06fa0707f70afcf5,544000f903fc07020009f600,9647f903f900f3f4fff10fec17190109f50a,8331fcfffc02,9933fdfefb01,8f46fe01fdff;fee,a18b19ef00f4fef4f70009000ffbfcdcfa06fa00fd1202f5f9faf2fef8140839,717f07e309ee02f6f9f9fffaf005f80902fbfd01fefaf902fafcfe02ff11020a1ffd05f5fb0bf913001204050300;411,a55100e3fceee7f7ed0aff06fd060500ff0604fe03fa00020cf70c0901fc0b09051d;877,a537fc000103030000fd;edc,77230ffe0f020e080209030304fcfef800e8fbf8f1fbf5fff804f70afd10;865,941804fefefdfb000305,881506fefdfcfc010105,871a0303050106fbfefbfbfef9030005,911cfefcfcfffc03;c13,7739f702f60dffff0af303f907000006,ac33020afd070410ff01fbf0fef305fb,9503fa010602000307ff070601fdfdf9f4ff;000,8537fe02fe00fdfd04ff0302,973afd00fdfd04fe0403fe02',
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
          x %= 256;
          y %= 256;

          context.lineTo( x, y );
        }

        context.fill();
        context.stroke();
      } );
    } );
} );

export default null;
