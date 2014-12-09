define(['underscore', 'anonymizer', 'chance', 'names'], function(_, Anonymizer, Chance, Names) {

    /**
     * Interface for anonymizing names
     *
     * @class   NameAnonymizer
     * @extends Anonymizer
     * @constructor
     */
    function NameAnonymizer() {
        this.chance = new Chance();

        this.chance.set('firstNames', {
            'male'   : Names,
            'female' : Names
        });
    };

    NameAnonymizer.prototype = Object.create(new Anonymizer());
    NameAnonymizer.prototype.constructor = NameAnonymizer;

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    NameAnonymizer.prototype.identify = function() {
        var self = this,
            selectors = [
                'a[href*="://www.linkedin.com/profile/view"][href$="name"]:not(.title):not([data-trk$="title"])',
                'a[href*="://www.linkedin.com/profile/view"].name',
                'a[href^="/recruiter/profile"]',
                '.inside-opinion-request .recipient-name',
                '.inside-opinion-request .title',
                '.inside-opinion-request #subject',
                '.inside-opinion-request #msgBody',
                '#recruiter-inside-opinion .take-action button',
                '#recruiter-inside-opinion .module-body > h3',
                '.name a[href*="://www.linkedin.com/profile/view"]',
                '.profile-info > h1.searchable',
                'a[href^="/contacts/view"]',
                '.peopleSearch .given-name',
                '#notifications .update .name',
                '.profile-detail .name',
                '.inbox-item .participants',
                '.full-name',
                '.intermediary-name',
                '.new-miniprofile-container a',
                '#sendInMailModal .recipient'
            ],
            elements = document.querySelectorAll(selectors.join(','));

        return Array.prototype.slice.call(elements)
            .filter(function(node) {
                // Filter nodes that do not have valid content to replace
                try {
                    self.getContent(node);
                } catch(e) {
                    return false;
                }

                return true;
            });
    };

    /**
     * Determines whether to treat an element as a freeform text replacement
     *
     * @method  isFreeform
     * @param   {Node}  node    The element to inspect
     * @retunr  {Boolean}
     */
    NameAnonymizer.prototype.isFreeform = function(element) {
        var id      = element.getAttribute('id'),
            tag     = element.tagName.toLowerCase(),
            classes = element.getAttribute('class') || '';

        classes = classes.trim();

        return id === 'subject' ||
               id === 'msgBody' ||
               tag === 'button' ||
               tag === 'title'  ||
               tag === 'h3';
    };

    /**
     * Gets the first non-empty text node descendant of an element
     *
     * @method  findFirstNonEmptyTextNode
     * @param   {Node}  node    The element to search
     * @return  {String}
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
     * Returns the text content of an element, or the value of an input
     *
     * @method  getContent
     * @param   {Node}  node    The element to search
     * @return  {String|false}
     */
    NameAnonymizer.prototype.getContent = function(element, trim) {
        var node,
            content;

        if(element.tagName.toLowerCase() === 'input') {
            content = element.value || element.getAttribute('placeholder') || '';
        } else {
            content = this.findFirstNonEmptyTextNode(element).textContent;
        }

        return trim ? content.trim() : content;
    };

    /**
     * Sets the text content of an element, or the value of an input
     *
     * @method  setContent
     * @param   {Node}  node    The element to modify
     * @return  {NameAnonymizer}
     */
    NameAnonymizer.prototype.setContent = function(element, content) {
        if(element.tagName.toLowerCase() === 'input') {
            element.value = content;
        } else {
            this.findFirstNonEmptyTextNode(element).textContent = content;
        }

        return this;
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to identify
     * @return  {String}
     */
    NameAnonymizer.prototype.generateSeed = function(element) {
        return this.getContent(element, true).toLowerCase();
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
        var content  = this.getContent(element),
            trimmed  = content.trim(),
            value    = replacement ? replacement : this.chance.name(),
            prefix   = content.match(/^\s/) ? ' ' : '', // Preserve leading whitespace
            suffix   = content.match(/\s$/) ? ' ' : '', // Preserve trailing whitespace
            mappings;

        // If it's a freeform element, replace all names
        if(this.isFreeform(element)) {
            // Sort all the mappings by length so full names get replaced first
            mappings = _.chain(this.getAllMappings()).pairs().sortBy(function(pair) {
                return pair[0].length
            }).map(function(pair) {
                return {
                    'original'    : pair[0],
                    'replacement' : pair[1]
                };
            }).value().reverse();

            // Replace freeform content
            this.setContent(element, mappings.reduce(function(formatted, mapping) {
                return formatted.replace(
                    new RegExp(mapping.original, 'ig'),
                    mapping.replacement
                );
            }, content));

            return false;
        }

        // If it has any spaces, assume it's a full name and add a mapping for the first name
        if(!replacement && trimmed.indexOf(' ')) {
            this.setMapping(
                trimmed.split(' ')[0].toLowerCase(),
                value.split(' ')[0]
            );
        }

        // Exact content
        this.setContent(element, prefix + value + suffix);

        return value;
    };

    return NameAnonymizer;
});