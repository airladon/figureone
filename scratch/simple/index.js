const figure = new Fig.Figure({
  limits: [-1.5, -1.5, 3, 3],
  color: [1, 0, 0, 1],
  lineWidth: 0.01,
  font: { size: 0.1 },
});
// const figure = new Fig.Figure();

// Create the shape
figure.add(
  {
    name: 'tri',
    method: 'triangle',
    options: {
      width: 1,
      height: 1,
      color: [1, 0, 0, 1],
    },
  },
);

// Animate the shape
figure.getElement('tri').animations.new()
  .position({ target: [0.8, 0], duration: 1 })
  .rotation({ target: Math.PI, duration: 2 })
  .position({ target: [0, 0], duration: 1 })
  .start();