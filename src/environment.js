import * as THREE from 'three';
import { scene } from './scene';

export function createGround() {
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

export function createLight() {
  const light = new THREE.SpotLight(0xccddff, 0.3);
  light.position.set(0, 0, 5);
  scene.add(light);
}