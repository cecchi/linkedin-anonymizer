define(['photo-anonymizer', 'name-anonymizer'], function(PhotoAnonymizer, NameAnonymizer) {
    // Anonymize photos
    new PhotoAnonymizer().run();

    // Anonymize names
    new NameAnonymizer().run();

    // Show the body
    document.querySelector('body').setAttribute('style', 'visibility: visible !important');
});