import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  G,
  Ellipse,
  Circle,
  Rect,
  Path,
} from 'react-native-svg';
import { palette } from '../constants/colors';

/**
 * Brand hero graphic for the login / onboarding screens — a vector
 * illustration of the Justneed "Digital Skill ID": a verified identity card
 * orbited by celestial rings (a nod to the Saturn/Jupiter/Moon/Mercury palette).
 *
 * Pure SVG, so it's resolution-independent, themable, and tiny. Sits on the
 * indigo hero; gold + teal accents carry the brand. Decorative → hidden from
 * the screen reader (the screen provides its own labels).
 */
export interface SkillIdHeroProps {
  width?: number;
  style?: StyleProp<ViewStyle>;
}

const RATIO = 210 / 280;

export const SkillIdHero: React.FC<SkillIdHeroProps> = ({ width = 280, style }) => {
  const height = width * RATIO;

  return (
    <View
      style={style}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={width} height={height} viewBox="0 0 280 210" fill="none">
        <Defs>
          <LinearGradient id="card" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.indigoBlueHi} />
            <Stop offset="1" stopColor={palette.indigo} />
          </LinearGradient>
          <LinearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.goldSoft} />
            <Stop offset="1" stopColor={palette.goldDark} />
          </LinearGradient>
          <LinearGradient id="badge" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={palette.tealBright} />
            <Stop offset="1" stopColor={palette.teal} />
          </LinearGradient>
        </Defs>

        {/* Orbital rings (celestial motif) */}
        <G opacity={0.9}>
          <Ellipse
            cx="140" cy="105" rx="126" ry="50"
            stroke={palette.gold} strokeWidth="1" opacity={0.30}
            transform="rotate(-18 140 105)"
          />
          <Ellipse
            cx="140" cy="105" rx="98" ry="38"
            stroke={palette.indigoMid} strokeWidth="1" opacity={0.45}
            transform="rotate(-18 140 105)"
          />
          {/* planets riding the orbits */}
          <Circle cx="29" cy="83" r="4" fill={palette.gold} />
          <Circle cx="246" cy="128" r="3" fill={palette.teal} />
          <Circle cx="214" cy="49" r="2.5" fill={palette.goldSoft} opacity={0.9} />
        </G>

        {/* Sparkles */}
        <G fill={palette.gold}>
          <Path d="M52 54 c0.4 -3.5 0.7 -3.8 4 -4.2 c-3.3 -0.4 -3.6 -0.7 -4 -4.2 c-0.4 3.5 -0.7 3.8 -4 4.2 c3.3 0.4 3.6 0.7 4 4.2 Z" opacity={0.85} />
          <Path d="M232 150 c0.3 -2.6 0.5 -2.8 3 -3.1 c-2.5 -0.3 -2.7 -0.5 -3 -3.1 c-0.3 2.6 -0.5 2.8 -3 3.1 c2.5 0.3 2.7 0.5 3 3.1 Z" opacity={0.7} />
        </G>

        {/* The Skill ID card */}
        <G transform="rotate(-4 140 105)">
          {/* soft shadow plate */}
          <Rect x="69" y="64" width="146" height="92" rx="16" fill={palette.ink} opacity={0.20} />
          {/* card body */}
          <Rect x="65" y="58" width="150" height="94" rx="16" fill="url(#card)" stroke={palette.gold} strokeWidth="1.5" />

          {/* avatar */}
          <Circle cx="95" cy="92" r="16" fill="url(#gold)" />
          <Circle cx="95" cy="86" r="5.5" fill={palette.indigo} opacity={0.85} />
          <Path d="M85 100 c2 -6 18 -6 20 0 Z" fill={palette.indigo} opacity={0.85} />

          {/* name + meta lines */}
          <Rect x="120" y="82" width="74" height="9" rx="4.5" fill="#FFFFFF" opacity={0.92} />
          <Rect x="120" y="97" width="52" height="7" rx="3.5" fill="#FFFFFF" opacity={0.45} />

          {/* skill chips */}
          <Rect x="82" y="124" width="40" height="14" rx="7" fill={palette.gold} opacity={0.9} />
          <Rect x="128" y="124" width="54" height="14" rx="7" fill="#FFFFFF" opacity={0.16} />

          {/* verified badge */}
          <Circle cx="205" cy="66" r="15" fill="url(#badge)" stroke="#FFFFFF" strokeWidth="2" />
          <Path
            d="M198 66 l4.5 4.5 l8.5 -9.5"
            stroke="#FFFFFF" strokeWidth="2.6" fill="none"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </G>
      </Svg>
    </View>
  );
};
