import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

export type ImageInput = string | ImageMetadata;

export interface ResponsiveImage {
  src: string;
  srcset?: string;
  width?: number;
  height?: number;
}

const WIDTHS = [640, 960, 1440, 1920];

/* Imported images get a WebP srcset; plain public paths pass through unchanged. */
export async function responsiveImage(input: ImageInput, quality = 82): Promise<ResponsiveImage> {
  if (typeof input === 'string') return { src: input };
  const widths = WIDTHS.filter((width) => width < input.width).concat(input.width);
  const variants = await Promise.all(
    widths.map((width) => getImage({ src: input, width, format: 'webp', quality })),
  );
  return {
    src: variants[variants.length - 1].src,
    srcset: variants.map((variant, index) => `${variant.src} ${widths[index]}w`).join(', '),
    width: input.width,
    height: input.height,
  };
}

/* Article media never exceeds the reading column. */
export const ARTICLE_IMAGE_SIZES = '(min-width: 50rem) 45rem, 100vw';
