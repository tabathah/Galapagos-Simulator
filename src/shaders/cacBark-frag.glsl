varying float noise;
varying vec3 norm;
varying vec3 pos;

void main() {

  //all the colors that might be used in the wing
  vec3 col = vec3(255.0/255.0, 110.0/255.0, 1.0/255.0);
  vec3 col2 = vec3(0.0/255.0, 0.0/255.0, 0.0/255.0);

  //lambertian shading calculation
  vec3 lightDir = normalize(vec3(0.0, 5.0, -10.0) - pos);
  vec3 lightDir2 = normalize(vec3(-10.0, 0.0, 10.0) - pos);
  vec3 lightDir3 = normalize(vec3(10.0, 0.0, 10.0) - pos);
  vec3 n = normalize(norm);
  float lambert = (clamp(dot(n, lightDir), 0.0, 1.0) +
  		2.0*clamp(dot(n, lightDir2), 0.0, 1.0) +
  		1.25*clamp(dot(n, lightDir3), 0.0, 1.0))/3.0;

  vec3 color = col*lambert;

  gl_FragColor = vec4( color.rgb, 1.0 );

}