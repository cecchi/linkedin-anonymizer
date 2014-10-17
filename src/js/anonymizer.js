define(function() {

    /**
     * Interface for anonymizing a data type
     *
     * @class Anonymizer
     * @constructor
     */
    function Anonymizer() {
        this.observer = null;

        this.transformationMap = {};
    };

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    Anonymizer.prototype.identify = function() {
        throw new Error('Anonymizer.prototype.identify is not correctly implemented.');
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to transform
     * @return  {String}
     */
    Anonymizer.prototype.generateSeed = function(element) {
        throw new Error('Anonymizer.prototype.generateSeed is not correctly implemented.');
    };

    /**
     * Anonymizes a single photo
     *
     * @method  anonymizeElement
     * @param   {Node}          element         The element to transform
     * @param   {Any}           replacement     The value used previously, if a similar element has been anonymized
     *                                          (i.e. an element with the same value from `generateSeed`)
     * @return  {Any}
     */
    Anonymizer.prototype.anonymizeElement = function(element, replacement) {
        throw new Error('Anonymizer.prototype.anonymizeElement is not correctly implemented.');
    };

    /**
     * Saves a transformation for future use on similar elements
     *
     * @method  setMapping
     * @param   {String}    original        An identifier of the original element generated by `generateSeed`
     * @param   {Any}       replacement     A value representing the transformed element
     *                                      Passed to future calls to `anonymizeElement`
     * @return  {Anonymizer}
     */
    Anonymizer.prototype.setMapping = function(original, replacement) {
        var ns = this.constructor.name.toLowerCase();

        localStorage.setItem(ns + '.' + original, replacement);

        return this;
    };

    /**
     * Returns a transformation for a given element seed
     *
     * @method  getMapping
     * @param   {String}    original    An identifier of the original element generated by `generateSeed`
     * @return  {Any}
     */
    Anonymizer.prototype.getMapping = function(original) {
        var ns = this.constructor.name.toLowerCase();

        return localStorage.getItem(ns + '.' + original);
    };

    /**
     * Anonymizes all identified elements
     *
     * @method  anonymize
     * @return  {Anonymizer}
     */
    Anonymizer.prototype.anonymize = function() {
        var self     = this,
            elements = this.identify();

        if(elements instanceof NodeList) {
            elements = Array.prototype.slice.call(elements);
        }

        // Anonymize each element
        elements
            .filter(function(element) {
                return !element.hasAttribute('data-anonymized')
            })
            .forEach(function(element) {
                var original = self.generateSeed(element),
                    mapped   = self.getMapping(original),
                    anonymized;

                if(mapped) {
                    self.anonymizeElement(element, mapped);
                } else {
                    anonymized = self.anonymizeElement(element);
                    self.setMapping(original, anonymized);
                }

                element.setAttribute('data-anonymized', 'data-anonymized');
            });

        return this;
    };

    /**
     * Watch for DOM mutations and re-anonymize
     *
     * @method  watch
     */
    Anonymizer.prototype.watch = function(element) {
        var self = this;

        console.log('Initializing DOM observer...');

        if(this.observer) {
            this.observer.disconnect();
        }

        this.observer = new MutationObserver(function(mutations) {
            console.log('Mutation observed', mutations);

            self.anonymize()
                .watch();
        });

        this.observer.observe(document.querySelector('body'), {
            'subtree'   : true,
            'childList' : true
        });

        return this;
    };

    /**
     * Anonymize the current DOM and watch for future mutations
     *
     * @method  run
     * @return  {Anonymizer}
     */
    Anonymizer.prototype.run = function() {
        // Anonymize elements
        this.anonymize();

        // Watch for DOM Mutations
        this.watch();

        return this;
    };

    return Anonymizer;
});