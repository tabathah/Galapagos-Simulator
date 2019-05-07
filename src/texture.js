const THREE = require('three');

var Coord = function(x, y) {
    return {
        x: x,
        y: y
    }
}

export default class Texture {

	constructor(gridSize, dim) {
		
		this.textureVals = new Array(dim);
		this.elevMap = new Array(gridSize);
		this.createVoronoi(gridSize, dim);
		this.createElevMap(dim);
	}

	createVoronoi(gridSize, dim)
	{
		var centerList = new Array(gridSize*gridSize);
		var idList = new Array(gridSize*gridSize);
		// this.texureVals = new Array(dim*dim);
		var expand = dim/gridSize;
		for(var i = 0; i < gridSize; i++)
		{
			for(var j = 0; j < gridSize; j++)
			{
				centerList[i*gridSize+j] = new Coord(i*Math.random()*expand, j*Math.random()*expand); 
				idList[i*gridSize+j] = Math.random() < 0.5 ? 0 : 1;
			}	
		}

		for(var k = 0; k < dim; k++)
		{
			this.textureVals[k] = new Array(dim);
			for(var m = 0; m < dim; m++)
			{
				var thisCellX = Math.floor(k/expand);
				var thisCellY = Math.floor(m/expand);
				var minDist = dim;
				var val = 0;

				for(var n = Math.max(0, thisCellX-1); n <= Math.min(gridSize-1, thisCellX+1); n++)
				{
					for(var p = Math.max(0, thisCellY-1); p <= Math.min(gridSize-1, thisCellY+1); p++)
					{
						var xDiff = centerList[n*gridSize+p].x - k;
						var yDiff = centerList[n*gridSize+p].y - m;
						var dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
						if (dist < minDist)
						{
							minDist = dist;
							val = idList[n*gridSize+p];
						}
					}
				}
				this.textureVals[k][m] = val;
			}
		}
	}

	getRand(x)
	{
		var z = Math.cos(x*89.42)*343.42;
		return z - Math.floor(z);
	}

	getRandVec(x, y)
	{
		var newX = this.getRand(x*23.62 - 300.0 + y*34.35);
		var newY = this.getRand(x*45.13 + 256.0 + y*38.89);
		return new THREE.Vector2(newX, newY);
	}

	worley(x, y)
	{
		var minDist = 100.0;

		var scale = 40.0;
		var thisPos = new THREE.Vector2(x / scale, y / scale);

		for(var i = -1; i <= 1; i++)
		{
			for(var j = -1; j <= 1; j++)
			{
				var cell = new THREE.Vector2(Math.floor(thisPos[0]) + i, Math.floor(thisPos[1]) + j);
				var rand = this.getRandVec(cell.x, cell.y);
				var pt = new THREE.Vector2(cell.x + rand.x, cell.y + rand.y);
				var thisDist = thisPos.distanceTo(pt);
				if(thisDist < minDist) { minDist = thisDist; }
			}	
		}

		return minDist;
	}

	createElevMap(gridSize)
	{
		for(var k = 0; k < gridSize; k++)
		{
			this.elevMap[k] = new Array(gridSize);
			var x = k - gridSize/2;
			for(var m = 0; m < gridSize; m++)
			{
				var y = m - gridSize/2;

				this.elevMap[k][m] = 4* this.worley(x, y);
			}
		}
	}

}