import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user?.role === "admin") router.navigate({ to: "/cartera" });
    else router.navigate({ to: "/login" });
  }, [user, router]);
  return null;
}
