import CartModal from 'components/cart/modal';
import LogoSquare from 'components/logo-square';
import { getCollections } from 'lib/fourthwall';
import Link from 'next/link';
import { CurrencySelector } from './currency';

export async function Navbar({currency}: {currency: string}) {
  const collections = await getCollections()

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6">
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href={`/${currency}`}
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <LogoSquare />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block">
              Launch on Fourthwall!
            </div>
          </Link>
          {collections.length ? (
            <ul className="hidden gap-6 text-sm md:flex md:items-center">
              {collections.map((item) => (
                <li key={item.title}>
                  <Link
                    href={`/${currency}/collections/${item.handle}`}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
        </div>
        <div className="flex justify-end md:w-1/3 gap-4">
          <CurrencySelector currency={currency} />
          <CartModal />
        </div>
      </div>
    </nav>
  );
}
