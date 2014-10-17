define(['anonymizer', 'chance'], function(Anonymizer, Chance) {

    /**
     * Interface for anonymizing names
     *
     * @class   NameAnonymizer
     * @extends Anonymizer
     * @constructor
     */
    function NameAnonymizer() {
        this.chance = new Chance();
    };
    NameAnonymizer.prototype = Object.create(new Anonymizer());

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    NameAnonymizer.prototype.identify = function() {
        var self = this,
            selectors = [
                'a[href^="https://www.linkedin.com/profile/view"][href$="-name"]:not(.title):not([data-trk$="-title"])',
                'a[href^="https://www.linkedin.com/profile/view"].name',
                '.name a[href^="https://www.linkedin.com/profile/view"]',
                'a[href^="/contacts/view"]',
                '.profile-detail .name',
                '.full-name',
                '.new-miniprofile-container a'
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
    NameAnonymizer.prototype.findFirstNonEmptyTextNode = function(node) {
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

        throw new Error('NameAnonymizer.prototype.findFirstNonEmptyTextNode could not find a valid text node.');
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to identify
     * @return  {String}
     */
    NameAnonymizer.prototype.generateSeed = function(element) {
        return this.findFirstNonEmptyTextNode(element).textContent.trim().toLowerCase();
    };

    /**
     * Anonymizes a single name
     *
     * @method  anonymizeElement
     * @param   {Node}          element         The element to transform
     * @param   {String}        replacement     The value used previously, if a similar element has been anonymized
     *                                          (i.e. an element with the same value from `generateSeed`)
     * @return  {String|false}
     */
    NameAnonymizer.prototype.anonymizeElement = function(element, replacement) {
        var node   = this.findFirstNonEmptyTextNode(element),
            name   = node.textContent.trim(),
            value  = replacement ? replacement : this.chance.name(),
            prefix = node.textContent.match(/^\s/) ? ' ' : ''; // Preserve leading whitespace
            suffix = node.textContent.match(/\s$/) ? ' ' : ''; // Preserve trailing whitespace

        // If it has any spaces, assume it's a full name and add a mapping for the first name
        if(!replacement && name.indexOf(' ')) {
            this.setMapping(
                name.split(' ')[0].toLowerCase(),
                value.split(' ')[0]
            );
        }

        // Update text content
        node.textContent = prefix + value + suffix;

        return value;
    };

    return NameAnonymizer;
});