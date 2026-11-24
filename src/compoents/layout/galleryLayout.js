import starImg from '../../assets/imgs/star.png';
import birdsImg from '../../assets/imgs/birds.png';
import flowerYellowImg from '../../assets/imgs/flower-yellow.png';
import hummingbirdImg from '../../assets/imgs/hummingbird.png';
import featherImg from '../../assets/imgs/sfeather.png';
import flowerGreenImg from '../../assets/imgs/flower-green.png';
import butterflyImg from '../../assets/imgs/butterfly.png';

export const FRAME_SLOTS = [
  { left: -1,   top: 14,   width: 12.5, rotate: -2 },
  { left: 19,   top: 18.2, width: 13.6, rotate: 6 },
  { left: 70,   top: 19.7, width: 14.3, rotate: -3 },
  { left: 89,   top: 28.8, width: 12,   rotate: 4 },
  { left: 11.7, top: 39.7, width: 17,   rotate: -4 },
  { left: 33.8, top: 51.5, width: 17.5, rotate: 2 },
  { left: 64.6, top: 37.9, width: 16,   rotate: 3 },
  { left: -1,   top: 56.8, width: 16.5, rotate: -5 },
  { left: 54,   top: 64,   width: 16.7, rotate: 5 },
  { left: 84.7, top: 57.6, width: 15,   rotate: -2 },
];

export const DECOR = [
  { id: 'hummingbird', src: hummingbirdImg,  left: 84.3, top: 18,   width: 11.5, rotate: 0,   z: 3, dur: 8,   delay: 0 },
  { id: 'feather-1',   src: featherImg,      left: 14.2, top: 30.5, width: 4.5,  rotate: -10, z: 1, dur: 9,   delay: 1 },
  { id: 'butterfly',   src: butterflyImg,    left: 3.5,  top: 41,   width: 6,    rotate: -8,  z: 3, dur: 6,   delay: 0.5 },
  { id: 'leaf-1',      src: flowerGreenImg,  left: 31.5, top: 42.9, width: 4.4,  rotate: 15,  z: 1, dur: 7,   delay: 2 },
  { id: 'flower-1',    src: flowerYellowImg, left: 77,   top: 35,   width: 11,   rotate: 0,   z: 3, dur: 10,  delay: 0.8 },
  { id: 'star-1',      src: starImg,         left: 56.5, top: 55,   width: 4.5,  rotate: 0,   z: 1, dur: 5,   delay: 0 },
  { id: 'star-2',      src: starImg,         left: 23.7, top: 62.5, width: 5,    rotate: 0,   z: 1, dur: 6,   delay: 1.5 },
  { id: 'star-3',      src: starImg,         left: 73,   top: 76.5, width: 4.4,  rotate: 0,   z: 1, dur: 5.5, delay: 0.7 },
  { id: 'leaf-2',      src: flowerGreenImg,  left: 72.5, top: 65.5, width: 4.2,  rotate: -20, z: 1, dur: 8,   delay: 1 },
  { id: 'birds',       src: birdsImg,        left: 27,   top: 74,   width: 14.5, rotate: 0,   z: 1, dur: 9,   delay: 0.3 },
  { id: 'feather-2',   src: featherImg,      left: 50.5, top: 81,   width: 5.5,  rotate: 12,  z: 1, dur: 8,   delay: 2 },
  { id: 'flower-2',    src: flowerYellowImg, left: 11.5, top: 57.5, width: 10,   rotate: 0,   z: 3, dur: 11,  delay: 1.2 },
];