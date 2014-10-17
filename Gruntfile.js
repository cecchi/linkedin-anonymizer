module.exports = function(grunt) {
    grunt.initConfig({
        'clean':     require('./tasks/clean'),
        'copy':      require('./tasks/copy'),
        'watch':     require('./tasks/watch'),
        'requirejs': require('./tasks/requirejs')
    });

    grunt.registerTask('build', ['clean', 'copy', 'requirejs']);
    grunt.registerTask('default', ['watch']);
};