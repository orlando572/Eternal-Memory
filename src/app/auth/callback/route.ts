import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNextUrl(path: string | null, origin: string) {
  try {
    const destination = new URL(path ?? "/catalogo", origin);
    return destination.origin === origin ? destination : new URL("/catalogo", origin);
  } catch {
    return new URL("/catalogo", origin);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const destination = safeNextUrl(searchParams.get("next"), origin);

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
    }

    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(new URL("/login?error=auth_callback", origin));
  }
}
