define(['photo-anonymizer', 'name-anonymizer', 'company-anonymizer'], function(PhotoAnonymizer, NameAnonymizer, CompanyAnonymizer) {
    // Anonymize photos
    new PhotoAnonymizer().run();

    // Anonymize names
    new NameAnonymizer().run();

    // Anonymize companies
    // new CompanyAnonymizer().run();

    // Show the body
    document.querySelector('body').setAttribute('style', 'visibility: visible !important');
});