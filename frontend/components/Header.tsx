import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <div>
      {/* Sub header */}
      <div className="flex items-center justify-center py-0.5">
        <span className="text-xs">
          An{" "}
          <a
            href="https://github.com/anish-agnihotri/friend.expert"
            target="_blank"
            rel="noopen noreferrer"
            className="hover:opacity-70 transition-opacity underline"
          >
            open-source
          </a>{" "}
          project by{" "}
          <a
            href="https://anishagnihotri.com"
            target="_blank"
            rel="noopen noreferrer"
            className="hover:opacity-70 transition-opacity underline"
          >
            Anish Agnihotri
          </a>
          .
        </span>
      </div>

      {/* Main header */}
      <div className="flex h-14 px-4 items-center bg-black">
        <div>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <Image
              src="/vectors/logo.svg"
              height={30}
              width={165}
              alt="FriendMEX logo"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
