import { useSession } from "../context/SessionContext";
import Account from "../components/Account";
import { AppText } from "@/components/AppText";

export default function Profile() {
  const { session } = useSession();

  if (!session) {
    return <AppText>Loading...</AppText>;
  }

  return <Account key={session.user.id} session={session} />;
}