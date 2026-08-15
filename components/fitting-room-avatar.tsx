"use client";

import { RefreshCcw, Rotate3D } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Measurements = {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  inseam: number;
};

type Garment = {
  category: string;
  color: string;
  title: string;
};

type FittingRoomAvatarProps = {
  measurements: Measurements;
  garment: Garment | null;
  garmentColor?: string;
  skinColor?: string;
  isLt: boolean;
};

type AvatarDimensions = {
  height: number;
  chestWidth: number;
  chestDepth: number;
  waistWidth: number;
  hipWidth: number;
  hipDepth: number;
  shoulderWidth: number;
  torsoHeight: number;
  torsoCenterY: number;
  torsoTopY: number;
  pelvisHeight: number;
  pelvisCenterY: number;
  crotchY: number;
  shoulderY: number;
  elbowY: number;
  wristY: number;
  kneeY: number;
  ankleY: number;
  armRadius: number;
  legRadius: number;
  footHeight: number;
};

const colorMap: Record<string, string> = {
  beige: "#c9ad86",
  black: "#202020",
  blue: "#355f8a",
  brown: "#76533a",
  cream: "#ece3cf",
  gray: "#77777a",
  green: "#52705a",
  grey: "#77777a",
  navy: "#27364e",
  orange: "#c86b32",
  pink: "#c98396",
  purple: "#755b87",
  red: "#a9403a",
  white: "#e8e8e6",
  yellow: "#c7a84a",
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function resolveGarmentColor(color: string, sampledColor?: string) {
  if (sampledColor?.trim()) return sampledColor;
  const normalized = color.trim().toLowerCase();
  return colorMap[normalized] ?? "#77777a";
}

function disposeObject(object: THREE.Object3D) {
  const disposedMaterials = new Set<THREE.Material>();
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((material) => {
      if (disposedMaterials.has(material)) return;
      disposedMaterials.add(material);
      material.dispose();
    });
  });
}

