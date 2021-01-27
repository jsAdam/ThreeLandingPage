import * as THREE from "./build/three.module.js";
import { EffectComposer } from "./jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./jsm/postprocessing/UnrealBloomPass.js";

let canvas = document.querySelector("#myCanvas");

let renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

let scene = new THREE.Scene();

let WIDTH = canvas.offsetWidth;
let HEIGHT = canvas.offsetHeight;
let OBJECTS = [];
let tetrahedrons = [];

let camera = new THREE.PerspectiveCamera(65, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
camera.position.set(0.0, 0.0, 5);

var renderScene = new RenderPass( scene, camera );

var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 ); //1.0, 9, 0.5, 512);
bloomPass.renderToScreen = true;
bloomPass.threshold = 0.8;
bloomPass.strength = 1.5;
bloomPass.radius = 0.4;

let composer = new EffectComposer( renderer );
composer.setSize( window.innerWidth, window.innerHeight );
composer.addPass( renderScene );
composer.addPass( bloomPass );

let shaderMaterial = new THREE.ShaderMaterial({
		vertexShader:   document.querySelector('#vertexshader').textContent,
		fragmentShader: document.querySelector('#fragmentshader').textContent
	});
let sphere = new THREE.Mesh(
	   new THREE.SphereGeometry(1, 16, 16),
	   shaderMaterial);

	// add the sphere and camera to the scene
//scene.add(sphere);

class Tetrahedron {
    constructor(x, y, z, a) {
        // Mesh Creation
        let texture = new THREE.TextureLoader().load("assets/diffusion.png");
        
        let envMap = new THREE.CubeTextureLoader().setPath("assets/cubemap/").load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
        
        this.material = new THREE.MeshPhysicalMaterial({map: texture, envMap, metalness: 1.0, roughness: 0.0});
        this.geometry = new THREE.TetrahedronBufferGeometry(2, 0);
        
        this.centerPos = new THREE.Vector3(x, y, z);
        
        this.activePieceDist = 1;
        this.deactivePieceDist = 0.75;
        
        this.topMesh = new THREE.Mesh(this.geometry, this.material);
        this.topMesh.position.set(this.centerPos.x, this.centerPos.y + this.deactivePieceDist, this.centerPos.z);
        this.topMesh.rotation.x = Math.PI;
        
        this.bottomMesh = new THREE.Mesh(this.geometry, this.material);
        this.bottomMesh.rotation.y = Math.PI/4;
        this.bottomMesh.rotation.x = Math.PI/3.3;
        this.bottomMesh.updateMatrix();
        this.bottomMesh.geometry.applyMatrix(this.bottomMesh.matrix);
        
        this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - this.deactivePieceDist, this.centerPos.z);
        this.bottomMesh.rotation.set( 0, 0, 0 );
        this.bottomMesh.scale.set( 1, 1, 1 );
        
        let material = new THREE.MeshPhongMaterial({color: 0xFF0000, visible: false});
        let geometry = new THREE.BoxGeometry(3, 5, 3);
        this.collisionMesh = new THREE.Mesh(geometry, material);
        this.collisionMesh.position.set(this.centerPos.x, this.centerPos.y, this.centerPos.z);
        
        addToScene(this.topMesh);
        addToScene(this.bottomMesh);
        addToScene(this.collisionMesh, true);
        
        //let o = new Orb(0, 0, 0);
        
        let pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(this.topMesh);
        pivot.add(this.bottomMesh);
        pivot.add(this.collisionMesh);
        
        this.orbs = [];
        this.orbs.push(new Orb(x, y, z, this.centerPos, 0.15));
        for(let i = 0; i < 50; i++) {
            let xValue = random(-1.2, 1.2);
            let zValue = random(-1.2, 1.2);
            let yValue = random(-0.1, 0.1);
            let r = random(0.01, 0.03);
            
            let orb = new Orb(x + xValue, y + yValue, z + zValue, this.centerPos, r);
            
            this.orbs.push(orb);
        }
        for(let orb of this.orbs) {
            pivot.add(orb.mesh);
            orb.mesh.visible = false;
        }
        
        console.log(a);
        pivot.rotation.z = a || 0;
        
        // Class variables
        this.active = false;
        
        this.animatingActivation= false;
        this.animatingDeactivation = false;
        this.animationDuration = 2000;
        this.animationStartTime = 1000;
        
        this.activeRotationSpeed = 0.08;
        this.deactiveRotationSpeed = 0.01;
        this.rotationSpeed = 0.01;
        
