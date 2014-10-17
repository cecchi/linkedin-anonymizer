(function() {

    var grunt = require('grunt');

    module.exports = {
        compile: {
            options: {
                mainConfigFile: 'config/requirejs.js'
            }
        }
    };

    grunt.loadNpmTasks('grunt-contrib-requirejs');

})();