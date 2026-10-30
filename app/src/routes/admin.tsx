import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "../lib/seo";
import { AdminPage } from "../components/site/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => pageHead({ title: "Admin | BlogWien", description: "Redaktionsbereich von BlogWien.", path: "/admin", noindex: true }),
  component: AdminPage,
});
