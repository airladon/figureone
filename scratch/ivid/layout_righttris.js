/* eslint-disable camelcase */
/* globals color1 */

function rightTris() {
  const label = (text, s = '', location = 'outside') => ({
    label: {
      scale: 0.7,
      offset: 0.04,
      location,
      text: {
        forms: { 0: [{ s: { text: s, color: color1 } }, text] },
      },
    },
  });

  const polyline = (name, scale, position, s) => ({
    name,
    method: 'collections.polyline',
    options: {
      points: [[0, 0], [scale, scale / 2], [scale, 0]],
      close: true,
      angle: [
        {
          curve: null,
          label: { text: '', scale: 0.6 },
          color: [0, 0, 0, 0],
        },
        { curve: { radius: 0.1 * scale, width: 0.006, autoRightAngle: true }, label: '' },
        {
          curve: {
            radius: 0.2, width: 0.006,
          },
          label: { text: '\u03b8', scale: 0.6, offset: 0.02 },
          color: color1,
        },
      ],
      side: [
        label('A', s),
        label('B', s),
        label('C', s),
      ],
      position,
    },
  });

  figure.add({
    name: 'rightTris',
    method: 'collection',
    elements: [
      polyline('tri1', 2, [-0.2, -0.5], 's'),
      polyline('tri2', 1, [-1.8, -0.5], ''),
    ],
    mods: {
      hideSides: () => {
        figure.getElement('rightTris.tri1').hideSides();
        figure.getElement('rightTris.tri2').hideSides();
      },
    },
  });
}
