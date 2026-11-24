import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { TeleportTarget, XROrigin, useXR } from '@react-three/xr';
import {
  AdditiveBlending,
  NormalBlending,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
  VideoTexture,
} from 'three';
import useImageTexture from './useImageTexture';
import VRText from './VRText';
import wallImg from '../../assets/imgs/wall.png';
import patternImg from '../../assets/imgs/bg-pattern.png';
import chandelierVideo from '../../assets/imgs/Chandelier.webm';

const WALL_X = 2.8;
const HALL_HEIGHT = 4.4;
const WAINSCOT_HEIGHT = 1.6;
const FRAME_HEIGHT = 2.2;
const FRAME_MAX_WIDTH = 2.6;
const TEXT_GAP = 0.25;
const SPACING = 5;
const FIRST_Z = 5;
const START_Z = 1;
const BACK_Z = 4;
const EYE_HEIGHT = 1.6;

const TEXT_TITLE_Y = 2.75;
const TEXT_SUBTITLE_Y = 2.68;
const TEXT_DESC_Y = 2.5;

const TITLE_SIZE = 0.24;
const TITLE_LINE_HEIGHT = 1.1;
const TITLE_CHARS_PER_LINE = 14;

const WALL_TILE_HEIGHT = WAINSCOT_HEIGHT;
const PATTERN_TILE_HEIGHT = 1.4;

const CHANDELIER_COUNT = 3;
const CHANDELIER_FIRST_Z = -7;
const CHANDELIER_GAP = 9;
const CHANDELIER_HEIGHT = 1.5;
const CHANDELIER_ADDITIVE = true;

const RUNNER_WIDTH = 2;

const TITLE_FONT = '"Aestera - Personal use", serif';
const BODY_FONT = '"Philosopher", serif';

const COLORS = {
  beige: '#cdbb8f',
  ceiling: '#74552f',
  green: '#1c573a',
  burgundy: '#340001',
  runner: '#5b0a0f',
  gold: '#A47843',
  gray: '#559E7B',
  black: '#000000',
  placeholder: '#fff3da',
};

const splitTitle = (title = '') => {
  const [no, ...rest] = title.split(' / ');
  return rest.length ? { no, name: rest.join(' / ') } : { no: '', name: title };
};

const useTiledTexture = (url, width, height, tileHeight) => {
  const base = useLoader(TextureLoader, url);
  const gl = useThree((state) => state.gl);

  return useMemo(() => {
    const aspect = base.image.width / base.image.height;
    const tileWidth = tileHeight * aspect;
    const t = base.clone();
    t.wrapS = t.wrapT = RepeatWrapping;
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = gl.capabilities.getMaxAnisotropy();
    t.repeat.set(width / tileWidth, height / tileHeight);
    t.needsUpdate = true;
    return t;
  }, [base, gl, width, height, tileHeight]);
};

const TiledPlane = ({ url, width, height, tileHeight, backColor, position, rotation }) => {
  const texture = useTiledTexture(url, width, height, tileHeight);

  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={backColor} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
    </group>
  );
};

const Strip = ({ width, height, color, position, rotation }) => (
  <mesh position={position} rotation={rotation}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial color={color} polygonOffset polygonOffsetFactor={-2} />
  </mesh>
);

const Wall = ({ width, position, rotation = [0, 0, 0] }) => {
  const upperHeight = HALL_HEIGHT - WAINSCOT_HEIGHT;

  return (
    <group position={position} rotation={rotation}>
      <TiledPlane
        url={wallImg}
        width={width}
        height={WAINSCOT_HEIGHT}
        tileHeight={WALL_TILE_HEIGHT}
        backColor={COLORS.green}
        position={[0, WAINSCOT_HEIGHT / 2, 0]}
      />
      <TiledPlane
        url={patternImg}
        width={width}
        height={upperHeight}
        tileHeight={PATTERN_TILE_HEIGHT}
        backColor={COLORS.beige}
        position={[0, WAINSCOT_HEIGHT + upperHeight / 2, 0]}
      />
      <Strip width={width} height={0.06} color={COLORS.gold} position={[0, WAINSCOT_HEIGHT, 0.01]} />
      <Strip width={width} height={0.22} color={COLORS.gold} position={[0, HALL_HEIGHT - 0.11, 0.01]} />
    </group>
  );
};

