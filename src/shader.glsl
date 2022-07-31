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

vec2 mainAudio( float time ) {
  vec2 dest = vec2( 0 );

  float kickt = mod( time, 1.0 / a );
  if ( time > 15.0 / a ) {
    kickt = mod( kickt, 0.5 / a );
  }
  float sidechain = smoothstep( 0.3 / a, 0.6 / a, kickt );

  // kick
  {
    float p = 1.0;
    for ( int i = 0; i < 4; i ++ ) {
      p += exp( -7.0 + 5.0 * kn );
      float t = kickt * p * p;
      float phase = 300.0 * t - 60.0 * exp( -40.0 * t );

      dest += 0.2 * tanh( 60.0 * (
        sin( phase + 0.2 * sin( 3.0 * phase ) - 0.1 * sin( 13.1 * phase ) )
      ) );
    }
  }

  // hihat
  {
    float t = mod( time - 0.5 / a, 1.0 / a );

    float env = exp( -10.0 * t );

    vec2 uv = orbit( 800.0 * t ) + orbit( 4000.0 * t ) * exp( -100.0 * t ) + 137.0 * t;

    dest += 0.3 * sidechain * env * tanh( 5.0 * vec2(
      fbm( uv ),
      fbm( uv - 0.5 )
    ) );

    uv = orbit( 802.0 * t ) + 137.0 * t;

    dest -= 0.3 * sidechain * env * tanh( 5.0 * vec2(
      fbm( uv ),
      fbm( uv - 0.5 )
    ) );
  }

  // scream
  {
    float t = mod( time, 4.0 / a );

    vec2 uv = 2.0 * orbit( 79.0 * t ) + 0.2 * orbit( 2000.0 * t ) + 10.0 * t;

    dest += 0.1 * sidechain * tanh( 20.0 * vec2(
      fbm( uv ),
      fbm( uv + 0.05 )
    ) );
  }

  return tanh( 8.0 * dest );
}

void main() {
  vec2 out2 = mainAudio( ti + of * de );
  ol = out2.x;
  or = out2.y;
}
