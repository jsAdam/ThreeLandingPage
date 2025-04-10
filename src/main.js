import * as THREE from 'three';
import { resizeRendererToDisplaySize, composer } from './renderer';
import { createGround, createLight } from './environment';
import { tetrahedrons } from './objects/tetrahedrons';
import { handleMouseMove } from './input';

// Initialize clock
const clock = new THREE.Clock();
clock.start();

// Create ground and light
createGround();
createLight();

// Main render loop
function draw() {
  resizeRendererToDisplaySize();
  for (const t of tetrahedrons) t.update();
  composer.render();
  requestAnimationFrame(draw);
}

draw();
// Event listener for mouse interaction
document.addEventListener("mousemove", handleMouseMove);
