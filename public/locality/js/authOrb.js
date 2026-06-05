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

  camera.position.z = 250;

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

  const deepGreen = new THREE.Color("#08c464");
  const brightMint = new THREE.Color("#baffd4");
  const aqua = new THREE.Color("#7ef7ff");
  const navyGlow = new THREE.Color("#1d3d74");

  const vertex = new THREE.Vector3();
  const tempColor = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const edgeT = Math.abs(vertex.x) / radius;
    const depthT = (vertex.z + radius) / (radius * 2);

    tempColor.copy(deepGreen);
    tempColor.lerp(brightMint, verticalT * 0.55);
    tempColor.lerp(aqua, edgeT * 0.18);
    tempColor.lerp(navyGlow, depthT * 0.08);

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;

    sizes[i] = 9 + Math.random() * 7;
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
        gl_FragColor = vec4(finalColor, tex.a);
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

  const sizeArray = geometry.attributes.size.array;
  const positionArray = geometry.attributes.position.array;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    group.rotation.y = time * 0.18;
    group.rotation.x = Math.sin(time * 0.36) * 0.22;
    group.rotation.z = Math.sin(time * 0.18) * 0.12;

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

      sizeArray[i] =
        8.5 + 7.5 * (0.5 + 0.5 * Math.sin(time * 1.8 + i * 0.035));
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

  gradient.addColorStop(0.0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.98)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.20)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}
