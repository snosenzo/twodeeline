This is a project where I try to create a line-filling algorithm for pen plotting. So that I can create whatever kinds of shapes I want and fill them in different ways.

It's kind of a precursor to some kind of 2D line rendering 'engine' collection that I'm interested in for pen plotting. Wherein I can create a scene and then have it directly compileable to shapes with fills, lines, points, etc. Just spit it out to a pen plot. The idea is kind of like cell shading, but exportable to pen plot. This might not be the best way to do it, and I probably won't get there, but I'm sure it'll be interesting to explore along the way.

Anyway the 3 different iterations that have come out of this so far have been:

### Square

I wanted to start off with something simple to fill. Something that was never going to be concave and have more than 1 intersection with the scan-line. Then I thought i'd build from there. So I created a shape class that would take in the outline class and be able to draw and fill it. Then specified how much spacing for the fill lines and at what angle. Then it would be able to draw them to the screen.

- One thing that I created while doing this that is slightly unrelated, but am proud of is: gridCallback. I've done a lot of things involving laying things out in a grid in all my Processing sketches, and usually I would have to copy over or re-do everything to lay it out in a grid nicely. I'd constantly make small mistakes creating them though and would have to re-do the simple math to add padding and things like that. But, now that Javascript has become my main mode for creating sketches, I can use ~callbacks~. So I can write a function that takes all of the parameters of my grid and then does a passes proper parameters into a callback function at each space in the grid. So you can have it do things like pull different parts of an image, draw something in each box, or perform an action over an image at all those locations. It's been great!
- also explored using noise for aiming the fill lines -- which didn't turn out to be very exciting at all

### RoundShapes

Noise + ellipsoids is really what this is. Just wanted to see what odd looking shapes would look like overlapping with each other and how they would act with my fill algorithm. This is where I started to notice that it will only take the first two intersection points and draw a line between them, which caused a few of the noise-induced ellipsoids to not fill all the way. I thought it was a subtle glitch-y effect, and decided to move on.

### Ribbons

I'd been doing some sketches of line-filled ribbons and was getting excited at the prospect. I was able to adapt an old, 'physics-based' ribbon sketch from a year & a half ago to create the outline of the ribbon.
I like that the shapes have a flow to them but the form itself is a little to hard for me to control withouth reworking the ribbon.
I think it would look really nice if I could use/make an actual bezier ribbon.

### Noise Lines In box

Thought it might be interesting to have some layered noise lines in a rectangle, but didn't like it as much as i thought i would once i printed it out.
I think I did a good job at crafting the wave itself. I think it looks pretty ocean-y. Defintily could use the technique of applying a noise vector multiple times to create this kind of noise wave again.
I'm interested in maybe seeing what it would look like when applied to different polylines.
This is the first kind of vector (svg) vertex, shader that i've really dipped my hands in i guess.
Excited at the possibilities of it.

## Next Possibilities:

- apply the noise vertex 'shader' that I'm made to different shapes (ellipsoids)
  - explore creating and filling shapes at each iteration of the deformation?
- make a function that applies a function to a line (startLoc, endLoc) to warp the points between one and the other
- actually figure out how to import shapes and warp them
