import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const mount = document.getElementById("authOrbCanvas");

if (mount) {
  initAuthOrb(mount);
}

function initAuthOrb(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    34,
    getAspect(container),
    1,
    1000
  );

  camera.position.z = 280;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  const radius = 88;
  const geometry = new THREE.SphereGeometry(radius, 120, 80);

  geometry.deleteAttribute("normal");
  geometry.deleteAttribute("uv");

  const positionAttr = geometry.getAttribute("position");
  const basePositions = Float32Array.from(positionAttr.array);
  const positions = Float32Array.from(positionAttr.array);

  const colors = new Float32Array(positionAttr.count * 3);
  const sizes = new Float32Array(positionAttr.count);

  const bright = new THREE.Color("#b8ffc7");
  const green = new THREE.Color("#16d957");
  const deep = new THREE.Color("#06b846");
  const glow = new THREE.Color("#73ff94");

  const vertex = new THREE.Vector3();
  const color = new THREE.Color();

  for (let i = 0; i < positionAttr.count; i++) {
    vertex.fromBufferAttribute(positionAttr, i);

    const verticalT = (vertex.y + radius) / (radius * 2);
    const depthT = (vertex.z + radius) / (radius * 2);

    color.copy(deep)
      .lerp(green, 0.65)
      .lerp(bright, verticalT * 0.55)
      .lerp(glow, depthT * 0.18);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 7 + Math.random() * 4;
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

        gl_PointSize = size * (260.0 / -mvPosition.z);
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
  scene.add(group);

  const positionArray = geometry.attributes.position.array;
  const sizeArray = geometry.attributes.size.array;

  function animate(timeMs) {
    const time = timeMs * 0.001;

    group.rotation.y = time * 0.26;
    group.rotation.x = Math.sin(time * 0.45) * 0.16;
    group.rotation.z = Math.sin(time * 0.22) * 0.08;
    group.position.y = Math.sin(time * 0.7) * 5;

    for (let i = 0; i < positionAttr.count; i++) {
      const ix = i * 3;

      const x = basePositions[ix];
      const y = basePositions[ix + 1];
      const z = basePositions[ix + 2];

      const waveA = Math.sin(time * 1.05 + x * 0.03 + y * 0.022) * 0.045;
      const waveB = Math.cos(time * 0.8 + z * 0.026 - x * 0.016) * 0.035;
      const waveC = Math.sin(time * 0.65 + y * 0.018 - z * 0.012) * 0.025;

      const scale = 1 + waveA + waveB + waveC;

      positionArray[ix] = x * scale;
      positionArray[ix + 1] = y * scale;
      positionArray[ix + 2] = z * scale;

      sizeArray[i] =
        6.5 + 3.5 * (0.5 + 0.5 * Math.sin(time * 1.6 + i * 0.028));
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  function resize() {
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 280);

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
  const height = Math.max(container.clientHeight, 280);

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
  gradient.addColorStop(0.42, "rgba(255,255,255,0.66)");
  gradient.addColorStop(0.72, "rgba(255,255,255,0.18)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}
