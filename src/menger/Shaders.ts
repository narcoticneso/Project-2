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

// TODO: Write the fragment shader

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
        
        //Diffuse lighting
        float diffuse = max(dot(N, L), 0.0);

        // Small ambient term
        float ambient = 0.15;

        vec3 color = baseColor * (ambient + (1.0 - ambient) * diffuse);

        gl_FragColor = vec4(color, 1.0);
    }
`;

// TODO: floor shaders

export let floorVSText = `
    precision mediump float;

    attribute vec3 vertPosition;
    attribute vec3 vertColor;
    attribute vec4 aNorm;
    
    varying vec4 normal;   
 
    uniform mat4 mWorld;
    uniform mat4 mView;
	uniform mat4 mProj;

    void main () {
		//  Convert vertex to camera coordinates and the NDC
        gl_Position = mProj * mView * mWorld * vec4 (vertPosition, 1.0);
		
        //  Pass along the vertex normal (world coordinates)
        normal = vec3(0.0, 1.0, 0.0);
    }
`;
export let floorFSText = `
    precision mediump float;

    varying vec3 normal;
    attribute vec3 vertPosition;
    varying vec4 gl_position;

    void main() {
        vec3 color;

        if ((vertPosition.x >= 0 && vertPosition.z >= 0) || (vertPosition.x < 0 && vertPosition.z < 0)) {
            if ((mod(vertposition.x, 10) >= 5 && mod(vertPosition.z) >= 5) || (mod(vertPosition.x) < 5 && mod(vertPosition.z) < 5)) {
                color = vec3(0.0, 0.0, 0.0);
            }
            else {
                color = vec3(1.0, 1.0, 1.0);
            }
        }
        else {
            if ((mod(vertposition.x, 10) >= 5 && mod(vertPosition.z) >= 5) || (mod(vertPosition.x) < 5 && mod(vertPosition.z) < 5)) {
                color = vec3(1.0, 1.0, 1.0);
            }
            else {
                color = vec3(0.0, 0.0, 0.0);
            }
        }
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

