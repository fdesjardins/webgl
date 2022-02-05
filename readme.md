# WebGL Experiments

A playground for WebGL stuff

## Getting Started

```console
npm install
npm start
```

## Adding an Experiment

1. Add a new directory in `src/pages/`
2. Add an `index.js` in that directory with the following format:

```js
export const meta = {
  title: 'My Experiment',
  tags: 'threejs,gpgpu',
  slug: 'my-experiment',
  fullscreen: true,
}

export { init } from './MyExperiment'
```

3. Add a file `MyExperiment.js` in that directory that exports an `init` function:

```js
export const init = ({ canvas, container }) => {
  // WebGL code goes here
  return () => {
    // Cleanup code goes here
  }
}
```

See [src/pages/hello-three](src/pages/hello-three) for a basic template.

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)
