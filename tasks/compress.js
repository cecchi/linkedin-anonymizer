(function() {

    var grunt = require('grunt');

    module.exports = {
        main: {
            options: {
                mode: 'zip',
                archive: 'build/anonymizer.zip'
            },
            files: [
                {
                    src: 'manifest.json'
                },
                {
                    src: 'icons/**/*'
                },
                {
                    src: [
                        'build/**/*',
                        '!build/**/*.zip'
                    ],
                    filter: 'isFile'
                }
            ]
        }
    };

    grunt.loadNpmTasks('grunt-contrib-compress');

})();