import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import * as BufferGeometryUtils from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/utils/BufferGeometryUtils.js';

const mount = document.getElementById('authOrbCanvas');

if (mount) {
  initAuthOrb(mount);
}

function initAuthOrb(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    36,
    container.clientWidth / container.clientHeight,
    1,
    1000
  );

  /* farther back so the sphere is more zoomed out */
  camera.position.z = 360;
  camera.position.y = 0;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  /* denser geometry */
  const radius = 88;
  let geometry = new THREE.SphereGeometry(radius, 120, 78);

  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry = BufferGeometryUtils.mergeVertices(geometry);

  const positionAttr = geometry.getAttribute('position');
  const positions = Float32Array.from(positionAttr.array);
  const basePositions = Float32Array.from(positionAttr.array);

  const colors = new Float32Array(positionAttr.count * 3);
  const sizes = new Float32Array(positionAttr.count);

  /* stronger, greener palette */
  const topColor = new THREE.Color('#b7ffd0');
  const midColor = new THREE.Color('#12d85d');
  const deepColor = new THREE.Color('#07b64a');
  const glowColor = new THREE.Color('#7cff9f');

  const vertex = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const radialT = Math.abs(vertex.z) / radius;

    tempColor.copy(deepColor)
      .lerp(midColor, 0.55)
      .lerp(topColor, verticalT * 0.78)
      .lerp(glowColor, radialT * 0.16);

    colors[i * 3 + 0] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;

    sizes[i] = 5.5 + Math.random() * 3.25;
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
        gl_PointSize = size * (250.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform sampler2D pointTexture;

      varying vec3 vColor;

      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);
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
  group.position.y = -8;
  scene.add(group);

  const sizeArray = geometry.attributes.size.array;
  const positionArray = geometry.attributes.position.array;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    /* smooth floating rotation */
    group.rotation.y = time * 0.34;
    group.rotation.x = Math.sin(time * 0.55) * 0.16;
    group.rotation.z = Math.sin(time * 0.22) * 0.09;
    group.position.y = -8 + Math.sin(time * 0.75) * 6;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;

      const x = basePositions[ix + 0];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];

      /* more "liquid in zero gravity" deformation */
      const waveA = Math.sin(time * 1.2 + x * 0.034 + y * 0.022) * 0.05;
      const waveB = Math.cos(time * 0.95 + z * 0.03 - x * 0.018) * 0.035;
      const waveC = Math.sin(time * 0.72 + y * 0.026 - z * 0.018) * 0.028;

      const scale = 1.0 + waveA + waveB + waveC;

      positionArray[ix + 0] = x * scale;
      positionArray[ix + 1] = y * scale;
      positionArray[ix + 2] = z * scale;

      sizeArray[i] = 4.8 + 3.2 * (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.032));
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

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
  gradient.addColorStop(0.18, 'rgba(255,255,255,0.98)');
  gradient.addColorStop(0.40, 'rgba(255,255,255,0.70)');
  gradient.addColorStop(0.68, 'rgba(255,255,255,0.18)');
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
