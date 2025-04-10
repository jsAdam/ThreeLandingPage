import * as THREE from 'three';
import { scene } from '../scene';
import { addToScene, map, millis, random } from '../utils/helpers';

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
export const tetrahedrons = [
    new Tetrahedron(0, 0, -3),
    new Tetrahedron(-12, -2, -10, -0.2),
    new Tetrahedron(12, -4, -13, 0.4)
  ];