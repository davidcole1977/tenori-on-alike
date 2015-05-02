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

* Move codew from main.js into individual modules as appropriate
* Unit test all module code as far as possible
* Put modules in separate GitHub repositories and treat them as project dependencies (using Bower? NPM?)
* Clear separation between models and views
* Use MV* pattern / library (backbone? hand rolled?)
* Create new instruments using factory pattern with a fluent (chainable) interface
* Allow unit testing in browser context with Phantom JS
* Realtime collaboration on same instance with socket.io
* Saving sequences in local storage
* Saving sequences in cloud storage (AWS? Dropbox?)
* Visual analysis of output audio stream
* More options for instruments / synthesizer
* Mono synthesizer
* Transposing pitch / scales
* Different interval types per layer (eg. 4 notes per beat on one layer, one note per beat on another)
* Different play modes on different layers, similar to tenori-on
* Layer audio mixer with volume and pan
* Audio effects, such as reverb and chorus
