define(['anonymizer', 'chance'], function(Anonymizer, Chance) {

    /**
     * Interface for anonymizing phone numbers
     *
     * @class   PhoneAnonymizer
     * @extends Anonymizer
     * @constructor
     */
    function PhoneAnonymizer() {
        this.chance = new Chance();
    };
    PhoneAnonymizer.prototype = Object.create(new Anonymizer());
    PhoneAnonymizer.prototype.constructor = PhoneAnonymizer;

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    PhoneAnonymizer.prototype.identify = function() {
        var self = this,
            selectors = [
                'dd.phone > div'
            ],
            elements = document.querySelectorAll(selectors.join(','));

        var nodes = Array.prototype.slice.call(elements)
            .filter(function(node) {
                // Filter nodes that do not have a valid text node
                try {
                    self.findFirstNonEmptyTextNode(node);
                } catch(e) {
                    return false;
                }

                return true;
            });

        return nodes;
    };

    /**
     * Gets the first non-empty text node descendant of an element
     *
     * @method  findFirstNonEmptyTextNode
     * @param   {Node}  node    The element to search
     * @return  {String|false}
     */
    PhoneAnonymizer.prototype.findFirstNonEmptyTextNode = function(node) {
        var found;

        if(node.nodeType === 3 && node.textContent.trim().length > 0) {
            return node;
        }

        node = node.firstChild;
        while (node) {
            if(found = this.findFirstNonEmptyTextNode(node)) {
                return found;
            } else {
                node = node.nextSibling;
            }
        }

        throw new Error('PhoneAnonymizer.prototype.findFirstNonEmptyTextNode could not find a valid text node.');
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to identify
     * @return  {String}
     */
    PhoneAnonymizer.prototype.generateSeed = function(element) {
        return this.findFirstNonEmptyTextNode(element).textContent.replace(/[^\d]/g, '');
    };

    /**
     * Anonymizes a single phone number
     *
     * @method  anonymizeElement
     * @param   {Node}          element         The element to transform
     * @param   {String}        replacement     The value used previously, if a similar element has been anonymized
     *                                          (i.e. an element with the same value from `generateSeed`)
     * @return  {String|false}
     */
    PhoneAnonymizer.prototype.anonymizeElement = function(element, replacement) {
        var node  = this.findFirstNonEmptyTextNode(element),
            value = replacement ? replacement : chance.phone();

        node.textContent = value;

        return value;
    };

    return PhoneAnonymizer;
});