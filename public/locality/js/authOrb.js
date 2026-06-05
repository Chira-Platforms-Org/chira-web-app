import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js';
import * as BufferGeometryUtils from 'https://cdn.jsdelivr.net/npm/three@0.166.1/examples/jsm/utils/BufferGeometryUtils.js';

const mount = document.getElementById('authOrbCanvas');

if (mount) {
  initAuthOrb(mount);
}

function initAuthOrb(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    40,
    container.clientWidth / container.clientHeight,
    1,
    1000
  );
  camera.position.z = 270;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0); // transparent background
  container.appendChild(renderer.domElement);

  const radius = 92;
  let geometry = new THREE.SphereGeometry(radius, 84, 58);

  geometry.deleteAttribute('normal');
  geometry.deleteAttribute('uv');
  geometry = BufferGeometryUtils.mergeVertices(geometry);

  const positionAttr = geometry.getAttribute('position');
  const positions = Float32Array.from(positionAttr.array);
  const basePositions = Float32Array.from(positionAttr.array);

  const colors = new Float32Array(positionAttr.count * 3);
  const sizes = new Float32Array(positionAttr.count);

  const topColor = new THREE.Color('#95f7b7');
  const midColor = new THREE.Color('#23d76e');
  const accentColor = new THREE.Color('#b9ffe5');
  const edgeColor = new THREE.Color('#8cf0ff');

  const vertex = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const horizontalT = Math.abs(vertex.x) / radius;

    tempColor.copy(midColor).lerp(topColor, verticalT * 0.8);
    tempColor.lerp(edgeColor, horizontalT * 0.12);
    tempColor.lerp(accentColor, 0.12);

    colors[i * 3 + 0] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;

    sizes[i] = 9 + Math.random() * 6;
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
        gl_PointSize = size * (280.0 / -mvPosition.z);
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
  scene.add(orb);

  const group = new THREE.Group();
  group.add(orb);
  scene.add(group);

  const sizeArray = geometry.attributes.size.array;
  const positionArray = geometry.attributes.position.array;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    group.rotation.y = time * 0.28;
    group.rotation.x = Math.sin(time * 0.42) * 0.18;
    group.rotation.z = Math.sin(time * 0.18) * 0.08;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;

      const x = basePositions[ix + 0];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];

      const waveA =
        Math.sin(time * 1.25 + x * 0.035 + y * 0.025) * 0.045;
      const waveB =
        Math.cos(time * 0.95 + z * 0.03 - x * 0.02) * 0.03;
      const scale = 1.0 + waveA + waveB;

      positionArray[ix + 0] = x * scale;
      positionArray[ix + 1] = y * scale;
      positionArray[ix + 2] = z * scale;

      sizeArray[i] = 7.5 + 5.5 * (0.5 + 0.5 * Math.sin(time * 2.1 + i * 0.045));
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
  gradient.addColorStop(0.22, 'rgba(255,255,255,0.95)');
  gradient.addColorStop(0.46, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(0.72, 'rgba(255,255,255,0.14)');
  gradient.addColorStop(1.0, 'rgba(255,255,255,0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
