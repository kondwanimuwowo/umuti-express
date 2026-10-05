import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/** Supabase client bound to the request cookies. Server components and actions only. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
          } catch {
            // Called from a server component, where cookies are read-only.
            // The middleware refreshes the session instead.
          }
        },
      },
    },
  );
}
