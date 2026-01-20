import Link from 'next/link';

import LogoSquare from 'components/logo-square';

const { COMPANY_NAME, SITE_NAME } = process.env;

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  const copyrightDate = 2023 + (currentYear > 2023 ? `-${currentYear}` : '');
  const copyrightName = COMPANY_NAME || SITE_NAME || '';

  return (
    <footer className="text-sm text-neutral-500 dark:text-neutral-400">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 border-t border-neutral-200 px-6 py-12 text-sm md:flex-row md:gap-12 md:px-4 min-[1320px]:px-0 dark:border-neutral-700">
        <div>
          <Link className="flex items-center gap-2 text-black md:pt-1 dark:text-white" href="/">
            <LogoSquare size="sm" />
            <span className="uppercase">{SITE_NAME}</span>
          </Link>
        </div>
        <div className="md:ml-auto">
          <a
            className="flex h-8 w-max flex-none items-center justify-center rounded-md border border-neutral-200 bg-white text-xs text-black dark:border-neutral-700 dark:bg-black dark:text-white"
            aria-label="Deploy on Vercel"
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFourthwallHQ%2Fvercel-commerce"
          >
            <span className="px-3">▲</span>
            <hr className="h-full border-r border-neutral-200 dark:border-neutral-700" />
            <span className="px-3">Deploy</span>
          </a>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-6 text-sm dark:border-neutral-700">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link href="/pages/privacy-policy" className="hover:text-black dark:hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/pages/terms-of-service" className="hover:text-black dark:hover:text-white">
              Terms of Service
            </Link>
            <Link href="/pages/returns-faq" className="hover:text-black dark:hover:text-white">
              Returns & FAQ
            </Link>
            <Link href="/pages/contact" className="hover:text-black dark:hover:text-white">
              Contact
            </Link>
          </div>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-400 md:inline-block" />
          <p className="md:ml-auto">
            <a href="https://fourthwall.com" className="text-black dark:text-white">
              Created by Fourthwall
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-6 text-sm dark:border-neutral-700">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1 px-4 md:flex-row md:gap-0 md:px-4 min-[1320px]:px-0">
          <p>
            &copy; {copyrightDate} {copyrightName}
            {copyrightName.length && !copyrightName.endsWith('.') ? '.' : ''} All rights reserved.
          </p>
          <hr className="mx-4 hidden h-4 w-[1px] border-l border-neutral-400 md:inline-block" />
          <p>
            <a href="https://github.com/FourthwallHQ/vercel-commerce">View the source</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
