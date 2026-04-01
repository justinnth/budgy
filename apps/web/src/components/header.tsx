import { Separator } from "@budgy/ui/components/separator";
import { Link } from "react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  return (
    <header>
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="font-mono text-lg font-bold tracking-wider text-foreground">
          budgy
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <Separator />
    </header>
  );
}
