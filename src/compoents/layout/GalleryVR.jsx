import React, { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore } from '@react-three/xr';
import VRScene from './VRScene';
import VintageButton from '../common/VintageButton';
import VintageButtonSecondary from '../common/VintageButtonSecondary';

const GalleryVR = ({ items, onExit }) => {
  const store = useMemo(
    () =>
      createXRStore({
        emulate: false,
        controller: { teleportPointer: true },
        hand: { teleportPointer: true },
      }),
    []
  );
  const [supported, setSupported] = useState(null);

  const exit = () => {
    const session = store.getState().session;
    if (session) session.end().catch(() => {});
    onExit();
  };

  const enterVR = () => {
    store.enterVR().catch((error) => console.error('Could not start VR:', error));
  };

  useEffect(() => {
    if (!navigator.xr) {
      setSupported(false);
      return;
    }
    navigator.xr
      .isSessionSupported('immersive-vr')
      .then(setSupported)
      .catch(() => setSupported(false));
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="gallery-vr" role="dialog" aria-label="VR gallery">
      <Canvas camera={{ position: [0, 1.6, 1], fov: 70, near: 0.05, far: 60 }}>
        <XR store={store}>
          <VRScene items={items} onExit={exit} />
        </XR>
      </Canvas>

      <div className="gallery-vr__close">
        <VintageButtonSecondary onClick={exit}>Close</VintageButtonSecondary>
      </div>

      <div className="gallery-vr__panel">
        {supported && <VintageButton onClick={enterVR}>Enter VR</VintageButton>}
        <p className="gallery-vr__hint">
          {supported === false
            ? 'No VR headset detected. Drag to look around and scroll to walk.'
            : 'Drag to look around and scroll to walk.'}
        </p>
      </div>
    </div>
  );
};

export default GalleryVR;