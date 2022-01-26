export const vs = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
}`

export const fs = `
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

varying vec2 surfacePosition;
#define time (time-.4/(2.-length(surfacePosition)))


float sdCross(vec3 p, float c){
	p = abs(p);
	float dxy = max(p.x, p.y);
	float dzy = max(p.z, p.y);
	float dxz = max(p.x, p.z);
	return min(min(dxy, dzy), dxz) - c;
}

float sdBox(vec3 p, vec3 b){
	vec3 d = abs(p) - b;
	return length(max(d, 0.)) + min(max(max(d.x, d.y), d.z), 0.);
}

float sdSphere(vec3 p, float r){
	return length(p) - r;
}

float sdMenger(vec3 p, float scale, float width){
	float d = sdBox(p, vec3(1.));
	float s = 1.;
	for(int i = 0; i < 6; i++){
		vec3 q = mod(p * s, 2.) - 1.;
		s *= scale;
		q = 1. - scale * abs(q);
		float c = sdCross(q, width) / s;
		d = max(d, c);
	}
	return d;
}


float map(vec3 p){
	float move = fract(time * .25);
	float scale = mix(1., 1. / 3., pow(move, 20.));
	float d = 2.;
	//p += d / 2.;
	vec3 q = p * scale;
	q.y -= 1./3.;
	q.z += 2./3.;
	//q += d / 2.;
	//q = mod(q, d) - d / 2.;
	//return sdSphere(q, 1.) / scale;
	float d1 = sdMenger(q, 3., 1.)/scale;
	float d2 =  sdBox(p, vec3(.05));
	return d1;
}

vec3 genNormal(vec3 p){
	vec2 d = vec2(0.001, 0.);
	return normalize(vec3(
		map(p + d.xyy) - map(p + d.xyy),
		map(p + d.yxy) - map(p + d.yxy),
		map(p + d.yyx) - map(p + d.yyx)
		));
}

void main( void ) {
	float move = fract(time * .25);
	float scale = mix(1., 1. / 3., pow(move, 20.));

	vec2 p = ( gl_FragCoord.xy * 2. - resolution.xy ) / min(resolution.x, resolution.y);

	vec3 color = vec3(0.0);
	//color.xy = p;

	vec3 posA = vec3(0., 0., -1.- 2./3.);
	vec3 posB = vec3(0., 0., 0.);
	vec3 cPos = mix(posA, posB, pow(move, .7)) + mix(vec3(0., 1./3., 0.), vec3(0.), pow(move, 10.));
	//cPos = vec3(0., 0., -3.);
	vec3 t = vec3(0., 0., 1.);

	vec3 fwdA = vec3(0., 0., 1.);
	vec3 fwdB = vec3(0., -1., 0.);
	vec3 fwd = mix(fwdA, fwdB, move);//normalize(t - cPos);//normalize(vec3(0., 0., 1.));
	//fwd = vec3(0., 0., 1.);
	vec3 upA = vec3(0., 1., 0.);
	vec3 upB = vec3(0., 0., 1.);
	vec3 up = mix(upA, upB, move);
	vec3 side = normalize(cross(up, fwd));
	up = normalize(cross(fwd, side));
	vec3 rd = normalize(p.x * side + p.y * up + fwd * (1. + .2 * (1. - dot(p, p))));

	float dd, d;
	int k;

	for(int i = 0; i < 100; i++){
		dd = map(cPos + d * rd);
		if(dd < 0.001){
			//color += 1.;
			break;
		}
		k = i;
		d += dd;
	}

	if(dd < 0.001){
		vec3 ip = cPos + d * rd;
		vec3 normal = genNormal(ip);

		float ao = 1. - pow((float(k) + dd / 0.001) / 100., .4);

		color += ao;
	}else{
		color += vec3(.3);
	}


	gl_FragColor = vec4(color, 1.0 );
}`
