import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, ready } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    if (user) {
      if (user.role === "company") router.navigate({ to: "/perfil" });
      else if (user.role === "client") router.navigate({ to: "/mi-perfil" });
      else router.navigate({ to: "/cartera" });
    } else router.navigate({ to: "/login" });
  }, [ready, user, router]);
  return null;
}
