varying float noise;
varying vec3 norm;
varying vec3 pos;

void main() {

  //all the colors that might be used in the wing
  vec3 green = vec3(15.0/255.0, 138.0/255.0, 0.0);
  vec3 dirt = vec3(75.0/255.0, 86.0/255.0, 0.0);
  vec3 dark_dirt = vec3(30.0/255.0, 43.0/255.0, 0.0);

  //lambertian shading calculation
  vec3 lightDir = vec3(200.0, 200.0, 200.0) - pos;
  float lambert = clamp(dot(normalize(norm), normalize(lightDir)), 0.5, 1.0);

  float m_noise = noise / 2.0 + 0.5;

  vec3 color = ((1.0-m_noise)*dirt + m_noise*green);
  if(m_noise < 0.0)
  {
  		color = ((1.0+m_noise)*dirt + -1.0*m_noise*dark_dirt);
  }

  gl_FragColor = vec4( color.rgb, 1.0 );

}