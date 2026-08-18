import { CircleHelp, Search } from "lucide-react";

export function AppHeader() {
  return (
    <header className="hidden h-[4.25rem] items-center justify-between border-b bg-background px-8 lg:flex">
      <p className="text-sm text-muted-foreground">Operations workspace</p>
      <div className="flex items-center gap-4 text-muted-foreground">
        <Search aria-hidden="true" className="size-4" />
        <CircleHelp aria-hidden="true" className="size-4" />
        <div className="flex items-center gap-2 border-l pl-4">
          <span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
            SK
          </span>
          <span className="text-sm font-medium text-foreground">Admin</span>
        </div>
      </div>
    </header>
  );
}
