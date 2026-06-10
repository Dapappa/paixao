import { ConnectionsClient } from "./connections-client";

export const metadata = {
  title: "Connections | Paixão",
  description: "Your mutual matches",
};

export default function ConnectionsPage() {
  return <ConnectionsClient />;
}
