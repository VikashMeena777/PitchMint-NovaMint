import type { SVGMotionProps } from "framer-motion";

export interface AnimatedIconProps extends Omit<SVGMotionProps<SVGSVGElement>, "animate"> {
  size?: number | string;
  className?: string;
  animated?: boolean;
  strokeWidth?: number;
}
