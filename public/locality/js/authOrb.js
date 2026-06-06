import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const mount = document.getElementById("authOrbCanvas");

if (mount) {
  initAuthOrb(mount);
}

function initAuthOrb(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    getAspect(container),
    1,
    1000
  );

  // Went from 350 -> 390 (best) -> 500 (test) -> 800 (test 2[no good]) -> 1000 (test 3)
  camera.position.z = 1000;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const radius = 118;
  const geometry = new THREE.SphereGeometry(radius, 118, 76);

  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");

  const positionAttr = geometry.getAttribute("position");
  const basePositions = Float32Array.from(positionAttr.array);
  const positions = Float32Array.from(positionAttr.array);

  const colors = new Float32Array(positionAttr.count * 3);
  const sizes = new Float32Array(positionAttr.count);

  const deepGreen = new THREE.Color("#06c755");
  const brightMint = new THREE.Color("#9ef0b8");
  const freshGreen = new THREE.Color("#31e06f");
  const shadowGreen = new THREE.Color("#0d6a37");

  const vertex = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const edgeT = Math.abs(vertex.x) / radius;
    const depthT = (vertex.z + radius) / (radius * 2);

    tempColor.copy(deepGreen);
    tempColor.lerp(brightMint, verticalT * 0.30);
    tempColor.lerp(freshGreen, edgeT * 0.24);
    tempColor.lerp(shadowGreen, depthT * 0.12);

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;

    // 10.7 and 7.6 originally -> 11.7 and 8.2
    sizes[i] = 14.7 + Math.random() * 10.2;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute("ca", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      pointTexture: { value: createGlowTexture() }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 ca;

      varying vec3 vColor;

      void main() {
        vColor = ca;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        gl_PointSize = size * (330.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform sampler2D pointTexture;

      varying vec3 vColor;

      void main() {
        vec4 tex = texture2D(pointTexture, gl_PointCoord);

        if (tex.a < 0.04) discard;

        vec3 finalColor = color * vColor;
        gl_FragColor = vec4(finalColor, tex.a * 0.92);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const orb = new THREE.Points(geometry, material);

  const group = new THREE.Group();
  group.add(orb);
  scene.add(group);

  const size = geometry.attributes.size.;
  const position = geometry.attributes.position.;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    group.rotation.y = time * 0.18;
    group.rotation.x = 0.52 + Math.sin(time * 0.32) * 0.08;
    group.rotation.z = Math.sin(time * 0.16) * 0.06;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;

      const x = basePositions[ix];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];

      const waveA = Math.sin(time * 1.1 + x * 0.028 + y * 0.022) * 0.075;
      const waveB = Math.cos(time * 0.85 + z * 0.026 - x * 0.018) * 0.055;
      const waveC = Math.sin(time * 0.7 + (x + z) * 0.012) * 0.035;

      const scale = 1 + waveA + waveB + waveC;

      positionArray[ix] = x * scale;
      positionArray[ix + 1] = y * scale;
      positionArray[ix + 2] = z * scale;

      // 9.3 + 7.2 originally -> then 10.3 + 8.2
      sizeArray[i] =
      14.7 + 10.2 * (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.035));
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

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(animate);
}

function getAspect(container) {
  const width = Math.max(container.clientWidth, 320);
  const height = Math.max(container.clientHeight, 320);

  return width / height;
}

function createGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );

  gradient.addColorStop(0.0, "rgba(138,255,160,0.95)");
  gradient.addColorStop(0.16, "rgba(90,244,124,0.82)");
  gradient.addColorStop(0.40, "rgba(33,223,88,0.42)");
  gradient.addColorStop(0.72, "rgba(18,170,60,0.14)");
  gradient.addColorStop(1.0, "rgba(18,170,60,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}
