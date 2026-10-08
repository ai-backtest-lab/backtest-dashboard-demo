import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="page-stack">
      <h1>That research view doesn’t exist.</h1>
      <p>
        This demo has three screens. Return to the overview to explore them.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Research overview
      </Link>
    </div>
  );
}
