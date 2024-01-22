# Client for museum-digital's public APIs

This repository aims to make working with [museum-digital's public APIs](https://demo.museum-digital.org/swagger/) easier. To do so, three ([Vanilla](http://vanilla-js.com/)) JavaScript classes are provided:

- *MdApi.js*
  This class provides wrappers around most of museum-digital's public APIs.
- *MdEmbed.js*
  This class provides sample elements built upon data fetched from the API.
- *MdSampleOnlineCollection.js*
  This class provides a sample implementation of a basic but usable online collection for a single museum. 

## Dependencies

The build process depends on [minify](https://github.com/tdewolff/minify), which is used to minify and combine JavaScript and CSS files. Otherwise, no external dependencies exist.

## License

Released under the MIT license.