const Billboard = ({ position, children }) => {
  const ref = useRef();
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const target = useMemo(() => new Vector3(), []);

  useFrame(() => {
    if (!ref.current) return;
    const cam = gl.xr.isPresenting ? gl.xr.getCamera() : camera;
    cam.getWorldPosition(target);
    ref.current.rotation.y = Math.atan2(
      target.x - ref.current.position.x,
      target.z - ref.current.position.z
    );
  });

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
};

const useVideoTexture = (url) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const texture = new VideoTexture(video);
    texture.colorSpace = SRGBColorSpace;

    const onReady = () => {
      setResult({ texture, aspect: video.videoWidth / video.videoHeight });
      video.play().catch(() => {});
    };

    video.addEventListener('loadeddata', onReady, { once: true });
    video.load();

    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.pause();
      video.removeAttribute('src');
      video.load();
      texture.dispose();
    };
  }, [url]);

  return result;
};

const Chandeliers = ({ zs }) => {
  const video = useVideoTexture(chandelierVideo);

  if (!video) return null;

  const height = CHANDELIER_HEIGHT;
  const width = height * video.aspect;
  const y = HALL_HEIGHT - height / 2 - 0.05;

  return zs.map((z) => (
    <Billboard key={z} position={[0, y, z]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={video.texture}
          transparent
          blending={CHANDELIER_ADDITIVE ? AdditiveBlending : NormalBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  ));
};

const getFrameSize = (texture) => {
  if (!texture) return { width: 1.4, height: FRAME_HEIGHT };
  const aspect = texture.image.width / texture.image.height;
  const height = Math.min(FRAME_HEIGHT, FRAME_MAX_WIDTH / aspect);
  return { width: height * aspect, height };
};

const VRFrame = ({ texture, width, height, y }) => {
  if (!texture) {
    return (
      <mesh position={[0, y, 0]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={COLORS.placeholder} transparent opacity={0.7} />
      </mesh>
    );
  }

  return (
    <mesh position={[0, y, 0]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.02} toneMapped={false} />
    </mesh>
  );
};

const VRItem = ({ item, index }) => {
  const texture = useImageTexture(item.image_url);
  const isLeft = index % 2 === 0;
  const direction = isLeft ? 1 : -1;
  const align = isLeft ? 'left' : 'right';
  const z = -(FIRST_Z + index * SPACING);
  const { no, name } = splitTitle(item.title);
  const subtitle = [no, item.subtitle].filter(Boolean).join('  ·  ');

  const { width, height } = getFrameSize(texture);
  const textX = direction * (width / 2 + TEXT_GAP);
  const titleLines = Math.min(3, Math.max(1, Math.ceil((name || '').length / TITLE_CHARS_PER_LINE)));
  const titleTop = TEXT_TITLE_Y + titleLines * TITLE_SIZE * TITLE_LINE_HEIGHT;
  const frameY = titleTop - height / 2;

  return (
    <group
      position={[isLeft ? -(WALL_X - 0.02) : WALL_X - 0.02, 0, z]}
      rotation={[0, isLeft ? Math.PI / 2 : -Math.PI / 2, 0]}
    >
      <VRFrame texture={texture} width={width} height={height} y={frameY} />

      {name && (
        <VRText
          text={name}
          font={TITLE_FONT}
          size={TITLE_SIZE}
          color={COLORS.green}
          maxWidth={2.4}
          lineHeight={TITLE_LINE_HEIGHT}
          align={align}
          anchorY="bottom"
          position={[textX, TEXT_TITLE_Y, 0.02]}
        />
      )}

      {subtitle && (
        <VRText
          text={subtitle}
          font={BODY_FONT}
          size={0.12}
          color={COLORS.gray}
          maxWidth={2.4}
          align={align}
          anchorY="top"
          position={[textX, TEXT_SUBTITLE_Y, 0.02]}
        />
      )}

      {item.description && (
        <VRText
          text={item.description}
          font={BODY_FONT}
          size={0.095}
          color={COLORS.black}
          maxWidth={2.4}
          lineHeight={1.4}
          align={align}
          anchorY="top"
          position={[textX, TEXT_DESC_Y, 0.02]}
        />
      )}
    </group>
  );
};

const DesktopRig = ({ minZ }) => {
  const session = useXR((state) => state.session);
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const look = useRef({ yaw: 0, pitch: 0 });
  const targetZ = useRef(START_Z);

  useEffect(() => {
    if (session) return undefined;

    let dragging = false;

    const walk = (delta) => {
      targetZ.current = Math.max(minZ, Math.min(START_Z, targetZ.current + delta));
    };

    const onDown = () => {
      dragging = true;
    };

    const onUp = () => {
      dragging = false;
    };

    const onMove = (e) => {
      if (!dragging) return;
      look.current.yaw -= e.movementX * 0.004;
      look.current.pitch = Math.max(-0.8, Math.min(0.8, look.current.pitch - e.movementY * 0.004));
    };

    const onWheel = (e) => {
      e.preventDefault();
      walk(-e.deltaY * 0.01);
    };

    const onKey = (e) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) walk(-1.5);
      if (['ArrowDown', 's', 'S'].includes(e.key)) walk(1.5);
    };

    domElement.addEventListener('pointerdown', onDown);
    domElement.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('keydown', onKey);

    return () => {
      domElement.removeEventListener('pointerdown', onDown);
      domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [session, domElement, minZ]);

  useFrame(() => {
    if (session) return;
    camera.position.set(0, EYE_HEIGHT, camera.position.z + (targetZ.current - camera.position.z) * 0.08);
    camera.rotation.set(look.current.pitch, look.current.yaw, 0, 'YXZ');
  });

  return null;
};

const VRScene = ({ items }) => {
  const [origin, setOrigin] = useState([0, 0, START_Z]);

  const endZ = -(FIRST_Z + Math.max(0, items.length - 1) * SPACING + 5);
  const length = BACK_Z - endZ;
  const centerZ = (BACK_Z + endZ) / 2;

  const chandelierZs = Array.from(
    { length: CHANDELIER_COUNT },
    (_, k) => CHANDELIER_FIRST_Z - k * CHANDELIER_GAP
  ).filter((z) => z > endZ + 2);

  return (
    <>
      <color attach="background" args={[COLORS.beige]} />
      <fog attach="fog" args={[COLORS.beige, 12, 40]} />

      <XROrigin position={origin} />
      <DesktopRig minZ={endZ + 4} />

      <TeleportTarget onTeleport={(point) => setOrigin([point.x, 0, point.z])}>
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
            <planeGeometry args={[WALL_X * 2, length]} />
            <meshBasicMaterial color={COLORS.burgundy} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, centerZ]}>
            <planeGeometry args={[RUNNER_WIDTH, length]} />
            <meshBasicMaterial color={COLORS.runner} polygonOffset polygonOffsetFactor={-1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(RUNNER_WIDTH / 2 - 0.05), 0.006, centerZ]}>
            <planeGeometry args={[0.05, length]} />
            <meshBasicMaterial color={COLORS.gold} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[RUNNER_WIDTH / 2 - 0.05, 0.006, centerZ]}>
            <planeGeometry args={[0.05, length]} />
            <meshBasicMaterial color={COLORS.gold} polygonOffset polygonOffsetFactor={-2} />
          </mesh>
        </group>
      </TeleportTarget>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, HALL_HEIGHT, centerZ]}>
        <planeGeometry args={[WALL_X * 2, length]} />
        <meshBasicMaterial color={COLORS.ceiling} />
      </mesh>

      <Suspense fallback={null}>
        <Wall width={length} position={[-WALL_X, 0, centerZ]} rotation={[0, Math.PI / 2, 0]} />
        <Wall width={length} position={[WALL_X, 0, centerZ]} rotation={[0, -Math.PI / 2, 0]} />
        <Wall width={WALL_X * 2} position={[0, 0, endZ]} />
        <Wall width={WALL_X * 2} position={[0, 0, BACK_Z]} rotation={[0, Math.PI, 0]} />
      </Suspense>

      <Chandeliers zs={chandelierZs} />

      {items.map((item, index) => (
        <VRItem key={item.gallery_id} item={item} index={index} />
      ))}

     
    </>
  );
};

export default VRScene;