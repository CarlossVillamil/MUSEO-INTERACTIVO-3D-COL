import MuseumScene from './scene/MuseumScene';
import InspectionScene from './scene/InspectionScene';
import Interface from './components/ui/Interface';
import './App.css';

export default function App() {
  return (
    <main className="app">
      <MuseumScene />
      <InspectionScene />
      <Interface />
    </main>
  );
}
