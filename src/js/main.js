define([
    'photo-anonymizer',
    'name-anonymizer',
    'company-anonymizer',
    'phone-anonymizer',
    'email-anonymizer'
], function(
    PhotoAnonymizer,
    NameAnonymizer,
    CompanyAnonymizer,
    PhoneAnonymizer,
    EmailAnonymizer
) {
    // Anonymize photos
    new PhotoAnonymizer().run();

    // Anonymize names
    new NameAnonymizer().run();

    // Anonymize emails
    new EmailAnonymizer().run();

    // Anonymize phone numbers
    new PhoneAnonymizer().run();

    // Anonymize companies
    // new CompanyAnonymizer().run();

    // Show the body
    document.querySelector('body').setAttribute('style', 'visibility: visible !important');
});