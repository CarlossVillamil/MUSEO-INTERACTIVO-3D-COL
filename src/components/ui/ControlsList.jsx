import { CONTROLS } from './controls';

/** Lista de teclas y lo que hace cada una. */
export default function ControlsList({ className = '' }) {
  return (
    <ul className={`controls ${className}`}>
      {CONTROLS.map(({ keys, action }) => (
        <li key={action}>
          <span className="controls__keys">
            {keys.map((key) => (
              <kbd key={key}>{key}</kbd>
            ))}
          </span>
          {action}
        </li>
      ))}
    </ul>
  );
}
