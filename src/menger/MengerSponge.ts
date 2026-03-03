import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  // TODO: sponge data structures
  // dirty flags that track whether the geometry needs re-upload to GPU
  private dirty: boolean = true;
  private level: number = 0;

  // flat arrays holding the generated geometry for all leaf cubes
  private _positions: Float32Array = new Float32Array([]);
  private _indices: Uint32Array = new Uint32Array([]);
  private _normals: Float32Array = new Float32Array([])
  
  constructor(level: number) {
	  this.setLevel(level);
	  // TODO: other initialization	
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
      return this.dirty;
  }

  public setClean(): void {
      this.dirty = false;
  }
  
  public setLevel(level: number)
  {
	  // TODO: initialize the cube
    // rebuild geometry from scratch at requested levels
    this.level = level;
    this.dirty = true;
    this.generateGeometry();
  }

  /** ADDED: Private Helper
   * this helper separates the cube subdivision and vertex packing logic out of setLevel()
   * so the method stays clean.
   * this also avoids recomputing geometry every frame, only build it once and cache the flat arrays,
   * since positionsFlat()/indicesFlat()/normalsFlat() get called each draw()
   * iteratively subdivide cubes, then emit per face vertex data
   * each cube produces 6 face x 4 verts = 24 verts
   * also 6 faces x 2 tris = 36 indices
   */
private generateGeometry(): void {
  // start with a single cube as [minX,minY,minZ,maxX,maxY,maxZ]
  // following the pseudocode: "Start with a single cube"
  let cubes: number[][] = [[-.5, -.5, -.5, .5, .5, .5]];

  // "for i = 0 to L do" — subdivide iteratively at each level
  for (let i = 0; i < this.level; i++){
    let newCubes: number[][] = [];
    // "for each cube do"
    for (const c of cubes){
      const [mnx, mny, mnz, mxx, mxy, mxz] = c;
      // "Subdivide cube into 27 subcubes of one third the side length"
      const dx = (mxx - mnx) / 3;
      const dy = (mxy - mny) / 3;
      const dz = (mxz - mnz) / 3;

      for (let xi = 0; xi < 3; xi++){
        for (let yi = 0; yi < 3; yi++){
          for (let zi = 0; zi < 3; zi++){
            // "Delete the 7 inner subcubes"
            // a subcube is "inner" if 2 or more of its axes are the middle index
            const mid = (xi === 1 ? 1 : 0) + (yi === 1 ? 1 : 0) + (zi === 1 ? 1 : 0);
            if (mid >= 2) continue;

            newCubes.push([
              mnx + xi * dx, mny + yi * dy, mnz + zi * dz,
              mnx + (xi+1) * dx, mny + (yi+1) * dy, mnz + (zi+1) * dz
            ]);
          }
        }
      }
    }
    cubes = newCubes;
  }

  const vertCount = cubes.length * 24;
  const idxCount = cubes.length * 36;

  const pos = new Float32Array(vertCount*4); 
  const nrm = new Float32Array(vertCount*4);
  const idx = new Uint32Array(idxCount);

  let vi = 0 // write cursor for vertex
  let ii = 0; // write cursor for index

  for (const c of cubes){
    const [mnx, mny, mnz, mxx, mxy, mxz] = c;

    // 6 faces, defined by 4 corner positions (counter clock from outside) and outward normal
    const faces: {verts: number[][]; n: number[]}[] = [
      {// +X face
        verts: [[mxx, mny, mnz], [mxx, mxy, mnz], [mxx, mxy, mxz], [mxx, mny, mxz]], n: [1, 0, 0]
      },
      {// -X face
        verts: [[mnx, mny, mxz],[mnx, mxy, mxz],[mnx, mxy, mnz],[mnx, mny, mnz]], n: [-1, 0, 0]
      },
      {// +Y face
        verts: [[mnx, mxy, mxz],[mxx, mxy, mxz],[mxx, mxy, mnz],[mnx, mxy, mnz]], n: [0, 1, 0]
      },
      {// -Y face
        verts: [[mnx, mny, mnz],[mxx, mny,mnz],[mxx, mny,mxz],[mnx, mny, mxz]], n: [0, -1, 0]
      },
      {// +Z face
        verts: [[mnx, mny, mxz],[mxx, mny, mxz],[mxx, mxy, mxz],[mnx, mxy, mxz]], n: [0, 0, 1]
      },
      {// -Z face
        verts: [[mxx, mny, mnz],[mnx, mny, mnz],[mnx, mxy, mnz],[mxx, mxy, mnz]], n: [0, 0, -1]
      }
    ];
    for (const face of faces){
      const baseVert = vi;
      // emit 4 vertices for this face
      for (const v of face.verts){
        const off = vi*4;
        pos[off] = v[0];
        pos[off+1] = v[1];
        pos[off+2] = v[2];
        pos[off+3] = 1.0; // homogenous w
        nrm[off] = face.n[0];
        nrm[off+1] = face.n[1];
        nrm[off+2] = face.n[2];
        nrm[off+3] = 0.0 // direction
        vi++;
      }
      // two counter clock triangles per quad (0,1,2) & (0,2,3)
      idx[ii++] = baseVert;
      idx[ii++] = baseVert+1;
      idx[ii++] = baseVert+2;
      idx[ii++] = baseVert;
      idx[ii++] = baseVert+2;
      idx[ii++] = baseVert+3;
    }
  }
  this._positions = pos;
  this._normals = nrm;
  this._indices = idx;
}

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return this._positions;
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    return this._indices;
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return this._normals;
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();

    return ret;    
  }
  
}