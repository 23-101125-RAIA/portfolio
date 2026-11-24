import React, { useEffect, useState } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

const PIXELS_PER_METER = 900;
const PADDING = 6;

const wrapLines = (ctx, text, maxPixels) => {
  const lines = [];
  let line = '';

  text.split(/\s+/).forEach((word) => {
    const attempt = line ? `${line} ${word}` : word;
    if (ctx.measureText(attempt).width > maxPixels && line) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  });

  if (line) lines.push(line);
  return lines;
};

const VRText = ({
  text,
  font,
  size,
  color,
  maxWidth = 2.6,
  align = 'left',
  anchorY = 'top',
  lineHeight = 1.3,
  position = [0, 0, 0],
}) => {
  const [label, setLabel] = useState(null);

  useEffect(() => {
    let active = true;
    let texture = null;
    const pixels = size * PIXELS_PER_METER;
    const fontSpec = `${pixels}px ${font}`;

    document.fonts
      .load(fontSpec)
      .catch(() => {})
      .then(() => {
        if (!active) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = fontSpec;

        const lines = wrapLines(ctx, text, maxWidth * PIXELS_PER_METER);
        const step = pixels * lineHeight;
        const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));

        canvas.width = Math.ceil(textWidth) + PADDING * 2;
        canvas.height = Math.ceil(step * lines.length) + PADDING * 2;

        ctx.font = fontSpec;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';
        ctx.textAlign = align;

        let x = canvas.width / 2;
        if (align === 'left') x = PADDING;
        if (align === 'right') x = canvas.width - PADDING;

        lines.forEach((line, i) => {
          ctx.fillText(line, x, PADDING + i * step + (step - pixels) / 2);
        });

        texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = 8;

        setLabel({
          texture,
          width: canvas.width / PIXELS_PER_METER,
          height: canvas.height / PIXELS_PER_METER,
        });
      });

    return () => {
      active = false;
      if (texture) texture.dispose();
    };
  }, [text, font, size, color, maxWidth, align, lineHeight]);

  if (!label) return null;

  let offsetX = 0;
  if (align === 'left') offsetX = label.width / 2;
  if (align === 'right') offsetX = -label.width / 2;

  let offsetY = 0;
  if (anchorY === 'top') offsetY = -label.height / 2;
  if (anchorY === 'bottom') offsetY = label.height / 2;

  return (
    <mesh position={[position[0] + offsetX, position[1] + offsetY, position[2]]}>
      <planeGeometry args={[label.width, label.height]} />
      <meshBasicMaterial map={label.texture} transparent toneMapped={false} />
    </mesh>
  );
};

export default VRText;