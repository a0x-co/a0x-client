"use client";

import Image from "next/image";
import Link from "next/link";
import { FaTwitter, FaTelegram, FaLinkedin } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="w-full flex flex-col items-center justify-center p-4 bg-white">
      <div className="mb-4">
        <a
          href="https://a00-4.gitbook.io/a0x-company/terms-and-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-cyan-500 transition-colors"
        >
          Terms and Conditions
        </a>
      </div>
      <div className="flex flex-row items-center justify-center space-x-8">
        <Link href="https://a0x.co" target="_blank" rel="noopener noreferrer">
          <Image
            src="/assets/images/a0xblack.png"
            alt="a0x"
            width={56}
            height={56}
            className="w-12 h-12 md:w-14 md:h-14"
          />
        </Link>
        <Link
          href="https://x.com/a0xbot"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTwitter className="w-6 h-6 md:w-8 md:h-8 hover:text-cyan-500 transition-colors" />
        </Link>
        <Link
          href="https://t.me/a0x_co"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaTelegram className="w-6 h-6 md:w-8 md:h-8 hover:text-cyan-500 transition-colors" />
        </Link>
        <Link
          href="https://www.linkedin.com/company/a0x"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className="w-6 h-6 md:w-8 md:h-8 hover:text-cyan-500 transition-colors" />
        </Link>
        <Link
          href="https://dexscreener.com/base/0xa1a65c284a2e01f0d9c9683edeab30d0835d1362"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/assets/images/dexlogoblack.png"
            alt="Dex Screener"
            width={32}
            height={32}
            className="w-6 h-6 md:w-8 md:h-8"
          />
        </Link>
      </div>
    </footer>
  );
};