function addMesh(
  group: THREE.Group,
  geometry: THREE.BufferGeometry,
  material: THREE.Material,
  position: THREE.Vector3,
  scale?: THREE.Vector3,
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  if (scale) mesh.scale.copy(scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addCapsule(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.01, direction.length() - radius * 2), 8, 16);
  const mesh = addMesh(group, geometry, material, new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function addTaperedCylinder(
  group: THREE.Group,
  start: THREE.Vector3,
  end: THREE.Vector3,
  startRadius: number,
  endRadius: number,
  material: THREE.Material,
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const geometry = new THREE.CylinderGeometry(endRadius, startRadius, direction.length(), 20);
  const mesh = addMesh(group, geometry, material, new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function getDimensions(measurements: Measurements): AvatarDimensions {
  const height = clamp(measurements.height, 130, 220) / 100;
  const inseam = clamp(measurements.inseam / 100, height * 0.38, height * 0.58);
  const chestWidth = clamp(measurements.chest / 270, height * 0.16, height * 0.27);
  const waistWidth = clamp(measurements.waist / 270, height * 0.13, height * 0.24);
  const hipWidth = clamp(measurements.hips / 270, height * 0.16, height * 0.29);
  const shoulderWidth = clamp(measurements.shoulders / 100, chestWidth, height * 0.3);
  const footHeight = height * 0.045;
  const crotchY = inseam;
  const pelvisHeight = height * 0.105;
  const headRadius = height * 0.063;
  const neckHeight = height * 0.035;
  const torsoTopY = height - headRadius * 2 - neckHeight;
  const torsoHeight = Math.max(height * 0.23, torsoTopY - crotchY - pelvisHeight);
  const shoulderY = torsoTopY - height * 0.035;
  const armLength = height * 0.315;

  return {
    height,
    chestWidth,
    chestDepth: chestWidth * 0.62,
    waistWidth,
    hipWidth,
    hipDepth: hipWidth * 0.64,
    shoulderWidth,
    torsoHeight,
    torsoCenterY: crotchY + pelvisHeight + torsoHeight / 2,
    torsoTopY,
    pelvisHeight,
    pelvisCenterY: crotchY + pelvisHeight / 2,
    crotchY,
    shoulderY,
    elbowY: shoulderY - armLength * 0.52,
    wristY: shoulderY - armLength,
    kneeY: footHeight + (crotchY - footHeight) * 0.49,
    ankleY: footHeight * 1.25,
    armRadius: height * 0.027,
    legRadius: height * 0.039,
    footHeight,
  };
}

function buildAvatar(
  measurements: Measurements,
  garment: Garment | null,
  skinColor: string,
  sampledGarmentColor?: string,
) {
  const group = new THREE.Group();
  const dimensions = getDimensions(measurements);
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.86, metalness: 0 });
  const d = dimensions;
  const headRadius = d.height * 0.063;
  const headY = d.height - headRadius;
  const neckHeight = d.height * 0.04;
  const neckRadius = d.height * 0.026;
  const leftShoulder = new THREE.Vector3(-d.shoulderWidth / 2, d.shoulderY, 0);
  const rightShoulder = new THREE.Vector3(d.shoulderWidth / 2, d.shoulderY, 0);
  const leftElbow = new THREE.Vector3(-d.shoulderWidth / 2 - d.height * 0.018, d.elbowY, 0);
  const rightElbow = new THREE.Vector3(d.shoulderWidth / 2 + d.height * 0.018, d.elbowY, 0);
  const leftWrist = new THREE.Vector3(-d.shoulderWidth / 2 - d.height * 0.005, d.wristY, d.height * 0.008);
  const rightWrist = new THREE.Vector3(d.shoulderWidth / 2 + d.height * 0.005, d.wristY, d.height * 0.008);
  const legOffset = d.hipWidth * 0.23;
  const leftHip = new THREE.Vector3(-legOffset, d.crotchY + d.height * 0.025, 0);
  const rightHip = new THREE.Vector3(legOffset, d.crotchY + d.height * 0.025, 0);
  const leftKnee = new THREE.Vector3(-legOffset, d.kneeY, 0);
  const rightKnee = new THREE.Vector3(legOffset, d.kneeY, 0);
  const leftAnkle = new THREE.Vector3(-legOffset, d.ankleY, 0);
  const rightAnkle = new THREE.Vector3(legOffset, d.ankleY, 0);

  addMesh(
    group,
    new THREE.SphereGeometry(headRadius, 28, 20),
    skinMaterial,
    new THREE.Vector3(0, headY, 0),
    new THREE.Vector3(0.9, 1, 0.88),
  );
  addMesh(group, new THREE.CylinderGeometry(neckRadius, neckRadius * 1.08, neckHeight, 20), skinMaterial, new THREE.Vector3(0, d.torsoTopY + neckHeight * 0.42, 0));
  addMesh(
    group,
    new THREE.CylinderGeometry(d.chestWidth / 2, d.waistWidth / 2, d.torsoHeight, 32),
    skinMaterial,
    new THREE.Vector3(0, d.torsoCenterY, 0),
    new THREE.Vector3(1, 1, d.chestDepth / d.chestWidth),
  );
  addMesh(
    group,
    new THREE.CylinderGeometry(d.waistWidth / 2, d.hipWidth / 2, d.pelvisHeight, 32),
    skinMaterial,
    new THREE.Vector3(0, d.pelvisCenterY, 0),
    new THREE.Vector3(1, 1, d.hipDepth / d.hipWidth),
  );
  addCapsule(group, new THREE.Vector3(-d.shoulderWidth * 0.34, d.shoulderY, 0), new THREE.Vector3(d.shoulderWidth * 0.34, d.shoulderY, 0), d.armRadius * 1.12, skinMaterial);
  addCapsule(group, leftShoulder, leftElbow, d.armRadius, skinMaterial);
  addCapsule(group, leftElbow, leftWrist, d.armRadius * 0.86, skinMaterial);
  addCapsule(group, rightShoulder, rightElbow, d.armRadius, skinMaterial);
  addCapsule(group, rightElbow, rightWrist, d.armRadius * 0.86, skinMaterial);
  addMesh(group, new THREE.SphereGeometry(d.armRadius * 0.76, 16, 12), skinMaterial, leftWrist, new THREE.Vector3(0.82, 1.2, 0.72));
  addMesh(group, new THREE.SphereGeometry(d.armRadius * 0.76, 16, 12), skinMaterial, rightWrist, new THREE.Vector3(0.82, 1.2, 0.72));
  addCapsule(group, leftHip, leftKnee, d.legRadius, skinMaterial);
  addCapsule(group, leftKnee, leftAnkle, d.legRadius * 0.82, skinMaterial);
  addCapsule(group, rightHip, rightKnee, d.legRadius, skinMaterial);
  addCapsule(group, rightKnee, rightAnkle, d.legRadius * 0.82, skinMaterial);

  [-legOffset, legOffset].forEach((x) => {
    const foot = addMesh(
      group,
      new THREE.CapsuleGeometry(d.footHeight * 0.62, d.height * 0.075, 8, 16),
      skinMaterial,
      new THREE.Vector3(x, d.footHeight * 0.65, d.height * 0.028),
    );
    foot.rotation.x = Math.PI / 2;
  });

  if (!garment) return { group, height: d.height };

  const clothingMaterial = new THREE.MeshStandardMaterial({
    color: resolveGarmentColor(garment.color, sampledGarmentColor),
    roughness: 0.82,
    metalness: 0,
  });
  const category = garment.category.toLowerCase();
  const shell = category === "outerwear" ? d.height * 0.012 : d.height * 0.007;

  if (category === "tops" || category === "outerwear") {
    const hemY = category === "outerwear"
      ? d.crotchY + d.pelvisHeight * 0.18
      : d.pelvisCenterY;
    const necklineY = d.torsoTopY - d.height * 0.008;
    const length = necklineY - hemY;
    const topRadius = d.chestWidth / 2 + shell;
    const bottomRadius = (category === "outerwear" ? d.hipWidth : (d.waistWidth + d.hipWidth) / 2) / 2 + shell;
    const depthScale = (Math.max(d.chestDepth, d.hipDepth * 0.92) + shell * 2) / (topRadius * 2);
    addMesh(
      group,
      new THREE.CylinderGeometry(topRadius, bottomRadius, length, 32),
      clothingMaterial,
      new THREE.Vector3(0, hemY + length / 2, 0),
      new THREE.Vector3(1, 1, depthScale),
    );
    const collar = addMesh(
      group,
      new THREE.TorusGeometry(neckRadius * 1.22, d.height * 0.006, 8, 28),
      clothingMaterial,
      new THREE.Vector3(0, necklineY + d.height * 0.004, 0),
    );
    collar.rotation.x = Math.PI / 2;
    const sleeveEndLeft = category === "outerwear" ? leftWrist : leftElbow;
    const sleeveEndRight = category === "outerwear" ? rightWrist : rightElbow;
    addTaperedCylinder(group, leftShoulder, sleeveEndLeft, d.armRadius + shell, (category === "outerwear" ? d.armRadius * 0.86 : d.armRadius * 0.94) + shell, clothingMaterial);
    addTaperedCylinder(group, rightShoulder, sleeveEndRight, d.armRadius + shell, (category === "outerwear" ? d.armRadius * 0.86 : d.armRadius * 0.94) + shell, clothingMaterial);
  } else if (category === "bottoms") {
    const waistbandTopY = d.crotchY + d.pelvisHeight;
    const waistbandBottomY = d.crotchY + d.pelvisHeight * 0.18;
    const waistbandHeight = waistbandTopY - waistbandBottomY;
    addMesh(
      group,
      new THREE.CylinderGeometry(d.waistWidth / 2 + shell, d.hipWidth / 2 + shell, waistbandHeight, 32),
      clothingMaterial,
      new THREE.Vector3(0, waistbandBottomY + waistbandHeight / 2, 0),
      new THREE.Vector3(1, 1, (d.hipDepth + shell * 2) / (d.hipWidth + shell * 2)),
    );
    addTaperedCylinder(group, leftHip, leftKnee, d.legRadius + shell, d.legRadius * 0.88 + shell, clothingMaterial);
    addTaperedCylinder(group, leftKnee, leftAnkle, d.legRadius * 0.88 + shell, d.legRadius * 0.7 + shell, clothingMaterial);
    addTaperedCylinder(group, rightHip, rightKnee, d.legRadius + shell, d.legRadius * 0.88 + shell, clothingMaterial);
    addTaperedCylinder(group, rightKnee, rightAnkle, d.legRadius * 0.88 + shell, d.legRadius * 0.7 + shell, clothingMaterial);
  } else if (category === "dresses") {
    const waistlineY = d.crotchY + d.pelvisHeight;
    const bodiceHeight = d.torsoTopY - waistlineY;
    const bodiceTopRadius = d.chestWidth / 2 + shell;
    const bodiceBottomRadius = d.waistWidth / 2 + shell;
    const bodiceDepthScale = (d.chestDepth + shell * 2) / (bodiceTopRadius * 2);
    addMesh(
      group,
      new THREE.CylinderGeometry(bodiceTopRadius, bodiceBottomRadius, bodiceHeight, 32),
      clothingMaterial,
      new THREE.Vector3(0, waistlineY + bodiceHeight / 2, 0),
      new THREE.Vector3(1, 1, bodiceDepthScale),
    );
    const skirtHeight = Math.min(d.height * 0.34, d.crotchY * 0.68);
    addMesh(
      group,
      new THREE.CylinderGeometry(bodiceBottomRadius, d.hipWidth * 0.88, skirtHeight, 40),
      clothingMaterial,
      new THREE.Vector3(0, waistlineY - skirtHeight / 2, 0),
      new THREE.Vector3(1, 1, bodiceDepthScale),
    );
  } else if (category === "shoes") {
    [-legOffset, legOffset].forEach((x) => {
      const shoe = addMesh(
        group,
        new THREE.CapsuleGeometry(d.footHeight * 0.72, d.height * 0.084, 8, 16),
        clothingMaterial,
        new THREE.Vector3(x, d.footHeight * 0.63, d.height * 0.034),
      );
      shoe.rotation.x = Math.PI / 2;
    });
  } else if (category === "bags") {
    const strapCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-d.shoulderWidth * 0.38, d.shoulderY, d.chestDepth * 0.3),
      new THREE.Vector3(d.chestWidth * 0.06, d.torsoCenterY, d.chestDepth * 0.58),
      new THREE.Vector3(d.hipWidth * 0.36, d.crotchY + d.pelvisHeight * 0.38, d.hipDepth * 0.48),
    ]);
    addMesh(group, new THREE.TubeGeometry(strapCurve, 24, d.height * 0.006, 8, false), clothingMaterial, new THREE.Vector3());
    addMesh(
      group,
      new THREE.BoxGeometry(d.hipWidth * 0.36, d.height * 0.13, d.height * 0.055),
      clothingMaterial,
      new THREE.Vector3(d.hipWidth * 0.42, d.crotchY + d.pelvisHeight * 0.25, d.hipDepth * 0.48),
    );
  } else if (category === "accessories") {
    const collar = addMesh(
      group,
      new THREE.TorusGeometry(neckRadius * 1.45, d.height * 0.007, 8, 24),
      clothingMaterial,
      new THREE.Vector3(0, d.torsoTopY + neckHeight * 0.36, 0),
    );
    collar.rotation.x = Math.PI / 2;
  }

  return { group, height: d.height };
}

