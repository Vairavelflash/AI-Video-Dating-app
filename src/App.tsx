import { useAtom } from "jotai";
import { screenAtom } from "./store/screens";
import { Header } from "./components/Header";
import {
  IntroLoading,
  Outage,
  OutOfMinutes,
  LoginPage,
  PersonaSelection,
  VideoCall,
  Instructions,
  Conversation,
  FinalScreen,
  Settings,
} from "./screens";

function App() {
  const [{ currentScreen }] = useAtom(screenAtom);

  const renderScreen = () => {
    switch (currentScreen) {
      case "introLoading":
        return <IntroLoading />;
      case "outage":
        return <Outage />;
      case "outOfMinutes":
        return <OutOfMinutes />;
      case "loginPage":
        return <LoginPage />;
      case "personaSelection":
        return <PersonaSelection />;
      case "videoCall":
        return <VideoCall />;
      case "instructions":
        return <Instructions />;
      case "conversation":
        return <Conversation />;
      case "finalScreen":
        return <FinalScreen />;
      case "settings":
        return <Settings />;
      default:
        return <IntroLoading />;
    }
  };

  const showHeader = !["introLoading", "loginPage", "conversation"].includes(currentScreen);

  return (
    <main className="flex h-svh flex-col items-center justify-between gap-3 sm:gap-4  bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50">
      {showHeader && <Header />}
      {renderScreen()}
    </main>
  );
}

export default App;