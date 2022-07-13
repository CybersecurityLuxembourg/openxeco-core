# Change Log
All notable changes to this project will be documented in this file.

## [1.12.0] - 2022-XX-XX

### Added

- Add DELETE as a possible resource type on API
- Add "ignored_taxonomy_values" param on article/get_articles and public/get_public_articles

### Changed

- Set "company_id" params as not required for address/update_address resource
- Ignore "/" and "/doc" in resource/get_resources resource

### Fixed

- Ignore CORS on GET /public/ resources
- Minor UI bug on node network on oxe-web-admin
- Show user email address on FormAnswer component on oxe-web-admin
- Address management for companies on oxe-web-admin

## [1.11.3] - 2022-07-11

### Fixed

- form/add_my_form_answer and form/update_my_form_answer resources
- FormAnswer table with unicity constraint

## [1.11.2] - 2022-06-29

### Fixed

- company/extract_companies resources when no user assignments

## [1.11.1] - 2022-06-28

### Changed

- Database structure of Workforce table (FK and nullability on "source" column)
- Remove the "Source" table
- Adapt UI for entity workforce on oxe-web-admin

### Fixed

- Set right error message when updating an article abstract
- workflow/add_workflow resource

## [1.11.0] - 2022-06-21

### Added

- Url parameter handling to redirect to an entity claiming popup (?claim_entity={id}) on oxe-web-community
- favicon.ico and robots.txt on oxe-web-community and oxe-web-admin
- INITIAL_ADMIN_PASSWORD config for the API
- Add "form_responses" value on notification/get_notifications resource
- Display the number of form responses on oxe-web-admin "Forms" menu

### Changed

- Minor UX modifications on home page on oxe-web-community
- Minor UX modifications on menu on oxe-web-community
- UX of the "Claim or register entity" page on oxe-web-community
- Apply the VCARD UX from oxe-web-admin to oxe-web-community
- Package versions to remove critical vulnerabilities on oxe-web-admin and on oxe-web-community
- CORS_DOMAINS setting mandatory if ENVIRONMENT != "dev"
- Review doc/INSTALL_SERVER.md
- Review README.md
- Package name from GH actions
- Removed all "cybersecurity corebusiness" fields on oxe-web-community and oxe-web-admin
- The initial admin is created with a password (cf:INITIAL_ADMIN_PASSWORD) if there is no user in the database

### Fixed

- Menu highlight on oxe-web-community
- QR code sizing on profile page of oxe-web-admin
- private/generate_my_user_handle resource
- public/get_public_vcard resource
- Dockerfile on oxe-web-admin and on oxe-web-community to take the mod_rewrite in count for Single Page App
- Dockerized solution to mock the SMTP

## [1.10.4] - 2022-06-14

### Fixed

- Documentation description and version in resource public/get_public_node_information
- Chips display on popups
- Paragraph display on article preview and article edition

## [1.10.3] - 2022-06-13

### Fixed

- Medium editor fields

## [1.10.2] - 2022-06-10

### Fixed

- Filter form loading on "Entities" page on oxe-web-admin

## [1.10.1] - 2022-06-07

### Added

- License
- Links on documentation

## [1.10.0] - 2022-05-30

### Added

- API resource public/get_public_article/{_id}
- Keyword management when adding an image on oxe-web-admin
- Keyword management when adding a document on oxe-web-admin
- Import system on articles
- Import system on companies

### Changed

- API resource from company/get_company_enums => public/get_public_company_enums
- API resource from public/get_article_enums => public/get_public_article_enums
- API resource from public/get_article_content => public/get_public_article_content
- API resource from public/get_related_articles => public/get_public_related_articles
- Minor UI modification on menu on oxe-web-admin
- Minor UI modification on menu on oxe-web-community
- Database structure for "publication_date" of article (Date -> datetime)
- Remove Moovijob cron resource

### Fixed

- Menu overlay on oxe-web-admin
- Scroll on image selection dialog on oxe-web-admin

## [1.9.2] - 2022-05-06

### Added

- Setting on oxe-web-admin to hide or show form page on oxe-web-community

## [1.9.1] - 2022-05-04

### Added

- Tab to consult form answer on oxe-web-admin

### Changed

- UI on form on community app
- Set the description field of form as "editor" on admin app

### Fixed

- Error when updating the form global information
- Remove the hard coded label on option field of forms on community app

## [1.9.0] - 2022-04-29

### Added

- Implementation of taxonomy management on network page
- Setup explanation on the main README.md
- Social media fields on Company objects
- Taxonomy items on oxe-web-admin
- Import system on taxonomies
- Database structure for forms (Form, FormQuestion, FormAnswer)
- Form edition on oxe-web-admin
- Form display on oxe-web-community
- Dockerfile to run oxe-web-admin package as a container
- Dockerfile to run oxe-web-community package as a container
 
### Changed

- Database structure on TaxonomyCategory table
- Database structure on Company table
- Renamed and moved "network/get_node_information" to "public/get_public_node_information"
- Conditions of GH action triggers
- Setup explanation on oxe-api README.md
- Add 'handle' value in public/get_article_content resource
- Default mail content on ENTITY ACCESS CLAIM process
- Taxonomy page on oxe-web-admin
- Option to add the user information on entity extraction on oxe-web-admin
- Documentation to install an instance (doc/INSTALL_SERVER.md)
 
### Fixed

- Menu is not overiding the article edition mode anymore on oxe-web-admin

## [1.8.4] - 2022-03-28

### Fixed
 
- Fix Jinja2 version to make flask starting

## [1.8.3] - 2022-03-28

### Fixed
 
- Make user/get_user_company_enums accessible to non-admin users
- Remove the hardcoded names of the original project in the automatic emails

## [1.8.2] - 2022-02-10

### Fixed
 
- Compatibility of the DB JSON columns with MariaDB

## [1.8.1] - 2022-02-08

### Fixed
 
- Force the 2.0.1 version of the itsdangerous package

## [1.8.0] - 2022-02-04

### Added

- 
 
### Changed
  
- 
 
### Fixed
 
-
