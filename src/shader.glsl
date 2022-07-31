#version 300 es

//[
precision highp float;
//]

// #pragma shader_minifier_loader bypass

#define PI 3.141592654
#define TAU 6.283185307
#define BEAT (60.0/190.0)

#define saturate(i) clamp(i, 0.,1.)
#define clip(i) clamp(i,-1.,1.)
#define linearstep(a,b,x) saturate(((x)-(a))/((b)-(a)))

uniform float ds;
uniform float knob;
uniform vec4 tl;
uniform vec4 th;

uniform vec4 param_knob0;
uniform sampler2D addEventListener;

in float off;

out float outL;
out float outR;

vec2 smoother( vec2 t ) {
  return ( t * t * t * ( t * ( t * 6.0 - 15.0 ) + 10.0 ) );
}

vec2 orbit( float t ) {
  return vec2( cos( TAU * t ), sin( TAU * t ) );
}

vec2 getDir( ivec2 p ) {
    return orbit( texelFetch( addEventListener, p & 255, 0 ).x );
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

vec2 mainAudio(vec4 time){
  vec2 dest = vec2(0);

  float kickt = time.x;
  if ( time.z > 15.0 * BEAT ) {
    kickt = mod( kickt, 0.5 * BEAT );
  }
  float sidechain = smoothstep( 0.3 * BEAT, 0.6 * BEAT, kickt );

  // kick
  {
    float p = 1.0;
    for ( int i = 0; i < 4; i ++ ) {
      p += exp( -7.0 + 5.0 * knob );
      float t = kickt * p * p;
      float phase = 300.0 * t - 50.0 * exp( -40.0 * t );

      dest += 0.2 * clip( 60.0 * (
        sin( phase + 0.2 * sin( 3.0 * phase ) - 0.1 * sin( 13.1 * phase ) )
      ) );
    }
  }

  // hihat
  {
    float t = mod( time.x - 0.5 * BEAT, BEAT );

    float env = exp( -15.0 * t );

    vec2 uv = orbit( 800.0 * t ) + 137.0 * t;

    dest += 0.2 * sidechain * env * vec2(
      fbm( uv ),
      fbm( uv + 0.5 )
    );

    uv = orbit( 802.0 * t ) + 137.0 * t;

    dest -= 0.2 * sidechain * env * tanh( 5.0 * vec2(
      fbm( uv ),
      fbm( uv - 0.5 )
    ) );
  }

  // scream
  {
    float t = time.y;

    vec2 uv = 2.0 * orbit( 79.0 * t ) + 0.2 * orbit( 2000.0 * t ) + 10.0 * t;

    dest += 0.1 * sidechain * tanh( 20.0 * vec2(
      fbm( uv ),
      fbm( uv + 0.05 )
    ) );
  }

  return tanh( 8.0 * dest );
}

void main() {
  vec2 out2 = mainAudio( mod( th + off * ds, tl ) );
  outL = out2.x;
  outR = out2.y;
}
