import AppTabs from "../../components/AppTabs";
import { providerTabs } from "../../constants/tabs";

export default function ProviderHomeTabs() {
  return (
    <AppTabs
      tabs={providerTabs}
      iconLibrary="ionicons"
      defaultRoute="/provider/home"
    />
  );
}
