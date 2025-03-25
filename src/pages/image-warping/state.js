import { create } from 'zustand'

const store = create((set) => ({
  fov: 30,
  position: [0, 0, -0.1],
}))

export default store
