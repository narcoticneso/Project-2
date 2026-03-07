export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 lightDir;
    varying vec4 normal;   
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
        
        //  Compute light direction (world coordinates)
        lightDir = lightPosition - vec4(vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = aNorm;
    }
`;
export let defaultFSText = `
precision mediump float;

varying vec4 lightDir;
varying vec4 normal;

void main () {

    vec3 N = normalize(normal.xyz);
    vec3 L = normalize(lightDir.xyz);

    // Determine base color from dominant axis of the normal
    vec3 aN = abs(N);
    vec3 baseColor;

    if (aN.x >= aN.y && aN.x >= aN.z) {
        baseColor = vec3(1.0, 0.0, 0.0); // ±X -> red
    } else if (aN.y >= aN.x && aN.y >= aN.z) {
        baseColor = vec3(0.0, 1.0, 0.0); // ±Y -> green
    } else {
        baseColor = vec3(0.0, 0.0, 1.0); // ±Z -> blue
    }

    // Diffuse lighting
    float diffuse = max(dot(N, L), 0.0);

    // Small ambient term
    float ambient = 0.15;

    vec3 color = baseColor * (ambient + (1.0 - ambient) * diffuse);

    gl_FragColor = vec4(color, 1.0);
}
`;
// TODO: floor shaders
export let floorVSText = ``;
export let floorFSText = ``;
//# sourceMappingURL=Shaders.js.map