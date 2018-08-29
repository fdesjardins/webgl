# Point Light

---

This example is a little more complex, and shows how to perform data binding
using regular form inputs, React, and Three.js.

<div className="row">
  <div className="col-md-3">
    <div className="form-group">
      <label>Object Properties</label>
      <ObjectProperties color='ffffff'/>
    </div>
    <div className="form-group">
      <label>Light Properties</label>
      <LightProperties color='ffffff'/>
    </div>
  </div>
  <div className="col-md-9">
    <canvas/>
  </div>
</div>

Unfortunately, the markdown parser used, Marksy, is somewhat limited in it's
ability to mix Markdown syntax, JSX, and HTML, so most of the markup for more
complex examples must be written with pure JSX/HTML.