function setCameraView(camera: THREE.PerspectiveCamera, controls: OrbitControls, height: number) {
  controls.target.set(0, height * 0.5, 0);
  camera.position.set(height * 0.82, height * 0.58, height * 1.85);
  controls.minDistance = height * 0.72;
  controls.maxDistance = height * 3.5;
  camera.lookAt(controls.target);
  controls.update();
}

export function FittingRoomAvatar({ measurements, garment, garmentColor, skinColor = "#c8a789", isLt }: FittingRoomAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const modelHeightRef = useRef(clamp(measurements.height, 130, 220) / 100);
  const [autoRotate, setAutoRotate] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // A device with no WebGL (or a lost GPU context) must not leave a dead black
  // rectangle. `webglError` swaps the canvas for a useful textual fallback;
  // `retryKey` lets the shopper re-initialise after the context is restored.
  const [webglError, setWebglError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => {
      setReducedMotion(media.matches);
      if (media.matches) setAutoRotate(false);
    };
    updateMotionPreference();
    media.addEventListener("change", updateMotionPreference);
    return () => media.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Constructing the renderer is the one step that can throw on a device
    // without a usable WebGL context. Catch it here and fall back rather than
    // letting the error bubble and blank the whole panel.
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglError(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    // The GPU can drop the context at any time (tab backgrounded, driver reset,
    // too many live contexts). Without this the canvas would freeze black;
    // preventDefault keeps the browser from making the loss permanent, and we
    // surface the fallback with its retry affordance.
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      window.cancelAnimationFrame(animationFrame);
      setWebglError(true);
    };
    renderer.domElement.addEventListener("webglcontextlost", handleContextLost, false);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.76;
    controls.autoRotateSpeed = 1.25;
    setCameraView(camera, controls, modelHeightRef.current);

    const ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1), 1.7);
    const directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 2.4);
    directionalLight.position.set(2.5, 4, 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(ambientLight, directionalLight);

    const surfaceSoft = getComputedStyle(container).getPropertyValue("--color-surface-soft").trim();
    const studioMaterial = new THREE.MeshStandardMaterial({ color: surfaceSoft, roughness: 1, metalness: 0 });
    const studio = new THREE.Group();
    const ground = addMesh(studio, new THREE.PlaneGeometry(7, 7), studioMaterial, new THREE.Vector3(0, -0.01, 0));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.castShadow = false;
    const backdrop = addMesh(studio, new THREE.PlaneGeometry(7, 4), studioMaterial, new THREE.Vector3(0, 1.6, -1.25));
    backdrop.receiveShadow = true;
    backdrop.castShadow = false;
    scene.add(studio);

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationFrame = 0;
    const render = () => {
      animationFrame = window.requestAnimationFrame(render);
      controls.update();
      renderer.render(scene, camera);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      renderer.domElement.removeEventListener("webglcontextlost", handleContextLost);
      resizeObserver.disconnect();
      controls.dispose();
      scene.remove(studio);
      disposeObject(studio);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      sceneRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [retryKey]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const avatar = buildAvatar(measurements, garment, skinColor, garmentColor);
    modelHeightRef.current = avatar.height;
    modelRef.current = avatar.group;
    scene.add(avatar.group);

    const controls = controlsRef.current;
    if (controls) {
      controls.minDistance = avatar.height * 0.72;
      controls.maxDistance = avatar.height * 3.5;
    }

    return () => {
      scene.remove(avatar.group);
      disposeObject(avatar.group);
      if (modelRef.current === avatar.group) modelRef.current = null;
    };
    // retryKey re-adds the avatar into the scene rebuilt after a context recovery.
  }, [garment, garmentColor, measurements, skinColor, retryKey]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate && !reducedMotion;
  }, [autoRotate, reducedMotion]);

  function resetView() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (camera && controls) setCameraView(camera, controls, modelHeightRef.current);
  }

  if (webglError) {
    const specs: Array<[string, string]> = [
      [isLt ? "Ūgis" : "Height", `${Math.round(measurements.height)} cm`],
      [isLt ? "Krūtinė" : "Chest", `${Math.round(measurements.chest)} cm`],
      [isLt ? "Juosmuo" : "Waist", `${Math.round(measurements.waist)} cm`],
      [isLt ? "Klubai" : "Hips", `${Math.round(measurements.hips)} cm`],
    ];
    return (
      <div
        aria-label={isLt ? "3D peržiūra nepasiekiama" : "3D preview unavailable"}
        className="avatar-stage avatar-fallback"
        ref={containerRef}
        role="group"
      >
        <div className="avatar-fallback-inner">
          <p className="avatar-fallback-title">{isLt ? "3D peržiūra nepasiekiama" : "3D preview unavailable"}</p>
          <p className="avatar-fallback-body">
            {isLt
              ? "Ši naršyklė arba įrenginys neįjungė WebGL, todėl 3D manekeno nupiešti negalime. Jūsų matmenys ir pasirinktas drabužis vis tiek pritaikyti."
              : "This browser or device didn't provide WebGL, so the 3D mannequin can't be drawn. Your measurements and selected garment are still applied."}
          </p>
          <dl className="avatar-fallback-specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            {garment ? (
              <div className="avatar-fallback-garment">
                <dt>{isLt ? "Drabužis" : "Garment"}</dt>
                <dd>{garment.title}</dd>
              </div>
            ) : null}
          </dl>
          <button onClick={() => { setWebglError(false); setRetryKey((key) => key + 1); }} type="button">
            <RefreshCcw aria-hidden="true" size={16} />
            {isLt ? "Bandyti dar kartą" : "Try again"}
          </button>
        </div>
        <style>{avatarStyles}</style>
      </div>
    );
  }

  return (
    <div
      aria-label={isLt ? "Interaktyvi apytikslė 3D matavimosi peržiūra" : "Interactive approximate 3D fitting preview"}
      className="avatar-stage"
      ref={containerRef}
      role="group"
    >
      <div className="avatar-controls">
        <button
          aria-label={isLt ? "Perjungti automatinį sukimą" : "Toggle automatic rotation"}
          aria-pressed={autoRotate}
          disabled={reducedMotion}
          onClick={() => setAutoRotate((current) => !current)}
          type="button"
        >
          <Rotate3D aria-hidden="true" size={17} />
          {isLt ? "Automatinis sukimas" : "Auto rotate"}
        </button>
        <button aria-label={isLt ? "Atkurti pradinį 3D vaizdą" : "Reset the 3D view"} onClick={resetView} type="button">
          <RefreshCcw aria-hidden="true" size={17} />
          {isLt ? "Atkurti vaizdą" : "Reset view"}
        </button>
      </div>
      <p className="avatar-hint">{isLt ? "Vilkite, kad pasuktumėte · slinkite, kad priartintumėte" : "Drag to rotate · scroll to zoom"}</p>
      <style>{avatarStyles}</style>
    </div>
  );
}

