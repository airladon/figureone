An equation is a set of terms and operators arranged to make some mathematical statement.

Consider the equation:

`a = b + c`

Where the terms and operators are:
* terms: `a`, `b`, `c`
* operators: `=`, `+`

An equation can have different **forms**. One form is above, but it can be rearranged into a different form:

`a - b = c`

If FigureOne, an equation is a collection ({@link DiagramElementCollection}) of **terms** and **operators** (which are {@link DiagramElementPrimitive}s). A **form** defines the layout of terms and operators to create an equation. An equation can have many forms, and animation can be used to move between forms.

As the equation, terms and operators are all {@link DiagramElement}s, then they have all the same interactivety and animation abilities as shapes and text.


### <a id="equation-boilerplate"></a> Equation Boilerplate
To test examples within the 'Equation' section of the API reference create an `index.html` file and `index.js` file.

All examples are snippets which can be appended to the end of the `index.js` file.

```html
<!-- index.html -->
<!doctype html>
<html>
<body>
    <div id="figureOneContainer" style="width: 800px; height: 800px; background-color: white;">
    </div>
    <script type="text/javascript" src='https://cdn.jsdelivr.net/npm/figureone@0.2.3/figureone.min.js'></script>
    <script type="text/javascript" src='./index.js'></script>
</body>
</html>
```

```javascript
// index.js
const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6]});
```

### Quick Start

First let's create an equation, with red as the default color:
```javascript
const equation = diagram.create.equation({ color: [1, 0, 0, 1] });
```

Next lets add the definitions for the terms and operators, or the equation elements. The keys of the object are unique identifiers that will be used in the equation forms to layout the elements appropriately. The values of the object are the text to display in the equation, or objects that define the text with additional options including formatting.
```javascript
equation.addElements({
  a: 'a',
  b: 'b',
  c: { text: 'c', color: [0, 0, 1, 1] },
  equals: ' = ',
  times: ' \u00D7 ',
});
```

The simplest form defintion is one that lays out the elements in a line. Here the array values are the unique identifiers (the keys) of the `addElements` object:

```javascript
equation.addForms({
  a: ['a', 'equals', 'b', 'times', 'c'],
});
```

An array of elements is called an *equation phrase*. In the example above, the form is a simple phrase, but in more complicated examples there may be several nested phrases.

Finally, we can add the equation to the diagram and show the form:

```javascript
diagram.add('equation', equation);
equation.showForm('b');
```

![](./tutorials/equation/simple.png)

### Symbols and Equation Functions

Mathematics has many special symbols that operate on terms, or annotate an equation. These symbols usually have a special layout relative to the terms they operate on.

FigureOne treats symbols like any other equation element, and uses {@link DiagramElementPrimitive}s to draw them. FigureOne then provides a series of functions that can layout terms around these symbols.

Let's take the equation from the last example, and show the form as a fraction.

Start by adding a vinculum symbol (with id 'v') to the equation's elements:

```javascript
equation.addElements({
  v: { symbol: 'vinculum'},
});
```

The `equation` is a {@link DiagramElementCollection} with an `eqn` property that contains equation specific information, such as forms and special layout functions, such as `frac`. Let's use this to add the form:

```javascript
const e = equation.eqn.functions;
equation.addForms({
  b: ['b', 'equals', e.frac(['a', 'v', 'c'])],
});
```

Finally, we can display the form:
```javascript
equation.showForm('b');
```

![](./tutorials/equation/fraction.png)

Combine all the steps above gives:
```javascript
const equation = diagram.create.equation({ color: [1, 0, 0, 1] });
equation.addElements({
  a: 'a',
  b: 'b',
  c: 'c',
  v: { symbol: 'vinculum'},
  equals: ' = ',
  times: ' \u00D7 ',
});

const e = equation.eqn.functions;
equation.addForms({
  a: ['a', 'equals', 'b', 'times', 'c'],
  b: ['b', 'equals', e.frac(['a', 'v', 'c'])],
});

diagram.add('equation', equation);
equation.showForm('a');
```

### Equation Animation

