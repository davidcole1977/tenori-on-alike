# tenori-on-alike

A musical grid sequencer based on the Tenori-on from Yamaha, using Ractive JS and the Web Audio API.

It's very early days, so what's here is a basic proof of concept with a very limited feature set and highly ropey code quality.

It's being used as a learning exercise, so some of the use of patterns and techniques might appear slightly contrived, but should overall result in better code craft.

Watch this space...

## Demo page

[http://davidcole1977.github.io/tenori-on-alike/app/](http://davidcole1977.github.io/tenori-on-alike/app/)

(It's currently unlikely to work on anything but recent versions of Chrome and Firefox on desktop browsers)

## Dependencies
* [node](https://nodejs.org/)
* [grunt](http://gruntjs.com/)

## Basic useage

### Set up

```bash
$ npm install
$ grunt
```

App files live in `src/` and are compiled / copied into `_app/` by the grunt task. Don't edit `_app/` directly, as this will get deleted every time the default grunt task is run.

The default grunt task spins up a very basic static dev server — visit http://localhost:3000 and have a play :)

## Known issues

* Currently doesn't work on Safari.

## Roadmap / ToDo / Wish List

* Move code from main.js into individual modules as appropriate
* Unit test all module code as far as possible
* Code coverage analysis (Istanbul?)
* Put modules in separate GitHub repositories and treat them as project dependencies (using Bower? NPM?)
* Complete the refactoring of 
* Clear separation between models and views
* Nice looking visual interface with previews of each layer
* refactor the reactive instance to be prettier, nicer, more maintainable
* Use MV* pattern / library (backbone? hand rolled?)
* Create new instruments using factory pattern with a fluent (chainable) interface
* Allow unit testing in browser context with Phantom JS
* Realtime collaboration using node.js and socket.io
* Saving sequences in local storage
* Saving sequences in cloud storage (AWS? Dropbox?)
* Visual analysis of output audio stream
* More options for instruments / synthesizer
* Mono synthesizer
* Transposing pitch / scales
* Different interval types per layer (eg. 4 notes per beat on one layer, one note per beat on another)
* Different play modes on different layers, similar to tenori-on (machine gun, just play (the note sounds when you click the grid, but isn't included in the sequence / no playhead))
* Use requestanimationframe for timing sequences
* impplement playhead module / class
* Layer audio mixer with volume and pan
* Audio effects, such as reverb and chorus
* Visual effects, transitions, animations
* Continuous notes instrument option (eg. the first selected grid cell starts the note, the subsequent selected cell stops it)
* set allowable polyphony level on instrument (eg. up to 3 notes sounding at one, unlimited, monophonic)
* Get it working on and optimised for touch-based tablets.
* Capture user samples via microphone etc.
* handle audio sample async loading appropriately. use promises.
* default gain for sample-based audio should be 1. For synthesised audio, far lower (0.5?)
* finish work on sample factory
* eliminate clipping in synthesied sounds (see http://chimera.labs.oreilly.com/books/1234000001552/ch03.html#s03_4)
* pitched sample=-based instruments rather than just playing single, isolated samples (multiple samples?)