const avatarStyles = `
.avatar-stage{position:relative;min-height:460px;width:100%;overflow:hidden;background:var(--color-surface-soft);border:1px solid var(--color-line);isolation:isolate}.avatar-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;z-index:0;touch-action:none}.avatar-controls{position:absolute;z-index:2;top:12px;left:12px;display:flex;flex-wrap:wrap;gap:8px}.avatar-controls button{display:flex;align-items:center;gap:7px;min-height:44px;padding:9px 12px;border:1px solid var(--color-line);background:var(--color-surface);color:var(--color-ink);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.avatar-controls button[aria-pressed="true"]{background:var(--color-ink);border-color:var(--color-ink);color:var(--color-canvas)}.avatar-controls button:disabled{opacity:.45;cursor:not-allowed}.avatar-controls button:focus-visible{outline:3px solid var(--color-accent);outline-offset:2px}.avatar-hint{position:absolute;z-index:2;left:12px;bottom:10px;margin:0;padding:7px 9px;background:var(--color-surface);color:var(--color-ink-muted);font-size:11px}
.avatar-fallback{display:grid;place-items:center;padding:28px}.avatar-fallback-inner{max-width:340px;text-align:center}.avatar-fallback-title{font-family:var(--font-display);font-size:18px;margin:0 0 8px}.avatar-fallback-body{color:var(--color-ink-muted);font-size:13px;line-height:1.5;margin:0 0 18px}.avatar-fallback-specs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0 0 18px;text-align:left}.avatar-fallback-specs>div{border:1px solid var(--color-line);padding:8px 10px}.avatar-fallback-garment{grid-column:1/-1}.avatar-fallback-specs dt{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--color-ink-muted)}.avatar-fallback-specs dd{margin:3px 0 0;font-size:13px;font-weight:600}.avatar-fallback button{display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:9px 16px;border:1px solid var(--color-ink);background:var(--color-ink);color:var(--color-canvas);font:inherit;font-size:12px;font-weight:600;cursor:pointer}.avatar-fallback button:focus-visible{outline:3px solid var(--color-accent);outline-offset:2px}
@media(max-width:520px){.avatar-stage{min-height:380px}.avatar-controls{right:12px}.avatar-controls button{flex:1;justify-content:center}.avatar-hint{right:12px;text-align:center}}
@media(prefers-reduced-motion:reduce){.avatar-controls button{transition:none}}
`;
