module.exports = function(grunt) {
    grunt.initConfig({
        'clean':     require('./tasks/clean'),
        'copy':      require('./tasks/copy'),
        'watch':     require('./tasks/watch'),
        'compress':  require('./tasks/compress'),
        'requirejs': require('./tasks/requirejs')
    });

    grunt.registerTask('build', ['clean', 'copy', 'requirejs', 'compress']);
    grunt.registerTask('default', ['watch']);
};