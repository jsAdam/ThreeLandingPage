// === THREE.js Imports ===
import * as THREE from "./build/three.module.js";
import { EffectComposer } from "./jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "./jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "./jsm/postprocessing/UnrealBloomPass.js";

// === Canvas and Renderer Setup ===
const canvas = document.querySelector("#myCanvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

// === Scene and Camera Setup ===
const scene = new THREE.Scene();
let WIDTH = canvas.offsetWidth;
let HEIGHT = canvas.offsetHeight;

const camera = new THREE.PerspectiveCamera(65, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0.0, 0.0, 5);

// === Post-processing Setup ===
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.renderToScreen = true;
bloomPass.threshold = 0.8;
bloomPass.strength = 1.5;
bloomPass.radius = 0.4;

const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// === Globals ===
const OBJECTS = [];
const tetrahedrons = [];

class Tetrahedron {
    constructor(x, y, z, a) {
        this.initialize();
        
        // Class variables
        this.centerPos = new THREE.Vector3(x, y, z);
        this.activePieceDist = 1;
        this.deactivePieceDist = 0.75;
        this.active = false;
        
        this.animatingActivation= false;
        this.animatingDeactivation = false;
        this.animationDuration = 2000;
        this.animationStartTime = 1000;
        
        this.activeRotationSpeed = 0.08;
        this.deactiveRotationSpeed = 0.01;
        this.rotationSpeed = 0.01;
        
        this.mouseInside = false;

        // Mesh Creation
        this.initializeTopMesh();
        this.initializeBottomMesh();
        this.initializeCollisionMesh();
        
        // Add Meshs To Scene
        addToScene(this.topMesh);
        addToScene(this.bottomMesh);
        addToScene(this.collisionMesh, true);

        // Orb Creation
        this.createOrbs(a);

    }

    initialize() {
        let texture = new THREE.TextureLoader().load("assets/diffusion.png");
        
        let envMap = new THREE.CubeTextureLoader().setPath("assets/cubemap/").load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
        
        this.material = new THREE.MeshPhysicalMaterial({map: texture, envMap, metalness: 1.0, roughness: 0.0});
        this.geometry = new THREE.TetrahedronBufferGeometry(2, 0);
    }

    initializeTopMesh() {
        this.topMesh = new THREE.Mesh(this.geometry, this.material);
        this.topMesh.position.set(this.centerPos.x, this.centerPos.y + this.deactivePieceDist, this.centerPos.z);
        this.topMesh.rotation.x = Math.PI;
    }

    initializeBottomMesh() {
        this.bottomMesh = new THREE.Mesh(this.geometry, this.material);
        this.bottomMesh.rotation.y = Math.PI/4;
        this.bottomMesh.rotation.x = Math.PI/3.3;
        this.bottomMesh.updateMatrix();
        this.bottomMesh.geometry.applyMatrix(this.bottomMesh.matrix);
        
        this.bottomMesh.position.set(this.centerPos.x, this.centerPos.y - this.deactivePieceDist, this.centerPos.z);
        this.bottomMesh.rotation.set( 0, 0, 0 );
        this.bottomMesh.scale.set( 1, 1, 1 );
    }

    
    initializeCollisionMesh() {
        let material = new THREE.MeshPhongMaterial({color: 0xFF0000, visible: false});
        let geometry = new THREE.BoxGeometry(3, 5, 3);
        this.collisionMesh = new THREE.Mesh(geometry, material);
        this.collisionMesh.position.set(this.centerPos.x, this.centerPos.y, this.centerPos.z);
    }

    createOrbs(a) {
        let pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(this.topMesh);
        pivot.add(this.bottomMesh);
        pivot.add(this.collisionMesh);
        
        this.orbs = [];
        this.orbs.push(new Orb(this.centerPos.x, this.centerPos.y, this.centerPos.z, this.centerPos, 0.15));
        for(let i = 0; i < 50; i++) {
            let xValue = random(-1.2, 1.2);
            let zValue = random(-1.2, 1.2);
            let yValue = random(-0.1, 0.1);
            let r = random(0.01, 0.03);
            
            let orb = new Orb(this.centerPos.x + xValue, this.centerPos.y + yValue, this.centerPos.z + zValue, this.centerPos, r);
            
            this.orbs.push(orb);
        }
        for(let orb of this.orbs) {
            pivot.add(orb.mesh);
            orb.mesh.visible = false;
        }
        
        pivot.rotation.z = a || 0;
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

    animateActivaction() {
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

    animateDeactivation() {
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
    
    update() {
        if(this.animatingActivation) {
            this.animateActivaction();
        }

        if(this.animatingDeactivation) {
            this.animateDeactivation();
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
        this.createMesh(x, y, z, size);

        this.angle = 0;
        this.rotationSpeed = 0.005;
        
        this.center = center;
        let d = center.distanceTo(this.mesh.position);
        this.distanceToCenter = d;
        this.radians = Math.random() * Math.PI * 2;
        this.radians2 = 0;
        
        this.cw = Math.random() > 0.5 ? true : false;
    }
    
    createMesh(x, y, z, size) {
        let geometry = new THREE.SphereBufferGeometry(size, 16, 16);
        let material = new THREE.MeshPhongMaterial({color: 0xFFFFFF, reflectivity: 1.0, emissive: 0xFFFFFF});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(x, y, z);
        scene.add(this.mesh);
    }

    update() {
        if(this.cw) {
            this.radians+=this.rotationSpeed; 
        } else {
            this.radians-=this.rotationSpeed; 
        }
        
        this.mesh.position.x = this.center.x + (Math.cos(this.radians) * this.distanceToCenter);
        this.mesh.position.z = this.center.z + (Math.sin(this.radians) * this.distanceToCenter);
    }
}

// Create tetrahedrons
tetrahedrons.push(new Tetrahedron(0, 0, -3));
tetrahedrons.push(new Tetrahedron(-12, -2, -10, -0.2));
tetrahedrons.push(new Tetrahedron(12, -4, -13, 0.4));

// Initialize clock
const clock = new THREE.Clock();
clock.start();

// Create ground and light
createGround();
createLight();

// Main render loop
function draw() {
  resizeRendererToDisplaySize();

  for (const t of tetrahedrons) {
    t.update();
  }

  composer.render();
  requestAnimationFrame(draw);
}
draw();

// Event listener for mouse interaction
document.addEventListener("mousemove", handleMouseMove);

function handleMouseMove(event) {
  event.preventDefault();

  const canvasRect = canvas.getBoundingClientRect();
  const mouse3D = new THREE.Vector3(
    ((event.clientX - canvasRect.left) / WIDTH) * 2 - 1,
    -((event.clientY - canvasRect.top) / HEIGHT) * 2 + 1,
    0.5
  );

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse3D, camera);

  const intersects = raycaster.intersectObjects(OBJECTS);

  for (const t of tetrahedrons) {
    const intersected = intersects.length > 0 && intersects[0].object === t.collisionMesh;

    if (intersected && !t.active && !t.animatingActivation) {
      t.activate();
    } else if (!intersected && t.active && !t.animatingDeactivation) {
      t.deactivate();
    }
  }
}

// Utility functions

function resizeRendererToDisplaySize() {
  WIDTH = canvas.offsetWidth;
  HEIGHT = canvas.offsetHeight;

  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();

  renderer.setSize(WIDTH, HEIGHT);
  composer.setSize(WIDTH, HEIGHT);
}

function createGround() {
  const texture = new THREE.TextureLoader().load("./assets/ground.png");
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);

  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    bumpMap: texture
  });

  const geometry = new THREE.PlaneBufferGeometry(100, 100);
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.set(-Math.PI / 2, 0, -Math.PI / 4);
  ground.position.y = -3.0;

  scene.add(ground);
}

function createLight() {
  const light = new THREE.SpotLight(0xccddff, 0.3);
  light.position.set(0, 0, 5);
  scene.add(light);
}

function addToScene(mesh, collide = false) {
  if (collide) OBJECTS.push(mesh);
  scene.add(mesh);
}

function millis() {
  return Math.floor(clock.getElapsedTime() * 1000);
}

function map(num, inMin, inMax, outMin, outMax) {
  return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function random(min, max) {
  if (min > max) [min, max] = [max, min];
  return Math.random() * (max - min) + min;
}
