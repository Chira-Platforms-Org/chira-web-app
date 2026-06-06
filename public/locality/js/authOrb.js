import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import * as BufferGeometryUtils from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/utils/BufferGeometryUtils.js';

const mount = document.getElementById('authOrbCanvas');

if (mount) {
  initAuthOrb(mount);
}

function initAuthOrb(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    34,
    Math.max(container.clientWidth, 320) / Math.max(container.clientHeight, 320),
    1,
    1000
  );

  camera.position.z = 330;
  camera.position.y = 0;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const radius = 86;
  let geometry = new THREE.SphereGeometry(radius, 120, 82);

  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry = BufferGeometryUtils.mergeVertices(geometry);

  const positionAttr = geometry.getAttribute('position');
  const positions = Float32Array.from(positionAttr.array);
  const basePositions = Float32Array.from(positionAttr.array);

  const colors = new Float32Array(positionAttr.count * 3);
  const sizes = new Float32Array(positionAttr.count);

  const bright = new THREE.Color('#b7ffb9');
  const green = new THREE.Color('#19e35a');
  const deep = new THREE.Color('#05bf46');
  const dark = new THREE.Color('#04953a');

  const vertex = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const depthT = (vertex.z + radius) / (radius * 2);

    tempColor.copy(dark)
      .lerp(deep, 0.48)
      .lerp(green, 0.55)
      .lerp(bright, verticalT * 0.52)
      .offsetHSL(0, 0, depthT * 0.04);

    colors[i * 3 + 0] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;

    sizes[i] = 4.8 + Math.random() * 2.2;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('ca', new THREE.Float32BufferAttribute(colors, 3));

  const pointTexture = createGlowTexture();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: pointTexture }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 ca;
      varying vec3 vColor;

      void main() {
        vColor = ca;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (255.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform sampler2D pointTexture;
      varying vec3 vColor;

      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);

        if (tex.a < 0.03) discard;

        vec3 finalColor = color * vColor;
        gl_FragColor = vec4(finalColor, tex.a) * tex;
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const orb = new THREE.Points(geometry, material);

  const group = new THREE.Group();
  group.add(orb);
  group.position.y = 0;
  group.scale.setScalar(1.28);
  scene.add(group);

  const sizeArray = geometry.attributes.size.array;
  const positionArray = geometry.attributes.position.array;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    group.rotation.y = time * 0.28;
    group.rotation.x = Math.sin(time * 0.45) * 0.10;
    group.rotation.z = Math.sin(time * 0.22) * 0.05;
    group.position.y = Math.sin(time * 0.65) * 3;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;

      const x = basePositions[ix + 0];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];

      const waveA = Math.sin(time * 1.05 + x * 0.03 + y * 0.022) * 0.028;
      const waveB = Math.cos(time * 0.84 + z * 0.024 - x * 0.016) * 0.022;
      const waveC = Math.sin(time * 0.64 + y * 0.018 - z * 0.014) * 0.015;

      const scale = 1.0 + waveA + waveB + waveC;

      positionArray[ix + 0] = x * scale;
      positionArray[ix + 1] = y * scale;
      positionArray[ix + 2] = z * scale;

      sizeArray[i] = 4.6 + 2.2 * (0.5 + 0.5 * Math.sin(time * 1.6 + i * 0.026));
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resize() {
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 320);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(animate);
}

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0.0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.16, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.38, 'rgba(255,255,255,0.74)');
  gradient.addColorStop(0.66, 'rgba(255,255,255,0.22)');
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
