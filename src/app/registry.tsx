"use client";

import { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";

export default function Registry({ children }: { children: React.ReactNode }) {
  const [stylesToInsert, setStylesToInsert] = useState<string[]>([]);

  useServerInsertedHTML(() => {
    if (stylesToInsert.length === 0) {
      return null;
    }

    const styles = stylesToInsert;
    setStylesToInsert([]);

    return (
      <>
        {styles.map((style, index) => (
          <style key={index} dangerouslySetInnerHTML={{ __html: style }} />
        ))}
      </>
    );
  });

  return <>{children}</>;
}
