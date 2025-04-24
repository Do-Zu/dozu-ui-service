import Animation404 from "@/components/animations/Animation404";
import Link from "next/link";

export default function NotFoundView() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <Animation404 />
        <Link href="/">
          <button className="mt-4 px-6 py-2 rounded bg-[#00A9D7] text-white">
            Go Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
