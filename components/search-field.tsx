"use client";

// A Client Component: it needs browser APIs (state, events), so it opts out of
// server rendering-only with the "use client" directive at the top.
// Search text lives in the URL, not in React state, so the result page is
// shareable, bookmarkable and works with the back button.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui";

export default function SearchField() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function update(next: string) {
    setValue(next);
    clearTimeout(timer.current);
     timer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (next) params.set("q", next);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`);
    }, 600);
  }

  return (
    <div className="search-box">
      <SearchIcon size={16} />
      <input
        type="search"
        placeholder="Search by name or MRN"
        aria-label="Search patients"
        value={value}
        onChange={(e) => update(e.target.value)}
      />
    </div>
  );
}
