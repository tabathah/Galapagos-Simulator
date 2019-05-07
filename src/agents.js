const THREE = require('three')

var AgentState = function(pos, vel) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        vel: new THREE.Vector3(vel.x, vel.y, vel.z)
    }
}

export default class Agents {

	constructor(numAgents, textureMap, targetList, shrubList) {
		
		this.numAgents = numAgents;
		this.agentList = new Array(numAgents);
		this.targets = targetList;
		this.shrubs = shrubList;

		var len = textureMap.length;
		for(var i = 0; i < numAgents; i++)
		{
			var x = Math.random()*len;
			var z = Math.random()*len;
			while(textureMap[Math.floor(x)][Math.floor(z)] != 0)
	        {
	            x = Math.random()*len;
	            z = Math.random()*len;
	        }
			this.agentList[i] = new AgentState(new THREE.Vector3(x-len/2, 3, z-len/2), 
				new THREE.Vector3(0,0,0));
		}
	}

	findWanderVector(idx) {

		var randAngle = Math.random()*2*Math.PI;
		return new THREE.Vector3(Math.cos(randAngle), 0, Math.sin(randAngle));
	}

	findSeparationVector(idx) {

		var sum = [0, 0, 0];
		for(var i = 0; i < this.numAgents; i++)
		{
			if(i != idx)
			{
				sum[0] += this.agentList[i].pos.x - this.agentList[idx].pos.x;
				sum[1] += this.agentList[i].pos.y - this.agentList[idx].pos.y;
				sum[2] += this.agentList[i].pos.z - this.agentList[idx].pos.z;
			}
		}
		return new THREE.Vector3(sum[0]/this.numAgents, sum[1]/this.numAgents, sum[2]/this.numAgents);
	}

	findArrivalVector(idx) {

		var minDist = 1000;
		var minDist2 = 1000;
		var tgt;
		var tgt2;
		for(var i = 0; i < this.targets.length; i++)
		{
			var xTest = this.targets[i].pos.x - this.agentList[idx].pos.x;
			var zTest = this.targets[i].pos.z - this.agentList[idx].pos.z;
			var dist = Math.sqrt(xTest*xTest + zTest*zTest);
			if(Math.random() < this.targets[i].edibility)
			{
				if(dist < minDist)
				{
					minDist = dist;
					tgt = this.targets[i];
				}
			}
			else
			{
				if(minDist <= 2.0)
				{
					this.targets[i].life -= 1;
				}
			}
		}
		for(var j = 0; j < this.shrubs.length; j++)
		{
			var xTest = this.shrubs[j].pos.x - this.agentList[idx].pos.x;
			var zTest = this.shrubs[j].pos.z - this.agentList[idx].pos.z;
			var dist = Math.sqrt(xTest*xTest + zTest*zTest);
			if(dist < minDist2)
			{
				minDist2 = dist;
				tgt2 = this.shrubs[j];
			}
		}
		
		var x2 = tgt2.pos.x - this.agentList[idx].pos.x;
		var y2 = tgt2.pos.y - this.agentList[idx].pos.y;
		var z2 = tgt2.pos.z - this.agentList[idx].pos.z;
		var comp2 = new THREE.Vector3(x2, y2, z2);

		if(minDist == 1000)
		{
			return comp2;
		}

		var x = tgt.pos.x - this.agentList[idx].pos.x;
		var y = tgt.pos.y - this.agentList[idx].pos.y;
		var z = tgt.pos.z - this.agentList[idx].pos.z;
		var comp1 = new THREE.Vector3(x, y, z);

		if(minDist <= 2.0)
		{
			tgt.life -= 1;
		}
		if(minDist2 <= 2.0)
		{
			tgt2.life -= 1;
		}
		var arv = new THREE.Vector3( 
					(comp1.x + 0.5*comp2.x),
					(comp1.y + 0.5*comp2.y),
					(comp1.z + 0.5*comp2.z));
		return arv;
	}

	updateAgents() {

		for(var i = 0; i < this.numAgents; i++)
		{
			if(Math.random() < 0.2)
			{
				var sep = this.findSeparationVector(i).normalize();
				var arv = this.findArrivalVector(i).normalize();
				var wan = this.findWanderVector(i).normalize();
				var total = new THREE.Vector3( 
					(0.6*arv.x + 0.3*sep.x + 0.1*wan.x),
					0.0,
					(0.6*arv.z + 0.3*sep.z + 0.1*wan.z));
				this.agentList[i].pos = new THREE.Vector3(
					this.agentList[i].pos.x + total.x,
					this.agentList[i].pos.y + total.y,
					this.agentList[i].pos.z + total.z);
				this.agentList[i].vel = total.normalize();
			}
		}
	}

	getAgents() {

		return this.agentList;
	}

	getAgentPos() {

		var posList = new Array(numAgents);
		for(var i = 0; i < numAgents; i++)
		{
			posList[i] = this.agentList.pos;
		}
		return posList;
	}

}