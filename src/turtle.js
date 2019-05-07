const THREE = require('three')

// A class used to encapsulate the state of a turtle at a given moment.
// The Turtle class contains one TurtleState member variable.
// You are free to add features to this state class,
// such as color or whimiscality
var TurtleState = function(pos, dir) {
    return {
        pos: new THREE.Vector3(pos.x, pos.y, pos.z),
        dir: new THREE.Vector3(dir.x, dir.y, dir.z)
    }
}

function LinkedList(first, last)
{
    this.firstNode = first;
    this.lastNode = last;
}

class Node {

  constructor(state, next, prev) 
  {
    // if we want to access these later, we need to bind them to 'this'
    this.next = next;
    this.prev = prev;
    this.state = state;
  }

  getNext() 
  {
    return this.next;
  }

  getPrev() 
  {
    return this.prev;
  }

  getState() 
  {
    return this.state;
  }

  setNext(newNext) 
  {
    this.next = newNext;
    newNext.prev = this;
  }

}
  
export default class Turtle {
    
    constructor(scene, barkObj, fruitObj, pos, id, grammar) {
        this.startPos = pos;
        this.state = new TurtleState(this.startPos, new THREE.Vector3(0,1.0,0));
        this.scene = scene;
        this.yAngleMax = 270.0;
        this.xAngleMax = 90.0;
        this.sHeight = 1.0;
        this.tHeight = 3.0;
        this.sRad = 0.75;
        this.cRad = 1.0;
        // this.width = 0.1;
        this.stateStack = new LinkedList(null, null);
        this.currIter = 1;
        this.nextIter = 1;
        this.id = id;
        this.count = 0;

        this.numTrunk = 0;

        this.barkObj = barkObj;
        this.fruitObj = fruitObj;

        this.barkMaterial = new THREE.ShaderMaterial({
            vertexShader: require('./shaders/cacBark-vert.glsl'),
            fragmentShader: require('./shaders/cacBark-frag.glsl')
        });

        this.fruitMaterial = new THREE.ShaderMaterial({
            vertexShader: require('./shaders/cacFruit-vert.glsl'),
            fragmentShader: require('./shaders/cacFruit-frag.glsl')
        });
        
        if (typeof grammar === "undefined") {
            this.renderGrammar = {
                '+' : this.rotateTurtleX.bind(this, this.xAngleMax),
                '-' : this.rotateTurtleY.bind(this, this.yAngleMax),
                '<' : this.moveForward.bind(this, 0.5),
                'S' : this.makeCylinder.bind(this, this.sHeight, this.sRad, this.currIter, this.nextIter),
                'C' : this.makeSphere.bind(this, this.cRad, this.currIter, this.nextIter),
                '[' : this.startNewState.bind(this, this.stateStack),
                ']' : this.endThisState.bind(this, this.stateStack),
                'T' : this.makeTrunk.bind(this, this.tHeight, this.currIter)
            };
        } else {
            this.renderGrammar = grammar;
        }
    }

    // Resets the turtle's position to the origin
    // and its orientation to the Y axis
    clear() {
        this.state = new TurtleState(this.startPos, new THREE.Vector3(0,1,0));
        this.stateStack.firstNode = null;
        this.stateStack.lastNode = null;        
    }

    printState() {
        console.log(this.state.pos)
        console.log(this.state.dir)
    }

    // Rotate the turtle's _dir_ vector by each of the 
    // Euler angles indicated by the input.
    rotateTurtle(x, y, z) {
        var e = new THREE.Euler(
                x * 3.14/180,
				y * 3.14/180,
				z * 3.14/180);
        console.log(x + ", " + y);
        this.state.dir.applyEuler(e);
        this.state.dir.normalize();
    }

    rotateTurtleX(maxX) {
        var x = Math.random()*maxX;
        var e = new THREE.Euler(x * 3.14/180, 0, 0);
        this.state.dir.applyEuler(e);
        this.state.dir.normalize();
    }

    rotateTurtleY(maxY) {
        var y = Math.random()*maxY;
        var e = new THREE.Euler(0, y * 3.14/180, 0);
        this.state.dir.applyEuler(e);
        this.state.dir.normalize();
    }

    // Translate the turtle along the input vector.
    // Does NOT change the turtle's _dir_ vector
    moveTurtle(x, y, z) {
	    var new_vec = THREE.Vector3(x, y, z);
	    this.state.pos.add(new_vec);
    };

