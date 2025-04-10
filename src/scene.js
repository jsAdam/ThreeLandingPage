import * as THREE from 'three';

// === Scene and Camera Setup ===
export const canvas = document.querySelector("#myCanvas");
export const scene = new THREE.Scene();

let WIDTH = canvas.offsetWidth;
let HEIGHT = canvas.offsetHeight;

export const camera = new THREE.PerspectiveCamera(65, WIDTH / HEIGHT, 0.1, 1000);
camera.position.set(0.0, 0.0, 5);