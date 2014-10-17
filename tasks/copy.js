(function() {

    var grunt = require('grunt');

    module.exports = {
        css: {
            cwd: 'src/css',
            src: '*.css',
            dest: 'build/',
            expand: true,
            flatten: true
        }
    };

    grunt.loadNpmTasks('grunt-contrib-copy');

})();