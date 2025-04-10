import * as THREE from 'three';
import { canvas } from './scene';
import { camera } from './scene';
import { tetrahedrons } from './objects/tetrahedrons';
import { OBJECTS } from './utils/constants';

export function handleMouseMove(event) {
  event.preventDefault();

  const canvasRect = canvas.getBoundingClientRect();
  const WIDTH = canvas.offsetWidth;
  const HEIGHT = canvas.offsetHeight;

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
