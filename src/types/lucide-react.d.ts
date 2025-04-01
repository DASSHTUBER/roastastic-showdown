declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = FC<LucideProps>;
  
  export const MessageCircle: LucideIcon;
  export const Settings: LucideIcon;
  export const Clock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Camera: LucideIcon;
  export const CameraOff: LucideIcon;
} 