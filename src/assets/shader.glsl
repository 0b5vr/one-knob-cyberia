#version 300 es

//[
precision highp float;
//]

// #pragma shader_minifier_loader bypass

const float TAU = 2.0 * acos( -1.0 );

uniform float a; // bps
uniform float de; // delta sample
uniform float kn; // knob
uniform float ti; // time head

uniform sampler2D ra; // texture random

in float of;

out float ol;
out float or;

vec2 smoother( vec2 t ) {
  return ( t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 ) );
}

vec2 orbit( float t ) {
  return vec2( cos( TAU * t ), sin( TAU * t ) );
}

vec2 getDir( ivec2 p ) {
    return orbit( texelFetch( ra, p & 255, 0 ).x );
}

float perlin2d( vec2 p ) {
  vec2 cell = floor( p );
  vec2 cellCoord = p - cell;
  ivec2 cellIndex = ivec2( cell );

  vec2 cellCoordS = smoother( cellCoord );

  return mix(
    mix(
      dot( getDir( cellIndex ), cellCoord ),
      dot( getDir( cellIndex + ivec2( 1, 0 ) ), cellCoord - vec2( 1.0, 0.0 ) ),
      cellCoordS.x
    ),
    mix(
      dot( getDir( cellIndex + ivec2( 0, 1 ) ), cellCoord - vec2( 0.0, 1.0 ) ),
      dot( getDir( cellIndex + ivec2( 1, 1 ) ), cellCoord - 1.0 ),
      cellCoordS.x
    ),
    cellCoordS.y
  );
}

float fbm( vec2 p ) {
  return (
    + perlin2d( 2.0 * p ) / 2.0
    + perlin2d( 4.0 * p ) / 4.0
    + perlin2d( 8.0 * p ) / 8.0
    + perlin2d( 16.0 * p ) / 16.0
  );
}

void main() {
  float time = ti + of * de;

  vec2 dest = vec2( 0 );

  float t = mod( time, 1.0 / a );
  if ( time > 15.0 / a ) {
    t = mod( t, 0.5 / a );
  }
  float sidechain = smoothstep( 0.3 / a, 0.6 / a, t );

  // subbass
  float phase = 300.0 * t - 60.0 * exp( -40.0 * t );
  float subbass = sin( phase );

  // kick
  float p = 1.0 + exp( -mix( 6.0, 1.2, kn ) );

  dest += tanh( 30.0 * subbass );

  // unison x3
  t *= p;
  phase = 300.0 * t - 60.0 * exp( -40.0 * t );

  dest += tanh( 30.0 * (
    sin( phase + 0.2 * sin( 3.0 * phase ) - 0.1 * sin( 13.1 * phase ) )
  ) );

  t *= p;
  phase = 300.0 * t - 60.0 * exp( -40.0 * t );

  dest += tanh( 30.0 * (
    sin( phase + 0.2 * sin( 3.0 * phase ) - 0.1 * sin( 13.1 * phase ) )
  ) );

  t *= p;
  phase = 300.0 * t - 60.0 * exp( -40.0 * t );

  dest += tanh( 30.0 * (
    sin( phase + 0.2 * sin( 3.0 * phase ) - 0.1 * sin( 13.1 * phase ) )
  ) );

  // hihat
  t = mod( t - 0.5 / a, 1.0 / a );

  float env = exp( -20.0 * t );

  vec2 uv = orbit( 800.0 * t ) + orbit( 4000.0 * t ) * exp( -100.0 * t ) + 137.0 * t;

  dest += 0.5 * sidechain * env * tanh( 5.0 * vec2(
    fbm( uv ),
    fbm( uv - 0.5 )
  ) );

  uv = orbit( 802.0 * t ) + orbit( 4000.0 * t ) * exp( -100.0 * t ) + 137.0 * t;

  dest -= 0.5 * sidechain * env * tanh( 5.0 * vec2(
    fbm( uv ),
    fbm( uv - 0.5 )
  ) );

  // scream
  t = mod( time, 4.0 / a );

  uv = 2.0 * orbit( 79.0 * t ) + 0.2 * orbit( 2000.0 * t ) + 10.0 * t;

  dest += 0.2 * sidechain * tanh( 20.0 * vec2(
    fbm( uv ),
    fbm( uv + 0.05 )
  ) );

  // distort master
  dest = mix( tanh( 4.0 * dest ), vec2( subbass ), 0.3 );

  ol = dest.x;
  or = dest.y;
}
