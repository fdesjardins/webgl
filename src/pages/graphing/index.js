import { init as vectorField } from './vector-field'

export const meta = {
  tags: 'threejs',
  title: 'Graphing',
  slug: 'graphing',
}

export const options = {
  display: 'fullscreen',
}

export const init = ({ canvas, container }) => {
  return vectorField({ canvas, container })
}
