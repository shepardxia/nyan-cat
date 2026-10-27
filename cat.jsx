// A cat that wanders the desktop. Nothing here reads data, so the widget
// declares no command: it is motion and nothing else.

const DIR = 'nyan-cat';
const sprite = (file) => `${DIR}/${file}`;

const WIDTH = 120;
const HEIGHT = 84;
const SPEED = 150; // px per second
const BLOWUP_MS = 2300; // how long the explosion plays before the cat respawns
const BLOWUP_PER_SECOND = 0.05; // chance per second of walking that the cat blows up

// Five steps a second, each one smoothed into the next by the CSS transition
// below. The compositor interpolates the pixels for free; stepping at frame
// rate instead would cost thirty state updates and thirty renders a second to
// draw the same walk.
export const animationFrequency = 5;
const STEP_MS = 1000 / animationFrequency;

// Read every step rather than baked in: a display can be added or its
// resolution changed while the cat is walking, and coordinates from the old
// screen strand it out of view.
const stage = () => ({
  width: window.innerWidth,
  height: Math.max(0, window.innerHeight - HEIGHT),
});

// The cat enters just off the edge behind it, at a random height.
const enter = (facing, {width, height}) => ({
  x: facing === 'r' ? -WIDTH : width,
  y: Math.random() * height,
  facing,
  blowupFor: 0,
  jumped: true, // entering is a cut, not a walk
});

export const initialState = enter('r', stage());

// Never returns undefined: a cat that stops walking is a cat that has
// stopped, and the shared loop is meant to stay awake for it.
export const animate = (state, dtMs) => {
  const screen = stage();

  // The explosion plays where the cat stood, then it respawns at a random edge.
  if (state.blowupFor > 0) {
    const blowupFor = state.blowupFor - dtMs;
    return blowupFor > 0 ? {...state, blowupFor} : enter(Math.random() < 0.5 ? 'r' : 'l', screen);
  }

  if (Math.random() < (BLOWUP_PER_SECOND * dtMs) / 1000) {
    return {...state, blowupFor: BLOWUP_MS, jumped: true};
  }

  const step = (SPEED * dtMs) / 1000;
  const x = state.facing === 'r' ? state.x + step : state.x - step;

  // Off an edge: back in from that same edge, facing the other way.
  if (x > screen.width || x < -WIDTH) return enter(state.facing === 'r' ? 'l' : 'r', screen);
  return {...state, x, jumped: false};
};

export const className = `
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const render = ({x, y, facing, blowupFor, jumped}) => (
  <img
    src={sprite(blowupFor > 0 ? 'catter.gif' : facing === 'l' ? 'catt.gif' : 'ca.gif')}
    width={WIDTH}
    height={HEIGHT}
    style={{
      position: 'absolute',
      transform: `translate(${Math.round(x)}px, ${Math.round(y)}px)`,
      transition: jumped ? 'none' : `transform ${STEP_MS}ms linear`,
      willChange: 'transform',
      imageRendering: 'pixelated',
      display: 'block',
    }}
  />
);
