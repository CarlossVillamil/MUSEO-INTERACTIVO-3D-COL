import ArtifactCard from './ArtifactCard';
import Minimap from './Minimap';
import PauseMenu from './PauseMenu';
import RoomBanner from './RoomBanner';
import WelcomeScreen from './WelcomeScreen';

/** Capa 2D superpuesta a la escena. */
export default function Interface() {
  return (
    <div className="interface">
      <RoomBanner />
      <Minimap />
      <ArtifactCard />
      <PauseMenu />
      <WelcomeScreen />
    </div>
  );
}
