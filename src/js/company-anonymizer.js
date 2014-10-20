define(['anonymizer', 'chance'], function(Anonymizer, Chance) {

    /**
     * Interface for anonymizing companies
     *
     * @class   CompanyAnonymizer
     * @extends Anonymizer
     * @constructor
     */
    function CompanyAnonymizer() {
        this.chance = new Chance();
    };
    CompanyAnonymizer.prototype = Object.create(new Anonymizer());
    CompanyAnonymizer.prototype.constructor = CompanyAnonymizer;

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    CompanyAnonymizer.prototype.identify = function() {
        var self = this,
            selectors = [
                'a[href^="/company/"]',
                'a[href^="/vsearch/p?company="]',
                '[itemtype="http://schema.org/Corporation"]'
            ],
            elements = document.querySelectorAll(selectors.join(','));

        return Array.prototype.slice.call(elements)
            .filter(function(node) {
                // Filter nodes that do not have a valid text node
                try {
                    self.findFirstNonEmptyTextNode(node);
                } catch(e) {
                    return false;
                }

                return true;
            });
    };

    /**
     * Gets the first non-empty text node descendant of an element
     *
     * @method  findFirstNonEmptyTextNode
     * @param   {Node}  node    The element to search
     * @return  {String|false}
     */
    CompanyAnonymizer.prototype.findFirstNonEmptyTextNode = function(node) {
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

        throw new Error('CompanyAnonymizer.prototype.findFirstNonEmptyTextNode could not find a valid text node.');
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to identify
     * @return  {String}
     */
    CompanyAnonymizer.prototype.generateSeed = function(element) {
        return this.findFirstNonEmptyTextNode(element).textContent.trim().toLowerCase();
    };

    /**
     * Anonymizes a single company
     *
     * @method  anonymizeElement
     * @param   {Node}          element         The element to transform
     * @param   {String}        replacement     The value used previously, if a similar element has been anonymized
     *                                          (i.e. an element with the same value from `generateSeed`)
     * @return  {String|false}
     */
    CompanyAnonymizer.prototype.anonymizeElement = function(element, replacement) {
        var node   = this.findFirstNonEmptyTextNode(element),
            name   = node.textContent.trim(),
            value  = replacement ? replacement : this.chance.name(),
            prefix = node.textContent.match(/^\s/) ? ' ' : ''; // Preserve leading whitespace
            suffix = node.textContent.match(/\s$/) ? ' ' : ''; // Preserve trailing whitespace

        // Update text content
        node.textContent = prefix + value + suffix;

        return value;
    };

    return CompanyAnonymizer;
});