Equations can animate between forms. For example, to animate from form `a` to `b` in the equation above:

```javascript
equation.showForm('a');
equation.goToForm({
  form: 'b',
  animate: 'move',
  duration: 2,
});
```

![](./tutorials/equation/linear.gif)

The animation can be improved by moving the terms of the equation in curves instead of linearly. To do this we can use the object definition of a form that also defines translation animation properties:

```javascript
equation.addForms({
  bCurve: {
    content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
    animation: {
      translation: {
        a: { style: 'curve', direction: 'up', mag: 0.8 },
        b: { style: 'curve', direction: 'down', mag: 1.2 },
      },
    },
  },
});

equation.showForm('a');
equation.goToForm({
  form: 'bCurve',
  animate: 'move',
  duration: 2,
  delay: 1,
});
```

![](./tutorials/equation/curved.gif)


### Object Definition
Similar to shapes and text, the same equation above can be defined with an options object. For complicated equations, options objects can be used with code folding in an IDE to more easily read and navigate an equation definition. Also, because object form is JSON compatible, complex equations can be easily shared.

```javascript
diagram.addElement(
  {
    name: 'equation',
    method: 'equation',
    options: {
      color: [1, 0, 0, 1],
      font: { size: 0.2 },
      elements: {
        a: 'a',
        b: 'b',
        c: 'c',
        v: { symbol: 'vinculum'},
        equals: ' = ',
        times: ' \u00D7 ',  // unicode times symbol
      },
      forms: {
        a: ['a', 'equals', 'b', 'times', 'c'],
        b: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
        bCurve: {
          content: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
          animation: {
            translation: {
              a: { style: 'curve', direction: 'up', mag: 0.8 },
              b: { style: 'curve', direction: 'down', mag: 1.2 },
            },
          },
        },
      },
    },
  },
);
const equation = diagram.getElement('equation')
equation.showForm('a');
```

### Equation highlighting and interactivity

Just like any {@link DiagramElement}, an equation or its elements can be pulsed, touched or moved.

For example, an element can be pulsed:
```javascript
// Pulse the c element
equation.showForm('b')
equation._c.pulse({ scale: 2, yAlign: 'top' });
```

![](./tutorials/equation/pulse.gif)

An element can be touched:
```javascript
equation.showForm('b')
equation._c.setTouchable();
equation._c.onClick = () => { console.log('c was touched') }
```

![](./tutorials/equation/touch.gif)

And the equation can be moved:
```javascript
equation.showForm('b')
equation.setTouchableRect(0.5);
equation.setMovable();
```

![](./tutorials/equation/move.gif)

Here we are putting a buffer of 0.5 around the bounding rect of the equation to make it easy to touch and drag around.

### Managing Equations

Complicated equations can have long, complicated definitions that are hard to read.

Therefore there are several useful shortcuts when defining equations that are useful to improve readability.

#### Inline element definitions

Equation elements can all be defined in the `elements` property. However, simple elements that have the same text as the unique id that would be used to identify it can be defined inline.

For instance, we can recreate an example above as:
```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      times: ' \u00D7 ',
      equals: ' = ',
    },
    forms: {
      // 'a', 'b', and 'c' are defined inline
      1: ['a', 'equals', 'b', 'times', 'c'],
    },
  },
});
diagram.elements._eqn.showForm('1');
```

![](./tutorials/equation/inline.png)

Elements defined inline can be used in other forms:

```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      times: ' \u00D7 ',
      equals: ' = ',
      v: { symbol: 'vinculum' },
    },
    forms: {
      1: ['a', 'equals', 'b', 'times', 'c'],
      2: ['b', 'equals', { frac: ['a', 'v', 'c'] }],
    },
  },
});
diagram.elements._eqn.showForm('1');
diagram.elements._eqn.goToForm({
  form: 2,
  animate: 'move',
  delay: 1,
});
```

![](./tutorials/equation/inline_same.gif)

Even symbols can be defined inline:
```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      equals: ' = ',
    },
    forms: {
      1: ['b', 'equals', { frac: ['a', 'vinculum', 'c'] }],
    },
  },
});
diagram.elements._eqn.showForm('1');
```

