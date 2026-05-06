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
  lline: "#E5E8EE",
} as const;

export type Theme = { dark: boolean };

export function themed(dark: boolean) {
  return {
    bg0:      dark ? T.bg0  : T.lbg0,
    bg1:      dark ? T.bg1  : T.lbg1,
    bg2:      dark ? T.bg2  : "#F2F4F8",
    bg3:      dark ? T.bg3  : "#E8EBF0",
    line:     dark ? T.line : T.lline,
    text:     dark ? T.text : "#0B0E14",
    textDim:  dark ? T.textDim  : "#5C6577",
    textFaint:dark ? T.textFaint: "#A8B0BF",
  };
}
