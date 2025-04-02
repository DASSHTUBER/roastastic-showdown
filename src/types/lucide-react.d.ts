
declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = FC<LucideProps>;
  
  // Basic UI Icons
  export const MessageCircle: LucideIcon;
  export const Settings: LucideIcon;
  export const Clock: LucideIcon;
  export const LogOut: LucideIcon;
  export const Camera: LucideIcon;
  export const CameraOff: LucideIcon;
  export const Check: LucideIcon;
  export const X: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Search: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Circle: LucideIcon;
  export const Dot: LucideIcon;
  export const GripVertical: LucideIcon;
  export const PanelLeft: LucideIcon;
  
  // Navigation
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  
  // Media Controls
  export const Play: LucideIcon;
  export const Volume: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Video: LucideIcon;
  export const VideoOff: LucideIcon;
  export const SkipForward: LucideIcon;
  export const Send: LucideIcon;
  
  // Game related
  export const Gamepad: LucideIcon;
  export const Gamepad2: LucideIcon;
  export const Dice5: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const Award: LucideIcon;
  export const Trophy: LucideIcon;
  export const Medal: LucideIcon;
  
  // User related
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const UserRound: LucideIcon;
  export const Bell: LucideIcon;
  export const Heart: LucideIcon;
  export const Star: LucideIcon;
  export const Smile: LucideIcon;
  export const LogIn: LucideIcon;
  export const Mail: LucideIcon;

  // Time related  
  export const Calendar: LucideIcon;
  export const Timer: LucideIcon;
  export const Hourglass: LucideIcon;

  // Miscellaneous
  export const Candy: LucideIcon;
  export const MessageCircleQuestion: LucideIcon;
  export const GalleryHorizontalEnd: LucideIcon;
}
