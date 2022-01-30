
type Props = {
  lineColor: string,
  setLineColor: (value: string) => void,
  resetCanvas: () => void,
  stepConway: () => void,
  toggleConway: () => void,
  setFramerate: (value: number) => void,
  framerate: number
}


export const Menu = ({ lineColor, setLineColor, resetCanvas, stepConway,
  toggleConway, setFramerate, framerate }: Props) => {

  return (
    <div className="Menu">
      <label>Brush Color </label>
      <input
        type="color"
        value={lineColor}
        onInput={(e) => {
          setLineColor(e.currentTarget.value);
        }}
      />
      <button type="button" onClick={resetCanvas}>Reset</button>
      <button type="button" onClick={stepConway}>Step Conway</button>
      <button type="button" onClick={toggleConway}>Toggle Conway</button>
      <label for="Framerate">Framerate
        <input type="range" id="framerate" name="framerate"
          min="1" max="121" step="15" value={framerate}
          onInput={(e) => {
            setFramerate(e.currentTarget.valueAsNumber);
          }} />
      </label>

      <pre style={{
        // avoid layout shift
        minWidth: '3ch'
      }}>{framerate}</pre>
    </div>
  );
};
