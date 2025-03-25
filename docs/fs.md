# Coords

gl_fragCoord:

```
^ screen space Y
| 
|
|
+-----------> screen space X
0.5,0.5
```

Generally we want to work in UV-ish coords, so we can divide by the viewport resolution (BL=(0,0),BR=(1,0),...).
