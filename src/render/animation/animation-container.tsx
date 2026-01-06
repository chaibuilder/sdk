import "./animation-styles.css";
import { useChaiAnimation } from "./use-chai-animation";

const AnimationContainer = ({ children }) => {
  useChaiAnimation();
  return children;
};

export default AnimationContainer;
