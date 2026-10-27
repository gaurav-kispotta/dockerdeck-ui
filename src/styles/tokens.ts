import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const T = {
  bg0: "#0B0E14",
  bg1: "#11151D",
  bg2: "#161B25",
  bg3: "#1E2531",
  line: "#222A38",
  lineSoft: "#1A212C",
  text: "#E6EAF2",
  textDim: "#8A93A6",
  textFaint: "#5C6577",
  cyan: "#5BC8FF",
  violet: "#9D8CFF",
  amber: "#F5B454",
  green: "#5BD4A4",
  rose: "#FF7A8A",
  lbg0: "#F6F7F9",
  lbg1: "#FFFFFF",
  lline: "#cdd0d4",
} as const;

/**
 * Ant Design ConfigProvider theme config — single source of truth for all
 * design tokens. Both Ant Design components and custom components derive
 * their colours from here so the design system is authoritative.
 */
export function antThemeConfig(isDark: boolean): ThemeConfig {
  return {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      // ── Backgrounds ──────────────────────────────────────────────
      colorBgBase:       isDark ? T.bg0      : T.lbg1,
      colorBgContainer:  isDark ? T.bg1      : T.lbg1,
      colorBgElevated:   isDark ? T.bg2      : T.lbg0,
      colorBgLayout:     isDark ? T.bg0      : T.lbg0,
      colorBgSpotlight:  isDark ? T.bg3      : '#E8EBF0',
      colorFillQuaternary: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      colorFillTertiary:   isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
      colorFillSecondary:  isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
      // ── Borders ──────────────────────────────────────────────────
      colorBorder:          isDark ? T.line     : T.lline,
      colorBorderSecondary: isDark ? T.lineSoft : '#EEF0F5',
      colorSplit:           isDark ? T.lineSoft : '#EEF0F5',
      // ── Text ─────────────────────────────────────────────────────
      colorText:           isDark ? T.text      : '#0B0E14',
      colorTextSecondary:  isDark ? T.textDim   : '#5C6577',
      colorTextTertiary:   isDark ? T.textFaint : '#A8B0BF',
      colorTextQuaternary: isDark ? '#3E4655'   : '#C5CAD4',
      // ── Semantic / accent ────────────────────────────────────────
      colorPrimary: isDark ? T.cyan   : T.violet,
      colorInfo:    T.violet,
      colorWarning: T.amber,
      colorSuccess: T.green,
      colorError:   T.rose,
      // ── Typography ───────────────────────────────────────────────
      fontFamily: 'Inter, system-ui, sans-serif',
      fontFamilyCode: 'ui-monospace, Menlo, monospace',
      fontSize: 13,
      // ── Shape ────────────────────────────────────────────────────
      borderRadius:   7,
      borderRadiusSM: 5,
      borderRadiusLG: 10,
      borderRadiusXS: 4,
      // ── Motion ───────────────────────────────────────────────────
      motionDurationFast: '0.1s',
      motionDurationMid:  '0.15s',
      motionDurationSlow: '0.2s',
    },
    components: {
      // Keep Splitter lines subtle
      Splitter: {
        splitBarSize: 4,
        splitTriggerSize: 6,
      },
    },
  };
}

export type Theme = { dark: boolean };

/**
 * Escape-hatch for non-Ant-Design elements (React Flow canvas, SVG overlays).
 * Prefer `theme.useToken()` inside React components when possible.
 */
export function themed(dark: boolean) {
  return {
    bg0:       dark ? T.bg0      : T.lbg0,
    bg1:       dark ? T.bg1      : T.lbg1,
    bg2:       dark ? T.bg2      : '#F2F4F8',
    bg3:       dark ? T.bg3      : '#E8EBF0',
    line:      dark ? T.line     : T.lline,
    text:      dark ? T.text     : '#0B0E14',
    textDim:   dark ? T.textDim  : '#5C6577',
    textFaint: dark ? T.textFaint: '#A8B0BF',
  };
}
