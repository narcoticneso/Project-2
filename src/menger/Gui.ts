import { Camera } from "../lib/webglutils/Camera.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { MengerSponge } from "./MengerSponge.js";
import { Mat4, Vec3 } from "../lib/TSM.js";

/**
 * Might be useful for designing any animation GUI
 */
interface IGUI {
  viewMatrix(): Mat4;
  projMatrix(): Mat4;
  dragStart(me: MouseEvent): void;
  drag(me: MouseEvent): void;
  dragEnd(me: MouseEvent): void;
  onKeydown(ke: KeyboardEvent): void;
}

/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI implements IGUI {
  private static readonly rotationSpeed: number = 0.05;
  private static readonly zoomSpeed: number = 0.1;
  private static readonly rollSpeed: number = 0.1;
  private static readonly panSpeed: number = 0.1;

  private camera: Camera;
  private dragging: boolean;
  private fps: boolean;
  private prevX: number;
  private prevY: number;

  private height: number;
  private width: number;

  private sponge: MengerSponge;
  private animation: CanvasAnimation;

  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   * @param sponge required for some of the controls
   */
  constructor(
    canvas: HTMLCanvasElement,
    animation: CanvasAnimation,
    sponge: MengerSponge
  ) {
    this.height = canvas.height;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;

    this.sponge = sponge;
    this.animation = animation;

	this.reset();

    this.registerEventListeners(canvas);
  }

  /**
   * Resets the state of the GUI
   */
  public reset(): void {
    this.fps = false;
    this.dragging = false;
    /* Create camera setup */
    this.camera = new Camera(
      new Vec3([0, 0, -6]),
      new Vec3([0, 0, 0]),
      new Vec3([0, 1, 0]),
      45,
      this.width / this.height,
      0.1,
      1000.0
    );
  }

  /**
   * Sets the GUI's camera to the given camera
   * @param cam a new camera
   */
  public setCamera(
    pos: Vec3,
    target: Vec3,
    upDir: Vec3,
    fov: number,
    aspect: number,
    zNear: number,
    zFar: number
  ) {
    this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
  }

  /**
   * Returns the view matrix of the camera
   */
  public viewMatrix(): Mat4 {
    return this.camera.viewMatrix();
  }

  /**
   * Returns the projection matrix of the camera
   */
  public projMatrix(): Mat4 {
    return this.camera.projMatrix();
  }

  /**
   * Callback function for the start of a drag event.
   * @param mouse
   */
  public dragStart(mouse: MouseEvent): void {
    this.dragging = true;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
  }

  //Note: ensure that the keyboard callbacks
  //in Gui.ts from 1 to 4 generates and displays
  //a Menger sponge of the appropriate level L
  //The geometry should only be recreated when one
  //of these keys is pressed
  //-- do not procedurally generate the cube every frame! 
  //(Hint: any time you change the vertex or triangle list, 
  // you need to inform WebGL about the new data by binding 
  //the vertex and triangle VBOs using gl.bindBuffer, passing 
  //the new data to the GPU using gl.bufferData, etc.)
  //The skeleton code will do most of this for you,
  //if you slot in your Menger-generation code in the right place.

  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  public drag(mouse: MouseEvent): void {
    //Return if not dragging
    if (!this.dragging) {
      return;
    }
    //Converting screen motion into a world-space vector
    //Returns the camera's right direction vector
    //Note that these are all vec3s
    let right_vector = this.camera.right(); 
    //Returns the camera's up direction vector
    let up_vector = this.camera.up();
    //Returns the camera's forward direction vector
    let forward_vector = this.camera.forward();
    //Compute how far the mouse has moved in x and y directions
    let deltaX = mouse.screenX - this.prevX;
    let deltaY = mouse.screenY - this.prevY;
    //Update to the current position
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
    //Store screen coordinates in mouse_direction
    let mouse_direction = new Vec3([deltaX, deltaY, 0]);
    //Calculating a corresponding vector in world coordinates
    //.scale and .add must be used due to right_vector and up_vector
    //being vec3s. Normal arithmetic doesn't work out
    //So the .scale() and .add functions, from vec3, are used
    let world_coordinates = right_vector.scale(deltaX).subtract(up_vector.scale(deltaY));
    //Camera axis should be perpendicular to world coords and the
    //look direction (which is forward)
    let camera_axis = Vec3.cross(world_coordinates, forward_vector);
    //On left click... (left mouse drag implementation)
    if (mouse.buttons == 1){

        //Rotate by an angle of rotation_speed radians each frame that the mouse is dragged.
        this.camera.rotate(camera_axis, GUI.rotationSpeed);
    }
    //On right click... (right mouse drag implementation)
    //Implement a zoom function when right-clicking and dragging the mouse
    else if (mouse.buttons == 2){
        //Dragging the mouse vertically upward should zoom in
        //I.e. decrease the camera distance
         if (deltaY < 0){
          //offsetDist might be heplful here
          //parameter dt is the change in distance bewteen the camera and target
          //Positve dt moves the camera farther from target.
          //Negative dt moves the camera closer to targert.
          this.camera.offsetDist(-GUI.zoomSpeed);
         }
        //Dragging the mouse vertically downward should zoom out
        else if (deltaY > 0){
          this.camera.offsetDist(GUI.zoomSpeed);
        }
    }
    
  }

  /**
   * Callback function for the end of a drag event
   * @param mouse
   */
  public dragEnd(mouse: MouseEvent): void {
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
  }

  /**
   * Callback function for a key press event
   * @param key
   */
  public onKeydown(key: KeyboardEvent): void {
    /*
       Note: key.code uses key positions, i.e a QWERTY user uses y where
             as a Dvorak user must press F for the same action.
       Note: arrow keys are only registered on a KeyDown event not a
       KeyPress event
       We can use KeyDown due to auto repeating.
     */

	// TOOD: Your code for key handling

  this.fps = true;
  
  if (
    key.code === "ArrowLeft" || key.code === "ArrowRight" || key.code === "ArrowUp" || key.code === "ArrowDown"
  ) {
    key.preventDefault();
  }

    switch (key.code) {
		case "KeyW": {
        if (this.fps) {
          this.camera.offset(this.camera.forward(), -GUI.zoomSpeed, true);
        }

        break;
      }
      case "KeyA": {
        if (this.fps) {
          this.camera.offset(this.camera.right(), -GUI.zoomSpeed, true);
        }

        break;
      }
      case "KeyS": {
        if (this.fps) {
          this.camera.offset(this.camera.forward(), GUI.zoomSpeed, true);
        }

        break;
      }
      case "KeyD": {
        if (this.fps) {
          this.camera.offset(this.camera.right(), GUI.zoomSpeed, true);
        }

        break;
      }
      case "KeyR": {
        this.animation.reset();

        break;
      }
      case "ArrowLeft": {
        this.camera.roll(GUI.rollSpeed, false);

        break;
      }
      case "ArrowRight": {
        this.camera.roll(GUI.rollSpeed, true);

        break;
      }
      case "ArrowUp": {
        if (this.fps) {
          this.camera.offset(this.camera.up(), GUI.panSpeed, true);
        }

        break;
      }
      case "ArrowDown": {
        if (this.fps) {
          this.camera.offset(this.camera.up(), -GUI.panSpeed, true);
        }

        break;
      }
      case "Digit1": {
        this.sponge.setLevel(0);
        this.fps = true;

        break;
      }
      case "Digit2": {
        this.sponge.setLevel(1);
        this.fps = true;

        break;
      }
      case "Digit3": {
        this.sponge.setLevel(2);
        this.fps = true;

        break;
      }
      case "Digit4": {
        this.sponge.setLevel(3);
        this.fps = true;

        break;
      }
      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }

  /**
   * Registers all event listeners for the GUI
   * @param canvas The canvas being used
   */
  private registerEventListeners(canvas: HTMLCanvasElement): void {
    /* Event listener for key controls */
    window.addEventListener("keydown", (key: KeyboardEvent) =>
      this.onKeydown(key)
    );

    /* Event listener for mouse controls */
    canvas.addEventListener("mousedown", (mouse: MouseEvent) =>
      this.dragStart(mouse)
    );

    canvas.addEventListener("mousemove", (mouse: MouseEvent) =>
      this.drag(mouse)
    );

    canvas.addEventListener("mouseup", (mouse: MouseEvent) =>
      this.dragEnd(mouse)
    );

    /* Event listener to stop the right click menu */
    canvas.addEventListener("contextmenu", (event: any) =>
      event.preventDefault()
    );
  }
}

