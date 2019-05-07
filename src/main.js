
const THREE = require('three'); // older modules are imported like this. You shouldn't have to worry about this much
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
import Framework from './framework'
import Lsystem, {LinkedListToString} from './lsystem.js'
import Turtle from './turtle.js'
import Texture from './texture.js'
import Agents from './agents.js'

var scene;
var numCacti = 60;
var lsys;
var turtles = new Array(numCacti);
var numAgents = 50;
var agents;
var tortGeo;
var time = 0;
var numGone = 0;
var tex = new Texture(5, 200);
var numShrubs = 500;
var speed = 20;
var ready1 = false;
var ready2 = false;
var ready3 = false;

var barkObj;
var fruitObj;

var extra = {
    showTexture: false
};

export function Cactus(pos, id)
{
    this.pos = pos;
    this.edibility = 1.0;
    this.life = 5.0;
    this.id = id;
}

export function Shrub(pos)
{
    this.pos = pos;
    this.life = 2.0;
}

var cactiList = new Array(numCacti);
var shrubList = new Array(numShrubs);

// called after the scene loads
function onLoad(framework) {
    scene = framework.scene;
    var camera = framework.camera;
    var renderer = framework.renderer;
    var gui = framework.gui;
    var stats = framework.stats;

    // initialize a simple box and material
    var geometry = new THREE.PlaneGeometry(200, 200, 200, 200);

    //initialize the material for terrain
    var terrainMat = new THREE.ShaderMaterial({
        uniforms: {
        },
        vertexShader: require('./shaders/terr-vert.glsl'),
        fragmentShader: require('./shaders/terr-frag.glsl')
      });

    var plane = new THREE.Mesh( geometry, terrainMat );
    plane.rotation.set(-3.1415/2.0, 0, 0);
    scene.add( plane );
    var directionalLight = new THREE.PointLight( 0xffffff, 1 );
    directionalLight.color.setHSL(0.1, 1, 0.95);
    directionalLight.position.set(1, 3, 2);
    directionalLight.position.multiplyScalar(10);
    scene.add(directionalLight);

    // set camera position
    camera.position.set(0, 20, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene.background = new THREE.Color(0xa8ecff);

    time = 0;

    // initialize LSystem and a Turtle to draw
    lsys = new Lsystem();
    turtles = new Array(numCacti);

    var objLoader = new THREE.OBJLoader();
    objLoader.load('cactusFruit2.obj', function(obj){
        var fruitGeo =  obj.children[0].geometry;
        fruitObj = fruitGeo;

        objLoader.load('cactusBark2.obj', function(obj2){
            var barkGeo =  obj2.children[0].geometry;
            barkObj = barkGeo;

            for(var t = 0; t < numCacti; t++)
            {
                var pos = getPosition(tex);
                var turt = new Turtle(scene, barkGeo, fruitGeo, pos, t);
                turtles[t] = turt;
                cactiList[t] = new Cactus(pos, t);
            }

            doLsystem(lsys, lsys.iterations, turtles, cactiList);

            ready1 = true;
        });
    });

    //var tortMaterial = new THREE.MeshLambertMaterial( {color: 0x6b605b, side: THREE.DoubleSide} );
    agents = new Agents(numAgents, tex.textureVals, cactiList, shrubList);
    var tortMaterial = new THREE.ShaderMaterial({
        vertexShader: require('./shaders/turt-vert.glsl'),
        fragmentShader: require('./shaders/turt-frag.glsl')
      });
    agents = new Agents(numAgents, tex.textureVals, cactiList, shrubList);
    var aList = agents.getAgents();

    objLoader.load('lowPolyTortoise.obj', function(obj){

      // LOOK: This function runs after the obj has finished loading
      var tortGeo =  obj.children[0].geometry;
      tortGeo.scale(4,4,4);

      for(var i = 0; i < numAgents; i++)
      {
          var tort = new THREE.Mesh(tortGeo, tortMaterial);
          tort.position.set(aList[i].pos.x, aList[i].pos.y, aList[i].pos.z);
          tort.name = "agent" + i; //used in onUpdate
          scene.add(tort);
      }

      ready2 = true;
    });

    var shrubMaterial = new THREE.MeshLambertMaterial( { color: 0x1dc400, side: THREE.DoubleSide });
    objLoader.load('shrubPoly.obj', function(obj){

      var shrubGeo =  obj.children[0].geometry;

      for(var s = 0; s < numShrubs; s++)
      {
          var pos = getPosition(tex);
          shrubList[s] = new Shrub(pos);

          var rad = Math.random()*3.0 + 0.5;
          var ang = Math.random()*180.0;
          var shrub = new THREE.Mesh( shrubGeo, shrubMaterial );
          shrub.name = "shrub " + s;
          shrub.position.set(pos.x, pos.y, pos.z);
          shrub.scale.set(rad, rad, rad);
          shrub.rotation.set(0, ang, 0);
          scene.add(shrub);
      }

      ready3 = true;
    });
    
    var options = {
        speed: 20
    }
    gui.add(options, 'speed', 1, 20).onChange(function(newVal) {
        speed = Math.floor(newVal);
    });

    gui.add(extra, 'showTexture').onChange(function(newVal) {
      if(newVal)
      {
          console.log(tex.elevMap);
          showVoronoi(tex.elevMap, scene);
      }
      else
      {
          clearMarks(scene);
      }
    });
}

function showVoronoi(texVals, scene)
{
    var mat0 = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
    var mat1 = new THREE.MeshBasicMaterial( {color: 0xff0000, side: THREE.DoubleSide} );
    for(var i = 0; i < texVals.length; i+=4)
    {
        for(var j = 0; j < texVals.length; j+=4)
        {
            var geom = new THREE.PlaneGeometry(1, 1);
            var mark = new THREE.Mesh( geom, texVals[i][j] == 0 ? mat0 : mat1);
            mark.position.set(i-100, texVals[i][j], j-100);
            mark.rotation.set(-3.1415/2.0, 0, 0);
            mark.name = "mark" + i + j; //used in onUpdate
            scene.add(mark);
        }       
    }
}

function clearMarks(scene) {
  var obj;
  for( var i = scene.children.length - 1; i > 2; i--) {
      if(scene.children[i].name.substring(0, 4) == "mark")
      {
          obj = scene.children[i];
          scene.remove(obj);
      }
  }
}


// clears the scene by removing all geometries added by turtle.js
function clearScene(scene) {
  var obj;
  for( var i = scene.children.length - 1; i > 2; i--) {
      if(scene.children[i].name.substring(0, 5) != "agent" &&
        scene.children[i].name.substring(0, 4) != "mark" &&
        scene.children[i].name.substring(0, 5) != "shrub")
      {
          obj = scene.children[i];
          scene.remove(obj);
      }
  }
}

function doLsystem(lsystem, iterations, turtles, cacti) {
    for(var t = 0; t < numCacti; t++)
    {
        var result = lsystem.doIterations(iterations);
        var turt = turtles[t];
        turt.clear();
        turt.renderSymbols(result);
        var cac = cacti[t];
        cac.edibility = 1.0/(turt.numTrunk+1);
        cac.life = 5.0;
    }
}

function getPosition(tex) {
    var x = Math.random()*200;
    var z = Math.random()*200;
    while(tex.textureVals[Math.floor(x)][Math.floor(z)] != 1)
    {
        x = Math.random()*200;
        z = Math.random()*200;
    }
    var pos = new THREE.Vector3(x-100, 1.0, z-100);
    return pos;
}

function addNewCacti(lsystem, iterations, turtles, cacti, tex)
{
    var total = 0;
    var count = 0;
    for(var t = 0; t < numCacti; t++)
    {
        var cac = cacti[t];
        if(cac.life > 0)
        {
            total += cac.edibility;
            count += 1;
        }
    }
    var newVal = total/count;
    lsys.endBarkProb = newVal;

    for(var t = 0; t < numCacti; t++)
    {
        var cac = cacti[t];
        if(cac.life <= 0)
        {
            var result = lsystem.doIterations(iterations);
            var pos = getPosition(tex);
            var turt = new Turtle(scene, barkObj, fruitObj, pos, t);
            turtles[t] = turt;
            cacti[t] = new Cactus(pos, t);

            turt.renderSymbols(result);
            
            cac.edibility = 1.0/(turt.numTrunk+1);
            cac.life = 5.0;
        }
    }
}

// called on frame updates
function onUpdate(framework) {
    if(time%speed == 1 && ready1 && ready2 && ready3)
    {
        //console.log(framework.scene);
        agents.updateAgents();
        var aList = agents.getAgents();
        for(var i = 0; i < numAgents; i++)
        {
            var ag = framework.scene.getObjectByName("agent" + i);
            ag.rotation.set(0, -1.0*Math.acos(aList[i].vel.z), 0);
            ag.position.set(aList[i].pos.x, aList[i].pos.y, aList[i].pos.z);
        }
    }
    if(time != 0 && ready1 && ready2 && ready3)
    {
        for(var j = 0; j < numCacti; j++)
        {
            if(cactiList[j].life == 0)
            {
                var cacID = cactiList[j].id;
                console.log("cactus " + cacID + " dead!");
                for( var i = scene.children.length - 1; i > 2; i--) {
                    var n = scene.children[i].name;
                    if(n.substring(0, 4) == "geom" && 
                      n.substring(n.length-1) == cacID.toString())
                    {
                        var obj = scene.children[i];
                        scene.remove(obj);
                    }
                }
                numGone += 1;
            }
        }
        for(var k = 0; k < numShrubs; k++)
        {
            if(shrubList[k].life == 0)
            {
                var check = "shrub " + k;
                for( var i = scene.children.length - 1; i > 2; i--) {
                    var n = scene.children[i].name;
                    if(n == check)
                    {
                        var obj = scene.children[i];
                        scene.remove(obj);
                    }
                }
            }
        }
    }
    if(numGone > 0)
    {
        addNewCacti(lsys, lsys.iterations, turtles, cactiList, tex);
        numGone = 0;
    }
  
    time++;
}

// when the scene is done initializing, it will call onLoad, then on frame updates, call onUpdate
Framework.init(onLoad, onUpdate);
