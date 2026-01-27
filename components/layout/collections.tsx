'use client';

import clsx from "clsx";
import { Collection } from "lib/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

function createUrl(handle: string) {
  return `/collections/${handle}`;
}

function PathFilterItem({ item }: { item: Collection }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = pathname === createUrl(item.handle);
  const newParams = new URLSearchParams(searchParams.toString());
  const DynamicTag = active ? 'p' : Link;

  newParams.delete('q');

  return (
    <li className="mt-2 flex text-black dark:text-white" key={item.title}>
      <DynamicTag
        href={createUrl(item.handle)}
        className={clsx(
          'w-full text-sm underline-offset-4 hover:underline dark:hover:text-neutral-100',
          {
            'underline underline-offset-4': active
          }
        )}
      >
        {item.title}
      </DynamicTag>
    </li>
  );
}

export function FilterList({ list, title }: { list: Collection[]; title?: string }) {
  return (
    <>
      <nav>
        {title ? (
          <h3 className="hidden text-xs text-neutral-500 dark:text-neutral-400 md:block">
            {title}
          </h3>
        ) : null}
        <ul className="hidden md:block">
          {list.map((item: Collection, i) => (
            <PathFilterItem key={i} item={item} />
          ))}
        </ul>
      </nav>
    </>
  );
}

export default function Collections({ collections }: { collections: Collection[] }) {
  return <FilterList list={collections} title="Collections" />;
}