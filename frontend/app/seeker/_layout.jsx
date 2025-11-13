import AppTabs from "../../components/AppTabs";
import { seekerTabs } from "../../constants/tabs";

export default function SeekersHomeTabs() {
  return (
    <AppTabs
      tabs={seekerTabs}
      iconLibrary="ionicons"
      defaultRoute="/seeker/explore"
    />
  );
}
