
/* Useful variables */

/**
 * The name of the widget folder.
 * You'll need this set correctly to find images and the battery script.
 * Default: zelda-battery.widget
 */
const DIR_NAME = 'art.widget'


export const command = 'echo lo'


/**
 * The polling rate/time between each update.
 * Not sure if changing this has performance effects.
 * Default: 30000 (30 seconds)
 */
export const refreshFrequency = 20

/**
 * Helper function to generate file paths.
 * Make sure the string has the correct dir name of the images.
 * Default: `${DIR_NAME}/hearts/${fileName}`
 * @param   {String} fileName The file name (eg. image.png).
 * @returns {String} filePath
 */
const heartImg = (fileName) => `${DIR_NAME}/${fileName}`

/**************************************************************
 * Things down here are a bit more advanced.                  *
 * I'll point out spots where customization might make sense. *
 **************************************************************/

/**
 * @typedef  {Object}        State
 * @property {Array[Number]} State.hearts The current state of all hearts.
 * @property {Number} State.loc
 */


/**
 * @const {State}
 * Initial state of hearts.
 * Initialized with 1.
 * 0    = Empty
 * 0.25 = Quarter
 * 0.50 = Half
 * 0.75 = Three Quarter
 * 1    = Full
 */
export const initialState = {
  hearts: Number(0),
  loc: Number(10) + 2
}

let catLocX = 10
let catLocY = 10
let count = 0
let course = 'r'

const W = 120
const H = 84


/**
 * Render method.
 * @param {State} state The state passed in
 */
export const render = (state) => {
  const {
    hearts
  } = state

  let cat

  if (count == 0) {
    if(course == 'l') {
      cat = heartImg('catt.gif')
    }
    else {
      cat = heartImg('ca.gif')
    }
  }
  else {
    cat = heartImg('catter.gif')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column',
        alignContent: 'space-between',
        marginLeft: catLocX,
        marginTop: catLocY,
      }}
    >
      <img
        src = {cat}
        height = {H}
        width = {W}
      ></img>
    </div>
  )
}

/**
 * This could potentially be optimized or slightly tweaked.
 * @param {Event} event         The event causing the state update.
 * @param {State} previousState The previous/current state rendered.
 */
export const updateState = (event, previousState) => {
  if (event.error) {
    console.error('ERROR: ', event.error)
    return previousState
  }

  const hearts = 0

  if (count == 0) {
    if(course == 'r') {
      if(catLocX < 1450) {
        catLocX += 4
        if (Math.random() > 0.999) {
          count = 115
        }
      }
      else {
        course = 'l'
        catLocY = Math.random() * 600
      }
    } else {
      if (catLocX > -150) {
        catLocX -= 4
        if (Math.random() > 0.999) {
          count = 115
        }
      }
      else {
        course = 'r'
        catLocY = Math.random() * 600
      }
    }
  }
  else {
    count -= 1
    if (count == 0) {
      if (Math.random() > 0.5) {
        catLocX = -150
        course = 'r'
      }
      else {
        catLocX = 1450
        course = 'l'
      }
      catLocY = Math.random() * 600
    }
  }




  return {
    hearts
  }
}