Underscores have a special meaning for inline definitions.

Underscores before text will be hidden when rendered, but can make unique ids that are valid javascript object keys (a requirement for a unique id). In javascript, a space cannot be the first character of an object key, but it can be after the first character.

Underscores after text can be used to create unique identifiers and therefore used to make multiple elements with the same text. The underscore, and all text after it will not be rendered.

```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: ['2', 'a', '_ = ', 'a_1', '_ + ', 'a_2'],
    },
  },
});
diagram.elements._eqn.showForm('1');
```

![](./tutorials/equation/valid_key.png)

Underscores can also be used to give inline symbol definitions unqiue identifiers. In this case, the text before the underscore is the unique identifier, and the text after defines the symbol.
```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    forms: {
      1: ['b', '_ = ', { frac: ['a', 'v_vinculum', 'c'] }],
      2: ['c', '_ = ', { frac: ['a', 'v', 'b'] }],
    },
  },
});
diagram.elements._eqn.showForm('1');
diagram.elements._eqn.goToForm({
  form: 2,
  animate: 'move',
  delay: 1,
});
```

![](./tutorials/equation/reuse_symbol.gif)

#### Function Definitions

Function definitions can either be array definitions (an equation phrase) or object definitions. Array definitions are useful in simple definitions with minimal layout customizations. Object definitions are more readable when many options are required to customize a layout, or the input to the functions are more complicated equation phrases.

Array definitions, or equation phrases, can also be spread over several lines to increase readability.

```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      v: { symbol: 'vinculum' },
    },
    forms: {
      // Array definition for simple fraction
      1: { frac: ['a', 'v', 'b']},
      // Object definition for fraction with complex phrases
      2: {
        frac: {
          numerator: ['a', '_ + ', 'c'],
          symbol: 'v',
          denominator: ['t', { sub: ['b', '2'] }],
        },
      },
      // Array definition split over several lines
      3: {
        frac: [
          ['a', '_ + ', 'x'],
          'v',
          ['t', { sub: ['b', '3'] }],
        ],
      },
      // Object definition when additional options are needed
      4: {
        frac: {
          numerator: 'a',
          symbol: 'v',
          denominator: 'b',
          numeratorSpace: 0.07,
          denominatorSpace: 0.07,
          overhang: 0.1,
          scale: 1.5,
        },
      },
    },
    formSeries: ['1', '2', '3', '4'],
  },
});
diagram.elements._eqn.showForm('1');
const eqn = diagram.elements._eqn;
eqn.onClick = () => eqn.nextForm();
eqn.setTouchableRect(0.5);
eqn.showForm('1');
```

![](./tutorials/equation/readability.gif)

#### Phrases

Often different forms of an equation reuse equation phrases, like fractions. To make equation forms more readable, it can be useful to define a phrase once, and then refer to its identifier throughout the forms.

```javascript
diagram.addElement({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      v: { symbol: 'vinculum' },
      times: ' \u00d7 ',
      div: ' \u00f7 ',
      lb: { symbol: 'bracket', side: 'left' },
      rb: { symbol: 'bracket', side: 'right' },
    },
    phrases: {
      ac: ['a', '_ + ', 'c'],
      // Phrases can be nested
      br: { brac: ['lb', 'ac', 'rb'] },
    },
    forms: {
      1: ['d', 'times', 'br'],
      2: ['d', 'times', { bottomComment: ['br', ['div', 'b']] }],
      3: ['d', 'times', { frac: ['ac', 'v', 'b']},],
    },
    formSeries: ['1', '2', '3'],
  },
});
diagram.elements._eqn.showForm('1');
const eqn = diagram.elements._eqn;
eqn.onClick = () => eqn.nextForm();
eqn.setTouchableRect(0.5);
eqn.showForm('1');
```

![](./tutorials/equation/phrases.gif)


### Form Series

The above example uses a *form series*. A form series allows animation between equation forms using the
<a href="#equationnextform">equation.nextForm</a> and <a href="#equationprevform">equation.prevForm</a> methods.