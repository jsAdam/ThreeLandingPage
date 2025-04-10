import { scene } from '../scene';
import { OBJECTS } from './constants';

export function millis() {
    return Math.floor(performance.now());
  }
  
export function map(num, inMin, inMax, outMin, outMax) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export function random(min, max) {
    if (min > max) [min, max] = [max, min];
    return Math.random() * (max - min) + min;
}

export function addToScene(mesh, collide = false) {
    if (collide) OBJECTS.push(mesh);
    scene.add(mesh);
}
