import { useEffect, useState } from 'react';
import { SRGBColorSpace, TextureLoader } from 'three';

const loader = new TextureLoader();
loader.setCrossOrigin('anonymous');

const useImageTexture = (url) => {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return undefined;
    }

    let active = true;
    let loaded = null;

    loader.load(
      url,
      (tex) => {
        if (!active) {
          tex.dispose();
          return;
        }
        tex.colorSpace = SRGBColorSpace;
        tex.anisotropy = 8;
        loaded = tex;
        setTexture(tex);
      },
      undefined,
      () => {
        if (active) setTexture(null);
      }
    );

    return () => {
      active = false;
      if (loaded) loaded.dispose();
    };
  }, [url]);

  return texture;
};

export default useImageTexture;