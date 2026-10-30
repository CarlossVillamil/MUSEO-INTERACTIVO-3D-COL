import ArtifactCard from './ArtifactCard';
import PauseMenu from './PauseMenu';

/** Capa 2D superpuesta a la escena. */
export default function Interface() {
  return (
    <div className="interface">
      <ArtifactCard />
      <PauseMenu />
    </div>
  );
}
