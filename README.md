# tenori-on-alike

A musical grid sequencer based on the Tenori-on from Yamaha, using Ractive JS and the Web Audio API.

It's very early days, so what's here is a basic proof of concept with a very limited feature set and highly ropey code quality.

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