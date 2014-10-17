define(['anonymizer', 'chance'], function(Anonymizer, Chance) {

    /**
     * Interface for anonymizing photos
     *
     * @class   PhotoAnonymizer
     * @extends Anonymizer
     * @constructor
     */
    function PhotoAnonymizer() {
        this.sizes = [40, 50, 60, 80, 200, 500];

        this.chance = new Chance();
    };
    PhotoAnonymizer.prototype = Object.create(new Anonymizer());

    /**
     * Identify elements of interest to anonymize
     *
     * @method  identify
     * @return  {Array}
     */
    PhotoAnonymizer.prototype.identify = function() {
        var self = this,
            selectors = [
                'a[href*="://www.linkedin.com/profile/view"] img',
                'a[href^="/contacts/view"] img',
                '.new-miniprofile-container img',
                '.profile-picture img',
                '.larger-profile-photo img',
                'img.profile-pic',
                '.more-bar img'
            ],
            elements = document.querySelectorAll(selectors.join(','));

        return Array.prototype.slice.call(elements)
            .filter(function(node) {
                // Filter nodes that do not have a valid photo URL
                try {
                    self.getPhotoUrl(node);
                } catch(e) {
                    return false;
                }

                return true;
            });
    };

    /**
     * Returns the URL of this photo, whether its a background image or an <img> element
     *
     * @method  getPhotoUrl
     * @param   {Node}          element         The element to transform
     * @return  {String}
     */
    PhotoAnonymizer.prototype.getPhotoUrl = function(element) {
        var source = element.getAttribute('data-li-src') || element.getAttribute('src');

        if(source && source.match(/\/p\/([a-z\/\d]+).jpg/)) {
            return source;
        } else {
            throw new Error('PhotoAnonymizer.prototype.getPhotoUrl could not find a valid source URL.');
        }
    };

    /**
     * Returns the URL of this photo, whether its a background image or an <img> element
     *
     * @method  getPhotoUrl
     * @param   {Node}          element         The element to transform
     * @return  {String}
     */
    PhotoAnonymizer.prototype.getPhotoSize = function(element) {
        var sizes = this.sizes.sort(),
            url   = this.getPhotoUrl(element),
            size,
            i;

        if(size = url.match(/shrink_(\d+)_/)) {
            size = size[1];
        } else {
            size = element.width;
        }

        for(i in sizes) {
            if(size <= sizes[i]) {
                return sizes[i];
            };
        };
    };

    /**
     * Generates a unique string identifier for a given element (for repeatable replacement)
     *
     * @method  generateSeed
     * @param   {Node}          element         The element to transform
     * @return  {String}
     */
    PhotoAnonymizer.prototype.generateSeed = function(element) {
        return this.getPhotoUrl(element).match(/\/p\/([a-z\/\d]+).jpg/)[1];
    };

    /**
     * Anonymizes a single photo
     *
     * @method  anonymizeElement
     * @param   {Node}          element         The element to transform
     * @param   {Any}           replacement     The value used previously, if a similar element has been anonymized
     *                                          (i.e. an element with the same value from `generateSeed`)
     * @return  {Object|false}
     */
    PhotoAnonymizer.prototype.anonymizeElement = function(element, replacement) {
        var original = this.getPhotoUrl(element),
            size     = this.getPhotoSize(element),
            base     = 'https://s3-us-west-1.amazonaws.com/linkedin-cecchi/headshots',
            random   = this.chance.integer({
                'min' : 1,
                'max' : 183
            }),
            value    = replacement ? replacement : (base + '/' + size + '/' + random + '.png');


        element.setAttribute('src', '');
        element.setAttribute('src', value);

        if(element.getAttribute('data-li-src')) {
            element.setAttribute('data-li-src', value);
        }

        return value;
    };

    return PhotoAnonymizer;
});