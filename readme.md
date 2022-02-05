# WebGL Experiments

A playground for WebGL stuff

## Getting Started

```console
npm install
npm start
```

## Adding a Page

1. Create a new directory in [src/pages/](src/pages/)
2. Create an `index.js` in that directory with the following format:

```js
export const meta = {
  title: 'My Experiment',
  tags: 'threejs,gpgpu',
  slug: 'my-experiment',
}

export const init = ({ canvas, container }) => {
  // WebGL code goes here
  return () => {
    // Cleanup code goes here
  }
}
```

See [src/pages/hello-three](src/pages/hello-three) for a very basic example.

You can also supply an `options` export to customize the page. For example, you can create a shadertoy-like environment where you only need to supply the shader code:

```js
import fs from './fs.glsl'
import vs from './vs.glsl'
...
export const options = {
  type: 'shadertoy',
  shadertoy: {
    vs,
    fs
  },
}
```

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)
