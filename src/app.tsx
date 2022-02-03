import { useEffect, useRef, useState, useReducer } from "preact/hooks";
import { Menu } from "./menu";

const SIZE = 75;

const DEAD = "#ffffff";
//TODO : replace mouseEvents with Pointer for mobile support

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : {r:0, g:0, b:0}
}
function componentToHex(c:number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function averageColors(colors: string[]) {
  const rgbColors = colors.map(hexToRgb)
  const reducer = (previousValue:number, currentValue:number) => previousValue + currentValue
  const newR =  Math.floor(rgbColors.map(c => c?.r).reduce(reducer)/ (colors.length))
  const newG =  Math.floor(rgbColors.map(c => c?.g).reduce(reducer)/ (colors.length))
  const newB =  Math.floor(rgbColors.map(c => c?.b).reduce(reducer)/ (colors.length))
  return "#" + componentToHex(newR) + componentToHex(newG) + componentToHex(newB);
}
function averageColorsWrong(colors: string[]) {
  const sum = colors.map(color => Number.parseInt(color.slice(1), 16)).reduce((acc, e) => acc + e, 0);
  const retNum = Math.floor(sum / (colors.length));
  return "#" + retNum.toString(16).padStart(6, "0");
}
function isAlive(value: string) {
  return !!value && value !== DEAD;
}

// Any live cell with two or three live neighbours survives.
// Any dead cell with three live neighbours becomes a live cell.
// All other live cells die in the next generation. Similarly, all other dead cells stay dead.

function conway(current: string, index: number, prevConway: string[]) {
  // TODO Handle if next to edge

  const values = [index - SIZE - 1,
  index - SIZE,
  index - SIZE + 1,
  index - 1,
  index + 1,
  index + SIZE - 1,
  index + SIZE,
  index + SIZE + 1].map(e => prevConway[e])

  const aliveCount = values.filter(isAlive).length;

  if (aliveCount === 3) {
    if (isAlive(current)) {
      return current;
    }
    return averageColors(values.filter(isAlive));
  } else if (aliveCount === 2 && isAlive(current)) {
    return current;
  } else {
    return DEAD;
  }

}

const PIXEL_SIZE = 10;

export function App() {

  const isRunningRef = useRef(false);
  const [state, setState] = useState<string[]>(new Array(SIZE * SIZE).fill(DEAD));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const lineColorRef = useRef("#000000");
  const [framerate, setFramerate] = useState(1)

  const setLineColor = (color: string) => lineColorRef.current = color;

  const framerateRef = useRef(framerate);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    framerateRef.current = framerate;
    if (isRunningRef.current) {
      clearTimeout(timeoutRef.current);
      stepConway();
    }
  }, [framerate]);

  const stepperConway = () => {
    setState(pV => pV.map(conway))
  }

  const stepConway = () => {
    setState(pV => pV.map(conway))
    if (isRunningRef.current) {
      timeoutRef.current = setTimeout(stepConway, Math.floor(1000 * 1 / framerateRef.current));
    }
  }

  const toggleConway = () => {
    isRunningRef.current = !isRunningRef.current;
    if (isRunningRef.current) {
      stepConway();
    } else {
      clearTimeout(timeoutRef.current);
    }
  }

  const startDrawing = (e: MouseEvent) => {
    if (e.button == 0) {
      const canvas: HTMLCanvasElement = e.currentTarget as any;
      const { clientX, clientY } = e;
      const { x, y } = canvas.getClientRects()[0];

      const [X, Y] = [clientX - x, clientY - y].map(i => Math.floor(i / PIXEL_SIZE));

      const VALUE = X + Y * SIZE;
      setState(prevState => prevState.map((pV, i) => {
        return (i <= VALUE && VALUE < i + 1) ? lineColorRef.current : pV;
      }))
      isDrawing.current = true;
    }
  };
  // Function for ending the drawing
  const endDrawing = (e: MouseEvent) => {
    if (e.button == 0) {
      isDrawing.current = false;
    }
  };

  const draw = (e: MouseEvent) => {
    const ctx = ctxRef.current;
    if (!isDrawing.current || ctx == null) {
      return;
    }
    const canvas: HTMLCanvasElement = e.currentTarget as any;
    const { clientX, clientY } = e;
    const { x, y } = canvas.getClientRects()[0];

    const [X, Y] = [clientX - x, clientY - y].map(i => Math.floor(i / PIXEL_SIZE));


    const VALUE = X + Y * SIZE;
    setState(prevState => prevState.map((pV, i) => {
      return (i <= VALUE && VALUE < i + 1) ? lineColorRef.current : pV;
    }))
  };
  useEffect(() => {
    // STATE => Canvas
    const canvas = canvasRef.current;
    if (canvas != null) {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
      for (const [i, value] of state.entries()) {
        ctx.fillStyle = value;
        ctx.fillRect((i % SIZE) * PIXEL_SIZE, Math.floor(i / SIZE) * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)

      }

    }
  }, [state, lineColorRef.current])

  console.log((state.join('')).length)

  return (
    <div className="App">
      <h1>Live Conway's painting</h1>
      <div className="draw-area">
        <Menu
          lineColor={lineColorRef.current}
          setLineColor={setLineColor}
          resetCanvas={() => {
            setState(pv => pv.map(() => DEAD))
            isRunningRef.current = false;
          }}
          stepConway={stepperConway}
          toggleConway={toggleConway}
          framerate={framerate}
          setFramerate={setFramerate}

        />
        <canvas
          style={{ outline: '1px red solid' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}

          ref={canvasRef}
          width={SIZE * PIXEL_SIZE}
          height={SIZE * PIXEL_SIZE}
        />
      </div>
    </div>
  );
}