    // Translate the turtle along its _dir_ vector by the distance indicated
    moveForward(dist) {
        var currDir = new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z);
        var newVec = currDir.multiplyScalar(dist);
        this.state.pos.add(newVec);
    };
    
    // Make a cylinder of given length and width starting at turtle pos
    // Moves turtle pos ahead to end of the new cylinder
    makeCylinder(iter, sHeight, sRad, nextIter) {
        var geometry = new THREE.CylinderGeometry(this.sRad, this.sRad, this.sHeight, 16);
        //var material = new THREE.MeshLambertMaterial( { color: 0x628E00, side: THREE.DoubleSide });
        var cylinder = new THREE.Mesh( geometry, this.fruitMaterial );

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        cylinder.applyMatrix(mat4);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var currDir = new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z);
        var trans = this.state.pos.add(currDir.multiplyScalar(0.5 * this.sHeight));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        cylinder.applyMatrix(mat5);

        cylinder.name = "geom " + this.count + " " + this.id;
        this.scene.add( cylinder );

        //Scoot the turtle forward by len units
        this.moveForward(this.sHeight/2);
        this.count += 1;
    };

    makeSphere(cRad, iter) {
        var rad = Math.random()*this.cRad + 0.25;
        //var geometry = new THREE.IcosahedronGeometry(rad);
        //var material = new THREE.MeshLambertMaterial( { color: 0x7CE700, side: THREE.DoubleSide });
        var plant = new THREE.Mesh( this.fruitObj, this.fruitMaterial );
        plant.name = "geom " + this.count + " " + this.id;
        this.scene.add( plant );

        var mat3 = new THREE.Matrix4();
        var rand1 = Math.random()+0.5;
        var rand2 = Math.random()+0.35;
        mat3.makeScale(rad*rand1, rad, rad*rand2);
        plant.applyMatrix(mat3);

        //Orient the cylinder to the turtle's current direction
        var quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0,1,0), this.state.dir);
        var mat4 = new THREE.Matrix4();
        mat4.makeRotationFromQuaternion(quat);
        plant.applyMatrix(mat4);

        // var mat6 = new THREE.Matrix4();
        // var rot = 1.57*Math.random() - 0.785;
        // mat6.makeRotationAxis(this.state.dir, rot);
        // plant.applyMatrix(mat6);

        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var currDir = new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z);
        var trans = this.state.pos.add(currDir.multiplyScalar(rad*0.75));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        plant.applyMatrix(mat5);


        //Scoot the turtle forward by len units
        this.moveForward(rad);
        this.count += 1;
    };

    makeTrunk(len, tHeight, iter) {
        //var geometry = new THREE.CylinderGeometry(1.0, 1.0, this.tHeight, 16);
        //var material = new THREE.MeshLambertMaterial( { color: 0xCD5800, side: THREE.DoubleSide });
        var trunk = new THREE.Mesh( this.barkObj, this.barkMaterial );

        var mat3 = new THREE.Matrix4();
        mat3.makeScale(1.0, this.tHeight, 1.0);
        trunk.applyMatrix(mat3);

        var mat6 = new THREE.Matrix4();
        var rot = 6.28*Math.random();
        mat6.makeRotationAxis(new THREE.Vector3(0, 1, 0), rot);
        trunk.applyMatrix(mat6);


        //Move the cylinder so its base rests at the turtle's current position
        var mat5 = new THREE.Matrix4();
        var currDir = new THREE.Vector3(this.state.dir.x, this.state.dir.y, this.state.dir.z);
        var trans = this.state.pos.add(currDir.multiplyScalar(0.5 * this.tHeight));
        mat5.makeTranslation(trans.x, trans.y, trans.z);
        trunk.applyMatrix(mat5);

        trunk.name = "geom " + this.count + " " + this.id;
        this.scene.add( trunk );

        this.moveForward(this.tHeight/2);

        this.numTrunk += 1;
        this.count += 1;
    };

    startNewState(stack) {
        var currState = new TurtleState(this.state.pos, this.state.dir);
        var newNode = new Node(currState, null, null);
        if(stack.lastNode == null)
        {
            stack.firstNode = newNode;
            stack.lastNode = newNode;
        }
        else
        {
            stack.lastNode.setNext(newNode);
            stack.lastNode = newNode;
        }
    };

    endThisState(stack) {
        this.state = stack.lastNode.state;
        if(stack.lastNode.prev == null)
        {
            stack.firstNode = null;
            stack.lastNode = null;
        } 
        else
        {
            stack.lastNode = stack.lastNode.prev;
        }
    };
    
    // Call the function to which the input symbol is bound.
    // Look in the Turtle's constructor for examples of how to bind 
    // functions to grammar symbols.
    renderSymbol(symbolNode) {
        var func = this.renderGrammar[symbolNode.symbol];
        this.currIter = symbolNode.num;
        if(symbolNode.next != null)
        {
            this.nextIter = symbolNode.next.num;
        }      
        if (func) {
            func();
        }
    };

    // Invoke renderSymbol for every node in a linked list of grammar symbols.
    renderSymbols(linkedList) {
        var currentNode;
        for(currentNode = linkedList.firstNode; currentNode != null; currentNode = currentNode.next) {
            this.renderSymbol(currentNode);
        }
    }

    updateHeight(newVal){
        this.height = newVal;
    }

    updateWidth(newVal){
        this.width = newVal;
    }
}