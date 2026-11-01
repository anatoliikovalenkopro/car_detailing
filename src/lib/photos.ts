// Stock photos from Pexels (free for commercial use, no attribution required:
// https://www.pexels.com/license/). Swap any id for your own photos later —
// put files in /public/photos and use photo("/photos/your-file.jpg").

type Photo = { src: string; alt: string };

const pexels = (id: number, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

function p(id: number, alt: string, w?: number): Photo {
  return { src: pexels(id, w), alt };
}

export const HERO = p(6873121, "Black car covered in thick wash foam", 1800);
export const CTA_PHOTO = p(5693651, "Wheel covered in foam during a hand wash", 1600);
export const QUOTE_PHOTO = p(6872572, "Detailer wiping a car with a microfiber cloth", 1400);
export const SPECIAL_PHOTO = p(6870296, "Detailer machine-polishing a car", 1400);

/** One photo per service id (cards and booking thumbnails). */
export const SERVICE_PHOTOS: Record<string, Photo> = {
  "express-wash": p(20051469, "Foam being sprayed on a car"),
  "interior-refresh": p(4218867, "Wiping a car dashboard with a microfiber cloth"),
  "full-glow": p(6873020, "Brushing a car during a hand wash"),
  "deep-interior": p(5233285, "Deep cleaning a fabric car seat"),
  "decon-seal": p(6873123, "Wiping down a white car"),
  "paint-enhance": p(5233259, "Polishing the paint of a black car"),
  ceramic: p(28921496, "Water droplets beading on black paint"),
  "new-car": p(10463764, "Coating the paint of a new SUV"),
  "pre-sale": p(5233279, "Polishing a white car before sale"),
  "glow-club": p(20051469, "Monthly maintenance hand wash"),
  headlights: p(15785276, "Clear car headlight close-up"),
};
