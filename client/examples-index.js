const examples = [
  {
    tags: 'basics',
    title: 'Hello World',
    slug: 'hello-world',
    component: import('-/pages/examples/basics/hello-world'),
  },
  {
    tags: 'basics',
    title: 'Twgl.js',
    slug: 'twgljs',
    component: import('-/pages/examples/basics/twgljs'),
  },
  {
    tags: 'basics',
    title: 'Lighting',
    slug: 'lighting',
    component: import('-/pages/examples/basics/lighting'),
  },
  {
    tags: 'basics',
    title: 'Textures & Blending',
    slug: 'textures-and-blending',
    component: import('-/pages/examples/basics/textures-and-blending'),
  },
  {
    tags: 'basics',
    title: 'Loading Objects',
    slug: 'loading-objects',
    component: import('-/pages/examples/basics/loading-objects'),
  },
  {
    tags: 'threejs',
    title: 'Hello Three.js',
    slug: 'hello-threejs',
    component: import('-/pages/examples/threejs/hello-threejs'),
  },
  {
    tags: 'threejs',
    title: 'Point Light',
    slug: 'point-light',
    component: import('-/pages/examples/threejs/point-light'),
  },
  {
    tags: 'threejs',
    title: 'Video Texture',
    slug: 'video-texture',
    component: import('-/pages/examples/threejs/video-texture'),
  },
  {
    tags: 'threejs,gpgpu',
    title: 'GPU Game of Life Texture',
    slug: 'game-of-life',
    component: import('-/pages/examples/threejs/game-of-life'),
  },
  {
    tags: 'threejs',
    title: 'Winds Vizualization',
    slug: 'winds',
    component: import('-/pages/examples/advanced/winds'),
  },
  {
    tags: 'threejs',
    title: 'Drawing Axes',
    slug: 'drawing-axes',
    component: import('-/pages/examples/threejs/drawing-axes'),
  },
  {
    tags: 'threejs',
    title: 'Ray Marching Gears',
    slug: 'ray-marching',
    component: import('-/pages/examples/threejs/ray-marching'),
  },
  {
    tags: 'threejs',
    title: 'Fractal Textures',
    slug: 'fractals',
    component: import('-/pages/examples/threejs/fractals'),
  },
  {
    tags: 'threejs',
    title: 'Graphing Functions',
    slug: 'graphing',
    component: import('-/pages/examples/threejs/graphing'),
  },
  {
    tags: 'threejs',
    title: 'Oimo Physics',
    slug: 'oimophysics',
    component: import('-/pages/examples/threejs/oimophysics'),
  },
  {
    tags: 'threejs',
    title: 'Ray Casting',
    slug: 'ray-casting',
    component: import('-/pages/examples/threejs/ray-casting'),
  },
  {
    tags: 'threejs',
    title: 'Triangle Strip',
    slug: 'triangle-strip',
    component: import('-/pages/examples/threejs/triangle-strip'),
  },
  {
    tags: 'threejs',
    title: 'FPS Controls',
    slug: 'first-person-controls',
    component: import('-/pages/examples/threejs/first-person-controls'),
  },
  {
    tags: 'threejs',
    title: 'DeviceOrientation Controls',
    slug: 'device-orientation-controls',
    component: import('-/pages/examples/threejs/device-orientation-controls'),
  },
  {
    tags: 'threejs',
    title: 'Metaballs & Marching Cubes',
    slug: 'marching-cubes',
    component: import('-/pages/examples/threejs/marching-cubes'),
  },
  {
    tags: 'threejs,gpgpu',
    title: 'Smoothed-Particle Hydrodynamics',
    slug: 'sph',
    component: import('-/pages/examples/threejs/sph'),
  },
  {
    tags: 'threejs,gpgpu',
    title: 'GPU Compute Renderer',
    slug: 'gpu-compute',
    component: import('-/pages/examples/threejs/gpu-compute'),
  },
  {
    tags: 'threejs',
    title: 'Streaming Panorama Shader',
    slug: 'streaming-panorama',
    component: import('-/pages/examples/threejs/streaming-panorama'),
  },
  {
    tags: 'threejs,gpgpu',
    title: 'GPU Particles',
    slug: 'gpu-particles',
    component: import('-/pages/examples/threejs/gpu-particles'),
  },
  {
    tags: 'threejs,webvr',
    title: 'Hello WebVR',
    slug: 'hello-webvr',
    component: import('-/pages/examples/threejswebvr/hello-threejswebvr'),
  },
  {
    tags: 'threejs,webvr',
    title: 'VR Input',
    slug: 'vr-input',
    component: import('-/pages/examples/threejswebvr/vr-input'),
  },
  {
    tags: 'threejs,webvr',
    title: 'Snek',
    slug: 'snek',
    component: import('-/pages/examples/threejswebvr/snek'),
  },
  {
    tags: 'threejs,webvr',
    title: 'Child Worker',
    slug: 'child-worker',
    component: import('-/pages/examples/threejswebvr/worker'),
  },
]

export default examples
