varying float noise;
varying vec3 norm;
varying vec3 pos;

float findNoise(float x, float y, float z)
{
	vec3 v1 = vec3(x, y, z);
	vec3 v2 = vec3(12.9898, 78.233, 46.379);
	float bigNum = sin(dot(v1, v2))*43758.5453;
	if(bigNum < 0.0){ return bigNum - ceil(bigNum); }
	else { return bigNum - floor(bigNum); }
}

//smooths the noise values of a given lattice point by averaging its noise with the 6 surrounding lattice points 
float findSmoothNoise(float x, float y, float z)
{
	float posX = findNoise(x + 1.0, y, z);
	float negX = findNoise(x - 1.0, y, z);
	float posY = findNoise(x, y + 1.0, z);
	float negY = findNoise(x, y - 1.0, z);
	float posZ = findNoise(x, y, z + 1.0);
	float negZ = findNoise(x, y, z - 1.0);
	float point = findNoise(x, y, z);

	//i weighted the noise value of the point itself much higher than the surrounding points so that I didn't lose too much amplitude
	return (posX + negX + posY + negY + posZ + negZ + 10.0*point)/16.0;
}

#define M_PI 3.1415926535897932384626433832795

//cosine interpolates from a to b, where the point is t away from point a
float cosInterpolate(float a, float b, float t)
{
	float newT = (1.0 - cos(t*M_PI))/2.0;
	return (a * (1.0 - newT) + b * newT);
}

//for a given vertex, finds the noise on that vertex by trilinear interpolation of the 8 surrounding lattice points
float findInterpNoise(float x, float y, float z)
{
	float newX = x ;/// 100.0;
	float newY = y ;/// 100.0;

	float lowX = floor(newX);
	float highX = lowX + 1.0;
	float tx = (newX-lowX)/(highX-lowX);

	float lowY = floor(newY);
	float highY = lowY + 1.0;
	float ty = (newY-lowY)/(highY-lowY);

	float lowZ = floor(z);
	float highZ = lowZ + 1.0;
	float tz = (z-lowZ)/(highZ-lowZ);

	float calc1 = cosInterpolate(findSmoothNoise(lowX, highY, highZ), findSmoothNoise(highX, highY, highZ), tx);
	float calc2 = cosInterpolate(findSmoothNoise(lowX, lowY, highZ), findSmoothNoise(highX, lowY, highZ), tx);
	float calc3 = cosInterpolate(calc2, calc1, ty);
	float calc4 = cosInterpolate(findSmoothNoise(lowX, highY, lowZ), findSmoothNoise(highX, highY, lowZ), tx);
	float calc5 = cosInterpolate(findSmoothNoise(lowX, lowY, lowZ), findSmoothNoise(highX, lowY, lowZ), tx);
	float calc6 = cosInterpolate(calc5, calc4, ty);
	float calc7 = cosInterpolate(calc6, calc3, tz);

	return calc7;
}

float sampleOctaves(float x, float y, float z)
{
	float displacement = 0.0;
	float persistence = 1.0;

	float newX = x / 50.0;
	float newY = y / 50.0;
	float newZ = z / 50.0;

	for (float i = 0.0; i < 4.0; i++)
	{
		float freq = pow(2.0, i);
		float ampl = pow(persistence, i);

		//x, y, and z multiplied by frequency so that they sample from a wider range of values for this octave, creating a bumpier result
		displacement += findInterpNoise(freq*newX, freq*newY, freq*newZ) * ampl;
	}

	return displacement;
}

float getRand(float x)
{
	return fract(cos(x*89.42)*343.42);
}

vec2 getRandVec(vec2 src)
{
	return vec2(getRand(src.x*23.62 - 300.0 + src.y*34.35), getRand(src.x*45.13 + 256.0 + src.y*38.89));
}

float worley(float x, float y)
{
	float minDist = 100.0;

	float scale = 40.0;
	vec2 thisPos = vec2(x / scale, y / scale);

	for(int i = -1; i <= 1; i++)
	{
		for(int j = -1; j <= 1; j++)
		{
			vec2 cell = vec2(floor(thisPos[0]) + float(i), floor(thisPos[1]) + float(j));
			vec2 rand = cell + getRandVec(cell);
			float thisDist = distance(thisPos, rand);
			if(thisDist < minDist) { minDist = thisDist; }
		}	
	}

	return minDist;
}

void main() {

	vec3 samplePos = position;

	//finds offset for vertex based on noise value
	float offset = sampleOctaves(samplePos[0], samplePos[1], samplePos[2]);

	offset += 4.0 * worley(samplePos[0], samplePos[1]);

	//so that the offset can affect color in the fragment shader
	noise = offset;
	
	//moves the position by the offset along the vertex's surface normal
	pos = position + offset*normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}