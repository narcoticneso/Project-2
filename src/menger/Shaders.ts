export let defaultVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec3 lightDir;
    varying vec3 normal;
    varying float viewDistance;
 
    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		vec4 worldPos = mWorld * vec4(vertPosition, 1.0);
		vec4 viewPos = mView * worldPos;
		gl_Position = mProj * viewPos;

		lightDir = (lightPosition - worldPos).xyz;
		normal = normalize((mWorld * vec4(aNorm.xyz, 0.0)).xyz);
		viewDistance = length(viewPos.xyz);
    }
`;

// TODO: Write the fragment shader

export let defaultFSText = `
    precision mediump float;

    varying vec3 lightDir;
    varying vec3 normal;
	varying float viewDistance;
	
    
    void main () {

        vec3 N = normalize(normal);
        vec3 L = normalize(lightDir);

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
        
        //Diffuse lighting
        float diffuse = max(dot(N, L), 0.0);

        // Small ambient term
        float ambient = 0.15;

        float distanceGradient = clamp((viewDistance - 4.0) / 36.0, 0.0, 1.0);
        float distanceFade = mix(1.0, 0.72, distanceGradient);
        vec3 color = baseColor * (ambient + (1.0 - ambient) * diffuse) * distanceFade;

        gl_FragColor = vec4(color, 1.0);
    }
`;

// TODO: floor shaders

export let floorVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec4 aNorm;

    varying vec3 vWorldPos;
	varying vec3 vNormal;
	varying vec3 vLightDir;
	varying float vViewDistance;
 
	uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		// Convert vertex to world space and then clip space
        vec4 worldPos = mWorld * vec4(vertPosition, 1.0);
        vec4 viewPos = mView * worldPos;
        gl_Position = mProj * viewPos;
        vWorldPos = worldPos.xyz;
		vNormal = normalize((mWorld * vec4(aNorm.xyz, 0.0)).xyz);
		vLightDir = (lightPosition - worldPos).xyz;
		vViewDistance = length(viewPos.xyz);
    }
`;
export let floorFSText = `
    precision mediump float;

    varying vec3 vWorldPos;
	varying vec3 vNormal;
	varying vec3 vLightDir;
	varying float vViewDistance;

    void main() {
        float tileSize = 5.0;
        float cx = mod(floor(vWorldPos.x / tileSize), 2.0);
        float cz = mod(floor(vWorldPos.z / tileSize), 2.0);
        float checker = mod(cx + cz, 2.0);
        vec3 baseColor = mix(vec3(0.92, 0.92, 0.92), vec3(0.08, 0.08, 0.08), checker);
        vec3 N = normalize(vNormal);
        vec3 L = normalize(vLightDir);
        float diffuse = max(dot(N, L), 0.0);
        float ambient = 0.2;
        float distanceGradient = clamp((vViewDistance - 6.0) / 48.0, 0.0, 1.0);
        float distanceFade = mix(1.0, 0.78, distanceGradient);
        vec3 color = baseColor * (ambient + (1.0 - ambient) * diffuse) * distanceFade;

        gl_FragColor = vec4(color, 1.0);
    }
`;
