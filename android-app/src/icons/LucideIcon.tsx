import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';

export type LucideIconName =
  | 'home'
  | 'building'
  | 'credit-card'
  | 'search'
  | 'sparkles'
  | 'user'
  | 'bell'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'lock'
  | 'check-circle'
  | 'check'
  | 'clock'
  | 'eye'
  | 'eye-off'
  | 'plus'
  | 'file-text'
  | 'laptop'
  | 'shield-check'
  | 'plane'
  | 'briefcase'
  | 'dollar-sign'
  | 'calendar'
  | 'message-square'
  | 'send'
  | 'alert-circle'
  | 'download'
  | 'x'
  | 'arrow-up-right'
  | 'arrow-down-left'
  | 'refresh-cw'
  | 'tag'
  | 'info'
  | 'smartphone'
  | 'users'
  | 'receipt';

interface LucideIconProps {
  name: LucideIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LucideIcon: React.FC<LucideIconProps> = ({
  name,
  size = 20,
  color = '#101322',
  strokeWidth = 2,
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg {...commonProps}>
          <Path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Path d="M9 22V12h6v10" />
        </Svg>
      );

    case 'building':
      return (
        <Svg {...commonProps}>
          <Rect width="16" height="20" x="4" y="2" rx="2" />
          <Path d="M9 22v-4h6v4" />
          <Path d="M8 6h.01" />
          <Path d="M16 6h.01" />
          <Path d="M12 6h.01" />
          <Path d="M12 10h.01" />
          <Path d="M12 14h.01" />
          <Path d="M16 10h.01" />
          <Path d="M16 14h.01" />
          <Path d="M8 10h.01" />
          <Path d="M8 14h.01" />
        </Svg>
      );

    case 'credit-card':
      return (
        <Svg {...commonProps}>
          <Rect width="20" height="14" x="2" y="5" rx="2" />
          <Line x1="2" x2="22" y1="10" y2="10" />
        </Svg>
      );

    case 'search':
      return (
        <Svg {...commonProps}>
          <Circle cx="11" cy="11" r="8" />
          <Path d="m21 21-4.3-4.3" />
        </Svg>
      );

    case 'sparkles':
      return (
        <Svg {...commonProps}>
          <Path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          <Path d="M5 3v4" />
          <Path d="M19 17v4" />
          <Path d="M3 5h4" />
          <Path d="M17 19h4" />
        </Svg>
      );

    case 'user':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="8" r="5" />
          <Path d="M20 21a8 8 0 0 0-16 0" />
        </Svg>
      );

    case 'users':
      return (
        <Svg {...commonProps}>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );

    case 'bell':
      return (
        <Svg {...commonProps}>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg {...commonProps}>
          <Path d="m9 18 6-6-6-6" />
        </Svg>
      );

    case 'chevron-left':
      return (
        <Svg {...commonProps}>
          <Path d="m15 18-6-6 6-6" />
        </Svg>
      );

    case 'chevron-down':
      return (
        <Svg {...commonProps}>
          <Path d="m6 9 6 6 6-6" />
        </Svg>
      );

    case 'lock':
      return (
        <Svg {...commonProps}>
          <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );

    case 'check-circle':
      return (
        <Svg {...commonProps}>
          <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <Path d="m9 11 3 3L22 4" />
        </Svg>
      );

    case 'check':
      return (
        <Svg {...commonProps}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );

    case 'eye':
      return (
        <Svg {...commonProps}>
          <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );

    case 'eye-off':
      return (
        <Svg {...commonProps}>
          <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
          <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
          <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
          <Line x1="2" x2="22" y1="2" y2="22" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg {...commonProps}>
          <Path d="M5 12h14" />
          <Path d="M12 5v14" />
        </Svg>
      );

    case 'file-text':
      return (
        <Svg {...commonProps}>
          <Path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <Path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <Path d="M10 9H8" />
          <Path d="M16 13H8" />
          <Path d="M16 17H8" />
        </Svg>
      );

    case 'laptop':
      return (
        <Svg {...commonProps}>
          <Path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
        </Svg>
      );

    case 'shield-check':
      return (
        <Svg {...commonProps}>
          <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <Path d="m9 12 2 2 4-4" />
        </Svg>
      );

    case 'plane':
      return (
        <Svg {...commonProps}>
          <Path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </Svg>
      );

    case 'briefcase':
      return (
        <Svg {...commonProps}>
          <Path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          <Rect width="20" height="14" x="2" y="6" rx="2" />
        </Svg>
      );

    case 'dollar-sign':
      return (
        <Svg {...commonProps}>
          <Line x1="12" x2="12" y1="2" y2="22" />
          <Path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg {...commonProps}>
          <Path d="M8 2v4" />
          <Path d="M16 2v4" />
          <Rect width="18" height="18" x="3" y="4" rx="2" />
          <Path d="M3 10h18" />
        </Svg>
      );

    case 'message-square':
      return (
        <Svg {...commonProps}>
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      );

    case 'send':
      return (
        <Svg {...commonProps}>
          <Path d="m22 2-7 20-4-9-9-4Z" />
          <Path d="M22 2 11 13" />
        </Svg>
      );

    case 'alert-circle':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" x2="12" y1="8" y2="12" />
          <Line x1="12" x2="12.01" y1="16" y2="16" />
        </Svg>
      );

    case 'download':
      return (
        <Svg {...commonProps}>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Path d="m7 10 5 5 5-5" />
          <Path d="M12 15V3" />
        </Svg>
      );

    case 'x':
      return (
        <Svg {...commonProps}>
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      );

    case 'arrow-up-right':
      return (
        <Svg {...commonProps}>
          <Path d="M7 7h10v10" />
          <Path d="M7 17 17 7" />
        </Svg>
      );

    case 'arrow-down-left':
      return (
        <Svg {...commonProps}>
          <Path d="M17 17H7V7" />
          <Path d="m17 7-10 10" />
        </Svg>
      );

    case 'refresh-cw':
      return (
        <Svg {...commonProps}>
          <Path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <Path d="M21 3v5h-5" />
          <Path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <Path d="M8 16H3v5" />
        </Svg>
      );

    case 'tag':
      return (
        <Svg {...commonProps}>
          <Path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <Path d="M7 7h.01" />
        </Svg>
      );

    case 'info':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 16v-4" />
          <Path d="M12 8h.01" />
        </Svg>
      );

    case 'smartphone':
      return (
        <Svg {...commonProps}>
          <Rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <Path d="M12 18h.01" />
        </Svg>
      );

    case 'receipt':
      return (
        <Svg {...commonProps}>
          <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <Path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <Path d="M12 17.5v-11" />
        </Svg>
      );

    default:
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
        </Svg>
      );
  }
};
