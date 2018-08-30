# Point Light

---

This example is a little more complex, and shows how to perform data binding
using regular form inputs, React, and Three.js.

<div className="ui grid">
  <div className="row">
    <div className="five wide column">
      <ObjectProperties color="ffffff"/>
      <LightProperties color="ffffff"/>
    </div>
    <div className="eleven wide column">
      <canvas/>
    </div>
  </div>
</div>

Unfortunately, the markdown parser used, Marksy, is somewhat limited in it's
ability to mix Markdown syntax, JSX, and HTML, so most of the markup for more
complex examples must be written with pure JSX/HTML.
