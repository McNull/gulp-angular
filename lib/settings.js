
// The default settings

module.exports = {

  folders: {
    src: 'src',
    dest: 'public',
    vendor: 'vendor'
  },

  files: {
    vendor: {
      js: [
        '**/*.js'
      ],
      css: [
        '**/*.css'
      ],
      test: []
    }
  },

  server: {
    delay: 0,
    cacheDisable: true,
    port: 1337
  },

  release: false

};