        this.mouseInside = false;
    }
    
    deactivate() {
        this.animationStartTime = millis();
        this.animatingDeactivation = true;
    }
    
    activate() {
        this.animationStartTime = millis();
        this.animatingActivation = true;
        for(let orb of this.orbs) {
            orb.mesh.visible = true;
        }
    }
    
    update() {
        if(this.animatingActivation) {
            let time = (this.animationStartTime + this.animationDuration) - millis();
            
            let pieceDist = map(time, this.animationDuration, 0, this.deactivePieceDist, this.activePieceDist);
            this.topMesh.position.set(this.centerPos.x, this.centerPos.y + pieceDist, this.centerPos.z);
            this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - pieceDist, this.centerPos.z);
            
            let scale = map(time, this.animationDuration, 0, 0, 1);
            for(let orb of this.orbs) {
                orb.mesh.scale.set(scale, scale, scale);
            }
            
            this.rotationSpeed = map(time, this.animationDuration, 0, this.deactiveRotationSpeed, this.activeRotationSpeed);
            
            if(millis() > this.animationStartTime + this.animationDuration) {
                this.animatingActivation = false;
                this.active = true;
            }   
        }
        if(this.animatingDeactivation) {
            let time = (this.animationStartTime + this.animationDuration) - millis();
            
            let pieceDist = map(time, this.animationDuration, 0, this.activePieceDist, this.deactivePieceDist);
            this.topMesh.position.set(this.centerPos.x, this.centerPos.y + pieceDist, this.centerPos.z);
            this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - pieceDist, this.centerPos.z);
            
            let scale = map(time, this.animationDuration, 0, 1, 0);
            for(let orb of this.orbs) {
                orb.mesh.scale.set(scale, scale, scale);
            }
            
            this.rotationSpeed = map(time, this.animationDuration, 0, this.activeRotationSpeed, this.deactiveRotationSpeed);
            
            if(millis() > this.animationStartTime + this.animationDuration) {
                for(let orb of this.orbs) {
                    orb.mesh.visible = false;
                }
                this.animatingDeactivation = false;
                this.active = false;
            }   
        }
        
        for(let orb of this.orbs) {
            orb.update();
        }
        
        this.topMesh.rotation.y += this.rotationSpeed;
        this.bottomMesh.rotation.y += this.rotationSpeed;
    }
}

class Orb {
    constructor(x, y, z, center, size) {
        this.size = size;
        let geometry = new THREE.SphereBufferGeometry(size, 16, 16);
        let material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, reflectivity: 1.0, emissive: 0xFFFFFF});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
        
        this.angle = 0;
        
        this.center = center;
        console.log(center);
        let d = center.distanceTo(this.mesh.position);
        this.distanceToCenter = d;
        this.radians = Math.random() * Math.PI * 2;
        this.radians2 = 0;
        
        this.cw = Math.random() > 0.5 ? true : false;
    }
    
    update() {
        
        //this.mesh.rotation.y += 0.01;
        
        if(this.cw) {
            this.radians+=.005; 
            //this.radians2+=.005;
        } else {
            this.radians-=.005; 
            //this.radians2-=.005;
        }
        
        this.mesh.position.x = this.center.x + (Math.cos(this.radians) * this.distanceToCenter);
        this.mesh.position.z = this.center.z + (Math.sin(this.radians) * this.distanceToCenter);
    }
}

//let o = new Orb(0, 0, 0);
let t1= new Tetrahedron(0, 0, -3);
tetrahedrons.push(t1);
tetrahedrons.push(new Tetrahedron(-12, -2, -10,-0.2));
tetrahedrons.push(new Tetrahedron(12, -4, -13, 0.4));

let CLOCK = new THREE.Clock();
CLOCK.start();

createGround();

let light = new THREE.SpotLight(0xccddff, 0.3);
light.position.set(0, 0, 5);
scene.add(light);

function millis() {
    return Math.floor(CLOCK.getElapsedTime() * 1000);
}

let draw = function() {
    resizeRendererToDisplaySize();
    
    for(let t of tetrahedrons) {
        t.update();
    }
    
    //renderer.render(scene, camera);
    composer.render();
    requestAnimationFrame(draw);
}
draw();

document.addEventListener("mousemove", onDocumentMouseDown);
function onDocumentMouseDown(event) {
    event.preventDefault();
    let canvasRect = canvas.getBoundingClientRect();
    let mouse3D = new THREE.Vector3(
        ((event.clientX - canvasRect.left) / WIDTH ) * 2 - 1,
        -((event.clientY - canvasRect.top) / HEIGHT ) * 2 + 1,
        0.5 
    );
    let raycaster = new THREE.Raycaster();
    
    raycaster.setFromCamera(mouse3D, camera);
    let intersects = raycaster.intersectObjects(OBJECTS);
    
    for(let t of tetrahedrons) {
        if(intersects.length > 0 && (intersects[0].object == t.collisionMesh)) {
            if(!t.active && !t.animatingActivation) {
                t.activate();
            }
        } else {
            if(t.active && !t.animatingDeactivation) {
                t.deactivate();
            }
        }
    }
    
}

function resizeRendererToDisplaySize() {
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
    
    WIDTH = canvas.offsetWidth;
    HEIGHT = canvas.offsetHeight;
    
    composer.setSize(canvas.offsetWidth, canvas.offsetHeight );
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight );
}

function addToScene(mesh, collide = false) {
    if(collide) {
        OBJECTS.push(mesh);
    }
    scene.add(mesh);
}

function createGround() {
    let texture = new THREE.TextureLoader().load("./assets/ground.png");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    
    let material = new THREE.MeshPhysicalMaterial({map: texture, bumpMap: texture});
    
    let geometry = new THREE.PlaneBufferGeometry(100, 100);
    let ground = new THREE.Mesh(geometry, material);
    ground.rotation.z = -Math.PI/4;
    ground.rotation.x = -Math.PI/2;
    ground.position.y = -3.0;
    scene.add(ground);
}

function map(num, in_min, in_max, out_min, out_max){
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function random(min, max) { // min and max included 
  let rand = Math.random();
    if (min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    return rand * (max - min) + min;
}