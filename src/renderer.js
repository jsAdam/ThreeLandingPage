import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { scene, camera, canvas } from './scene';

// === Post-processing Setup ===
export const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

export const composer = new EffectComposer(renderer);
composer.setSize(window.innerWidth, window.innerHeight);

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.8;
bloomPass.strength = 1.5;
bloomPass.radius = 0.4;

composer.addPass(renderScene);
composer.addPass(bloomPass);

export function resizeRendererToDisplaySize() {
  const WIDTH = canvas.offsetWidth;
  const HEIGHT = canvas.offsetHeight;

  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
  composer.setSize(WIDTH, HEIGHT);
}

export { canvas };
