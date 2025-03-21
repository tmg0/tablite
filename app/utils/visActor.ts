export const TABLITE_THEME = {
  name: 'TABLITE',
  underlayBackgroundColor: 'transparent',
  selectionBgColor: '#CCE0FF',

  defaultStyle: {
    color: '#09090b',
    bgColor: '#5389FF',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 12,
    padding: [0, 12, 0, 12],
  },

  headerStyle: {
    color: '#09090b',
    bgColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    fontWeight: 600,
  },

  bodyStyle: {
    color: '#27272a',
    bgColor: '#ffffff',
    borderColor: '#f4f4f5',
    hover: { cellBgColor: 'rgb(228 228 231 / 0.5)' },
  },

  columnResize: {
    lineWidth: 3,
    lineColor: '#27272a',
    bgColor: 'transparent',
    width: 3,
  },

  dragHeaderSplitLine: {
    lineColor: '#27272a',
    lineWidth: 2,
    shadowBlockColor: 'rgb(39 39 42 / 0.1)',
  },

  frozenColumnLine: {
    shadow: {
      width: 5,
      startColor: 'rgb(0 0 0 / 0.1)',
      endColor: 'transparent',
    },
  },

  selectionStyle: {
    cellBgColor: 'rgb(39 39 42 / 0.1)',
    cellBorderColor: '#27272a',
  },

  scrollStyle: {
    visible: false,
  },

  checkboxStyle: {
    checkedFill: '#27272a',
    checkedStroke: '#27272a',
  },
}
