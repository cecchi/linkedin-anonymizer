(function() {

    var grunt = require('grunt');

    module.exports = {
        src: {
            files: ['src/**/*'],
            tasks: ['build']
        }
    };

    grunt.loadNpmTasks('grunt-contrib-watch');

})();