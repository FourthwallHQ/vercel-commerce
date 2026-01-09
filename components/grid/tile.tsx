import clsx from 'clsx';
import Image from 'next/image';
import Label from '../label';

const useFourthwallImages = process.env.NEXT_PUBLIC_USE_FW_IMAGE_OPTIMIZATION === 'true';

export function GridTileImage({
  isInteractive = true,
  active,
  label,
  transformedSrc,
  ...props
}: {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: 'bottom' | 'center';
  };
  transformedSrc?: string;
} & React.ComponentProps<typeof Image>) {
  const imageClassName = clsx('relative h-full w-full object-contain', {
    'transition duration-300 ease-in-out group-hover:scale-105': isInteractive
  });

  return (
    <div
      className={clsx(
        'group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black',
        {
          relative: label,
          'border-2 border-blue-600': active,
          'border-neutral-200 dark:border-neutral-800': !active
        }
      )}
    >
      {props.src ? (
        useFourthwallImages && transformedSrc ? (
          <img
            src={transformedSrc}
            alt={props.alt as string}
            className={imageClassName}
            width={props.width as number}
            height={props.height as number}
            loading={props.priority ? 'eager' : 'lazy'}
          />
        ) : (
          <Image
            className={imageClassName}
            {...props}
          />
        )
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}
