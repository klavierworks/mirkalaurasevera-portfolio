import React, { RefObject, useEffect, useRef } from 'react';
import Matter, { Body } from 'matter-js';
import { start } from 'repl';

type PhysicsWrapper = {
  children: React.ReactNode;
  isActive: boolean;
  isSmall: boolean;
  isTransitioning: boolean;
  targetRef: RefObject<HTMLElement>;
};

const PhysicsWrapper = ({ children, isActive, isSmall, isTransitioning, targetRef }: PhysicsWrapper) => {
  const physicsBoxRef = useRef<Matter.Body>(null);
  useEffect(() => {
    if (!isActive || !targetRef.current) {
      return;
    }
    // Create engine
    let engine = Matter.Engine.create();
    const world = engine.world;

    // create a renderer
    var render = Matter.Render.create({
      element: document.body,
      engine: engine,
      options: {
        height: window.innerHeight,
        width: window.innerWidth,
        showAngleIndicator: true,
        background: 'transparent',
      }
    });

    const startX = targetRef.current?.offsetLeft + (targetRef.current?.clientWidth / 2) ?? 0;
    const startY = targetRef.current?.offsetTop + (targetRef.current?.clientHeight / 2) ?? 0;
    const height = isSmall ? (targetRef.current?.clientHeight / 3 ?? 0) : (targetRef.current?.clientHeight / 1.5 ?? 0);
    let box = Matter.Bodies.rectangle(
      startX,
      startY,
      10,
      height,
    );
    physicsBoxRef.current = box;
    // Add the box to the world
    Matter.World.add(world, [box]);

    // Create ground
    const ground = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth * 2, 20, { isStatic: true });
    const slope = Matter.Bodies.trapezoid(window.innerWidth * 1.1, window.innerHeight - 20, window.innerWidth , window.innerWidth / 4, 2, { isStatic: true });
    Body.scale(slope, -1, 1)
    slope.friction = 5
    ground.friction = 5
    Matter.World.add(world, ground);
    Matter.World.add(world, slope);

    if (isSmall) {
    const stand = Matter.Bodies.rectangle(window.innerWidth / 2, window.innerHeight * 0.85, 10, window.innerHeight / 4, { isStatic: true });
    Matter.World.add(world, stand);
    }

    // Run the engine
    Matter.Render.run(render);
    Matter.Runner.run(engine);

    // Update the DOM element position based on the simulation
    const update = () => {
     // console.log(startX - box.position.x, startY - box.position.y)
      if (targetRef.current) {
        targetRef.current.style.transformOrigin = 'center bottom'
        targetRef.current.style.transform = `rotateX(${box.angle}rad)`;
        targetRef.current.style.setProperty('--translateZ', startX - box.position.x + 'px')
      }
      requestAnimationFrame(update);
    };

//    window.addEventListener('click', () => {
//      Matter.Body.applyForce(box, { x: box.position.x, y: 0 }, { x: 0.001, y: 0.0 }); // Adjust force direction and magnitude here
//      Matter.Body.setAngularVelocity(box, 0.04); // This line adds rotational movement
//    });
    update();

    return () => {
      // Cleanup on component unmount
      Matter.Engine.clear(engine);
      Matter.Render.stop(render);
      render.canvas.remove();
    };
  }, [isActive, targetRef]);

  useEffect(() => {
    let box = physicsBoxRef.current;
    if (!box) {
      return;
    }
    if (!isTransitioning) {
   //   Matter.Body.setPosition(box, { x: targetRef.current?.offsetLeft ?? 0, y: targetRef.current?.offsetTop ?? 0 });
   //   Matter.Body.setAngle(box, 0);
   //   Matter.Body.setVelocity(box, {x: 0, y: 0});
   //   Matter.Body.setAngularVelocity(box, 0);
      return;
    }
  
    Matter.Body.applyForce(box, { x: box.position.x, y: box.position.y  }, { x: 0.2, y: 0.0 }); // Adjust force direction and magnitude here
    Matter.Body.applyForce(box, { x: box.position.x, y: box.position.y / 4 }, { x: 0.07, y: 0.2 }); // Adjust force direction and magnitude here
    Matter.Body.setAngularVelocity(box, 0.02); // This line adds rotational movement
}, [isTransitioning, targetRef]);

  return children;
};

export default PhysicsWrapper;
