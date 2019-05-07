varying float noise;
varying vec3 norm;
varying vec3 pos;

float getRand(float x)
{
	return fract(cos(x*89.42)*343.42);
}

vec3 getRandVec(vec3 src)
{
	return vec3(getRand(src.x*23.62 - 300.0 + src.y*34.35 - src.z*62.92), 
		getRand(src.x*45.13 + 256.0 + src.y*38.89 + src.z*15.32), 
		getRand(src.x*57.11 - 938.0 + src.y*64.34 + src.z*49.65));
}

float worley(float x, float y, float z)
{
	float minDist = 100.0;

	float scale = 0.2;
	vec3 thisPos = vec3(x / scale, y / scale, z / scale);

	for(int i = -1; i <= 1; i++)
	{
		for(int j = -1; j <= 1; j++)
		{
			for(int k = -1; k <= 1; k++)
			{
				vec3 cell = vec3(floor(thisPos[0]) + float(i), floor(thisPos[1]) + float(j), floor(thisPos[2]) + float(k));
				vec3 rand = cell + 0.4*getRandVec(cell);
				float thisDist = distance(thisPos, rand);
				if(thisDist < minDist) { minDist = thisDist; }
			}
		}	
	}

	return minDist;
}

void main() {

  //all the colors that might be used in the wing
  vec3 col = vec3(149.0/255.0, 255.0/255.0, 27.0/255.0);
  //vec3 col = vec3(255.0/255.0, 255.0/255.0, 255.0/255.0);

  //lambertian shading calculation
  vec3 lightDir = normalize(vec3(0.0, 5.0, -10.0) - pos);
  vec3 lightDir2 = normalize(vec3(-10.0, 0.0, 10.0) - pos);
  vec3 lightDir3 = normalize(vec3(10.0, 0.0, 10.0) - pos);
  vec3 n = normalize(norm);
  float lambert = (clamp(dot(n, lightDir), 0.0, 1.0) +
  		2.0*clamp(dot(n, lightDir2), 0.0, 1.0) +
  		1.25*clamp(dot(n, lightDir3), 0.0, 1.0))/3.0;

  vec3 color = lambert*col;

  float w = worley(pos[0], pos[1], pos[2]);
  if(w < 0.2)
  {
  	  color =  lambert*vec3(0.5);
  	  if(w < 0.1)
	  {
	  	color =  lambert*vec3(1.0, 1.0, 0.0);
	  }
  }

  gl_FragColor = vec4( color.rgb, 1.0 );

}