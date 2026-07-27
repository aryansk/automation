import { animationRegistry, createAnimationDescriptor, listAnimations } from "./registry.js";
import { renderAnimationComponent } from "./components.js";
import { addAnimationMotion, addNumberCount } from "./motion.js";
import { chooseStoryAnimation, normalizeStoryMetadata } from "./story-selector.js";

export {
  animationRegistry,
  listAnimations,
  addAnimationMotion,
  addNumberCount,
  chooseStoryAnimation,
  normalizeStoryMetadata,
};

export function getAnimation(options) {
  const descriptor = createAnimationDescriptor(options);
  return Object.freeze({
    ...descriptor,
    mount(target) {
      return renderAnimationComponent(descriptor, target);
    },
    addToTimeline(timeline, target, start = 0) {
      addAnimationMotion(timeline, target, descriptor.config, start);
      return timeline;
    },
  });
}

if (typeof window !== "undefined") {
  window.HygenNewsAnimations = Object.freeze({
    getAnimation,
    listAnimations,
    normalizeStoryMetadata,
    chooseStoryAnimation,
  });
  window.getAnimation = getAnimation;
}
