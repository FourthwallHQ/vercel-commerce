import clsx from 'clsx';
import Image from 'next/image';

const useFourthwallImages = process.env.NEXT_PUBLIC_USE_FW_IMAGE_OPTIMIZATION === 'true';

type ProductImageProps = {
  src: string;
  transformedSrc: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({
  src,
  transformedSrc,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority
}: ProductImageProps) {
  if (useFourthwallImages) {
    return (
      <img
        src={transformedSrc}
        alt={alt}
        className={clsx(className, { 'absolute inset-0': fill })}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
    />
  );
}
