import ArtifactCard from './ArtifactCard';
import Minimap from './Minimap';
import PauseMenu from './PauseMenu';
import RoomBanner from './RoomBanner';

/** Capa 2D superpuesta a la escena. */
export default function Interface() {
  return (
    <div className="interface">
      <RoomBanner />
      <Minimap />
      <ArtifactCard />
      <PauseMenu />
    </div>
  );
}
