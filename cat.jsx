// A cat that wanders the desktop. Nothing here reads data, so the widget
// declares no command: it is motion and nothing else.

const DIR = 'nyan-cat';
const sprite = (file) => `${DIR}/${file}`;

const WIDTH = 120;
const HEIGHT = 84;
const SPEED = 150; // px per second
const BLOWUP_MS = 2300; // how long the explosion plays before the cat respawns
const BLOWUP_PER_SECOND = 0.05; // chance per second of walking that the cat blows up
const WANDER = 200; // how far the cat drifts vertically when it turns

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

export const initialState = {
  x: -WIDTH,
  y: Math.random() * (window.innerHeight - HEIGHT),
  facing: 'r',
  teleportFor: 0,
  jumped: true,
};

// Never returns undefined: a cat that stops wandering is a cat that has
// stopped, and the shared loop is meant to stay awake for it.
export const animate = (state, dtMs) => {
  const {width, height} = stage();

  // Blowing up: the explosion plays where the cat stood, then it respawns
  // at a random edge and walks in.
  if (state.teleportFor > 0) {
    const teleportFor = state.teleportFor - dtMs;
    if (teleportFor > 0) return {...state, teleportFor};

    const facing = Math.random() > 0.5 ? 'r' : 'l';
    return {
      x: facing === 'r' ? -WIDTH : width,
      y: Math.random() * height,
      facing,
      teleportFor: 0,
      jumped: true, // reappearing is a cut, not a walk
    };
  }

  if (Math.random() < (BLOWUP_PER_SECOND * dtMs) / 1000) {
    return {...state, teleportFor: BLOWUP_MS, jumped: true};
  }

  const x = state.facing === 'r'
    ? state.x + (SPEED * dtMs) / 1000
    : state.x - (SPEED * dtMs) / 1000;

  if (x > width || x < -WIDTH) {
    const goingRight = x < 0;
    return {
      ...state,
      x: goingRight ? -WIDTH : width,
      facing: goingRight ? 'r' : 'l',
      y: Math.min(height, Math.max(0, state.y + (Math.random() - 0.5) * WANDER)),
      jumped: false,
    };
  }

  return {...state, x, jumped: false};
};

export const className = `
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export const render = ({x, y, facing, teleportFor, jumped}) => (
  <img
    src={sprite(teleportFor > 0 ? 'catter.gif' : facing === 'l' ? 'catt.gif' : 'ca.gif')}
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
