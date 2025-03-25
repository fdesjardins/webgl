uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCameraPosition;
uniform vec3 iCameraDirection;

const int MaxIterations = 24;
const float Bailout = 2.0;

// vec3 juliaQuaternion(vec3 p, vec4 c) {
//     return vec3(
//         p.x*p.x - p.y*p.y - p.z*p.z + c.x,
//         2.0*p.x*p.y + c.y*p.z - c.z*p.y,
//         2.0*p.x*p.z + c.y*p.y + c.z*p.x - c.w*p.z
//     );
// }

// float mandelbulb(vec3 p) {
//     vec3 z = p;
//     float dr = 1.0;
//     float r = 0.0;

//     for (int i = 0; i < MaxIterations; i++) {
//         r = length(z);
//         if (r > Bailout) break;

//         float theta = acos(z.z / r);
//         float phi = atan(z.y, z.x);
//         dr = pow(r, float(MaxIterations) - 1.0) * float(MaxIterations) * dr + 1.0;

//         float time = iTime*10.0;
//         vec4 c = vec4(cos(time), sin(time), cos(time), sin(time));
//         z = juliaQuaternion(z, c);
//         z = vec3(sin(theta*float(MaxIterations))*cos(phi*float(MaxIterations)), sin(theta*float(MaxIterations))*sin(phi*float(MaxIterations)), cos(theta*float(MaxIterations))) * r - p;
//     }

//     return 0.5*log(r)*r/dr;
// }

// Function to compute the quaternion Julia set of a point p using a constant c
vec3 juliaQuaternion(vec3 p, vec4 c) {
    return vec3(
        p.x*p.x - p.y*p.y - p.z*p.z + c.x,
        2.0*p.x*p.y + c.y*p.z - c.z*p.y,
        2.0*p.x*p.z + c.y*p.y + c.z*p.x - c.w*p.z
    );
}

// Function to compute the signed distance to the Mandelbulb at point p
float mandelbulb(vec3 p) {
    vec3 z = p;
    float dr = 1.0;
    float r = 0.0;

    for (int i = 0; i < MaxIterations; i++) {
        // Compute the distance to the origin and check if the point has escaped
        r = length(z);
        if (r > Bailout) break;

        // Compute the polar coordinates of the point
        float theta = acos(z.z / r);
        float phi = atan(z.y, z.x);

        float time = iTime*1000.0;

        // Compute the derivative of the distance function at the point
        dr = pow(r, float(MaxIterations) - 1.0) * float(MaxIterations) * dr + 1.0;

        // Compute the next point in the Mandelbulb sequence using quaternion Julia sets
        vec4 c = vec4(cos(time*0.1), sin(time*0.1), cos(time*0.1), sin(time*0.1));
        z = juliaQuaternion(z, c);
        z = vec3(sin(theta*float(MaxIterations))*cos(phi*float(MaxIterations)), sin(theta*float(MaxIterations))*sin(phi*float(MaxIterations)), cos(theta*float(MaxIterations))) * r - p;
    }

    // Return the signed distance to the Mandelbulb
    return 0.5*log(r)*r/dr;
}

// void main() {
//     vec2 uv = (2.0*gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
//     uv.x *= iResolution.x / iResolution.y;

//     vec3 cameraPos = vec3(0.0, 1.0, 3.0);
//     vec3 cameraDir = normalize(vec3(uv, -1.0));
//     vec3 cameraRight = normalize(cross(vec3(0.0, 1.0, 0.0), cameraDir));
//     vec3 cameraUp = normalize(cross(cameraDir, cameraRight));

//     vec3 rayDir = normalize(cameraDir + 0.05*cameraRight*uv.x + 0.05*cameraUp*uv.y);
//     vec3 rayPos = cameraPos;

//     float dist = 0.0;
//     float totalDist = 0.0;
//     for (int i = 0; i < 128; i++) {
//         dist = mandelbulb(rayPos);
//         totalDist += dist;
//         rayPos += dist*rayDir;
//         if (dist < 0.01) break;
//     }

//     vec3 color = vec3(0.0);
//     if (dist < 0.01) {
//         float ambient = 0.2;
//         float diffuse = max(dot(rayDir, normalize(vec3(-1.0, -1.0, -1.0))), 0.0);
//         float specular = pow(max(dot(reflect(rayDir, normalize(vec3(-1.0, -1.0, -1.0))), normalize(cameraPos - rayPos)), 0.0), 16.0);
//         color = vec3(ambient + 0.5*diffuse + 0.3*specular);
//     }

//     gl_FragColor = vec4(color, 1.0);
// }

void main() {
    // Compute the normalized coordinates of the fragment
    vec2 uv = (2.0*gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    uv.x *= iResolution.x / iResolution.y;

    // Compute the camera position, direction, right vector, and up vector
    // vec3 cameraPos = vec3(0.0, 0.0, 4.0);
    vec3 cameraPos = iCameraPosition;
    vec3 cameraDir = normalize(vec3(uv, -1.0));
    vec3 cameraRight = normalize(cross(vec3(0.0, 1.0, 0.0), cameraDir));
    vec3 cameraUp = normalize(cross(cameraDir, cameraRight));

    // Compute the direction and position of the ray from the camera to the fragment
    vec3 rayDir = normalize(cameraDir + 0.05*cameraRight*uv.x + 0.05*cameraUp*uv.y);
    vec3 rayPos = cameraPos;

    // Compute the total signed distance along the ray
    float dist = 0.0;
    float totalDist = 0.0;
    for (int i = 0; i < 128; i++) {
        dist = mandelbulb(rayPos);
        totalDist += dist;
        rayPos += dist * rayDir;

        if (abs(dist) < 0.0001) break;
    }

    // Compute the surface normal at the intersection point
    vec3 normal = normalize(vec3(
        mandelbulb(rayPos + vec3(0.001, 0.0, 0.0)) - mandelbulb(rayPos - vec3(0.001, 0.0, 0.0)),
        mandelbulb(rayPos + vec3(0.0, 0.001, 0.0)) - mandelbulb(rayPos - vec3(0.0, 0.001, 0.0)),
        mandelbulb(rayPos + vec3(0.0, 0.0, 0.001)) - mandelbulb(rayPos - vec3(0.0, 0.0, 0.001))
    ));

    // Compute the diffuse and specular contributions to the color
    vec3 color = vec3(0.0);
    vec3 lightDir = normalize(vec3(0.0, 1.0, -1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);
    float specular = pow(max(dot(reflect(rayDir, normalize(vec3(-1.0, -1.0, -1.0))), normalize(cameraPos - rayPos)), 0.0), 16.0);
    color += vec3(0.3, 0.2, 0.1) * diffuse;
    color += vec3(1.0) * specular;

    // Output the final color
    gl_FragColor = vec4(color, 1.0);
}

