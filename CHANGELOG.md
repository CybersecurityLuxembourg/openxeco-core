# Change Log
All notable changes to this project will be documented in this file.

## [1.15.5] - 2023-04-04

### Fixed

- Dockerized API init

## [1.15.4] - 2023-03-30

### Fixed

- Fix entity extraction API resource

## [1.15.3] - 2023-03-09

### Changed

- "cryptography" package version for oxe-api

### Added

- Documentation of the configuration of the API

### Fixed

- Contact message creation on oxe-web-community

## [1.15.2] - 2023-02-15

### Fixed

- Cookie for password reseting on server instance on oxe-web-admin and oxe-web-community

## [1.15.1] - 2023-02-15

### Changed

- Documentation on the main README for the developers

### Fixed

- SMTP credentials for the development environment

## [1.15.0] - 2023-02-14

### Changed

- Persistence of email templates in the database
- user/update_user API resource: allow email modification
- public/get_public_document API resource: Add possibility to retrieve document by its ID
- user/update_user API resource: restrict field modification to admins
- UI on contact details of contact page of oxe-web-community
- UI/UX on "global" section of setting page of oxe-web-admin
- rename API module utils.re to utils.regex
- Require a "fresh" access token for all resources but account/unsubscribe

### Added

- Email notification to administrators on new request
- Default template for new request notification email
- Docker compose for development environment
- Database: accept_request_notification columns on User table
- Database: accept_terms_and_conditions columns on User table
- T&C/PP settings on oxe-web-admin for oxe-web-community
- T&C/PP dialog when not accepted on oxe-web-community
- Delete account button oxe-web-community
- GitHub url field for entites
- Mastodon url field for entities
- public/get_public_articles resource: add IDs filtering parameter
- account/unsubscribe resource
- campaign/send_campaign_draft resource
- mail/get_mail_addresses: add consider_communication_acceptance param
- Closing date for entity on DB, API resources, oxe-web-admin and oxe-web-community
- Columns on Entity list of Entity page of oxe-web-admin

### Fixed

- Dependabot alerts
- Setting changes when value is empty on oxe-web-admin
- Note update and modification button appearances on oxe-web-admin
- Miscellanous UI on oxe-web-admin
- public/get_public_article_content for html and markdown
- Limit the number of entities initially shown to avoid browser interruption on dashboard of oxe-web-admin

## [1.14.7] - 2023-01-27

### Changes

- Review optional field appearance for Article on owe-web-admin

## [1.14.6] - 2023-01-18

### Changes

- Use HttpOnly cookies with access and refresh tokens

### Added

- account/logout API resource

## [1.14.5] - 2023-01-02

### Added

- "max_start_date" parameter on article/get_articles resource
- "max_end_date" parameter on article/get_articles resource
- "max_start_date" parameter on public/get_public_articles resource
- "max_end_date" parameter on public/get_public_articles resource

## [1.14.4] - 2022-12-22

### Fixed

- Fix password regex on backend side
- Fix cookie deletion on "Back to login" click on oxe-web-admin and oxe-web-community

## [1.14.3] - 2022-12-20

### Changed

- Add "--preload" param to gunicorn to be more verbose

### Fixed

- Fix numpy version to avoid openpyxl bug

## [1.14.2] - 2022-12-19

### Changed

- Send an email to the provided one on "reset password", even if the user does not exist
- Force articles from "public/get_public_related_articles" to have the same type then the provided one

## [1.14.1] - 2022-12-16

### Fixed

- Login with the reset password token when clicking "Back to login" on oxe-web-admin and oxe-web-community

## [1.14.0] - 2022-12-16

### Changed

- Communication functionality into Campaign
- form/get_forms API resource
- form/update_form API resource
- form/update_form_question API resource
- Set textarea field instead of medium field on forms of oxe-web-community

### Added

- Column "reference" on Form table of the database structure
- Column "reference" on FormQuestion table of the database structure
- Fields "reference" on forms and questions on oxe-web-admin
- "TEXTAREA" question type on forms
- form/add_form_answer resource
- form/update_form_answer resource
- Checkbox to filter out "REJECTED" requests on oxe-web-admin
- Email subject field for Requests on oxe-web-admin
- Button to remove a Form on oxe-web-admin

### Fixed

- Password regex function on oxe-web-admin and oxe-web-community
- Page change on table of Form page on oxe-web-admin
- Improve security against user enumeration considering time discrepancy factor
- Set a default INITIAL_ADMIN_PASSWORD respecting pass criterias to allow change password
- Remove password check on "Current password" when changing password

## [1.13.10] - 2022-11-11

### Fixed

- Fix image buttons bug on Entity and Article items on oxe-web-admin
- Fix "Social media and website" deletion on profile page of oxe-web-admin and oxe-web-community

## [1.13.9] - 2022-10-20

### Fixed

- ISSUE#49 FIX2: Urgent: Log Out button not working

## [1.13.8] - 2022-10-20

### Fixed

- ISSUE#49 FIX: Urgent: Log Out button not working

## [1.13.7] - 2022-10-19

### Fixed

- ISSUE#48 FIX: Urgent: Change password is not working

## [1.13.6] - 2022-10-12

### Fixed

- public/get_public_related_articles API resource 

## [1.13.5] - 2022-10-11

### Fixed

- Taxonomy update for requests on oxe-web-admin

## [1.13.4] - 2022-09-21

### Fixed

- Article creation on oxe-web-community
- Article content modification on oxe-web-community

## [1.13.3] - 2022-09-20

### Changed

- Size of the 'headline' column of the Entity table in database structure

## [1.13.2] - 2022-09-15

### Added

- Add form/extract_form resource on API
- "Export" tab on Form item on oxe-web-admin

### Changed

- Change from log to error dialog when failing to load a file
- Dependent package versions
- Recommended NodeJS version to 16.17.0
- Review doc of entity/extract_entities
- Server installation documentation

### Fixed

- ISSUE#39 FIX: Change password reset box to show in green on success rather than in red
- ISSUE#41 FIX: Claiming an entity requires logout/login to effect change in the profile
- Vulnerabilities on dev packages dependencies
- The answer is deleted when empty field on forms on oxe-web-community

## [1.13.1] - 2022-08-31

### Added

- Filters on Network graph tab on Dashboard page on oxe-web-admin

### Changed

- Not loading taxonomies on premise on Network graph tab on Dashboard page on oxe-web-admin

### Fixed

- Article import when content is empty
- ISSUE#36 FIX: Refreshing the page will land you back to the login page
- ISSUE#38 FIX: "Payment required error" pop up was experienced during a password reset
- ISSUE#40 FIX: Closing the 'reset password' modal does not remove the data from the form
- ISSUE#42 FIX: Standard User is allowed to login to admin section

## [1.13.0] - 2022-08-29

### Added

- Network graph tab on Dashboard page on oxe-web-admin
- resource user/get_user_company_assignments
- Value "SELECT" on FormQuestion type
- "headline" field for entities

### Changed

- Rename "company" to "entity" at all levels (database, API, UI)
- Allow all type of notes on note/get_notes resource
- Add info on analytics/get_ecosystem_activity resource
- Community tab on Dashboard page on oxe-web-admin
- Usage analytics tab on Dashboard page on oxe-web-admin
- Recent activity tab on Dashboard page on oxe-web-admin
- Form management on oxe-web-admin and oxe-web-community

## [1.12.5] - 2022-08-17

### Fixed

- Error message when adding/modifying contact on Entity item on oxe-web-admin

## [1.12.4] - 2022-08-16

### Changed

- Review menu and home page elements on oxe-web-community

## [1.12.3] - 2022-07-28

### Changed

- Set AND logic when multiple taxonomy_values on public/get_public_companies and company/get_companies
- Set AND logic when multiple taxonomy_values on public/get_public_articles and article/get_articles
- Set all "taxonomy_values" resource args as list of Int

## [1.12.2] - 2022-07-27

### Changed

- Can add several keywords at once on Image and Document on oxe-web-admin

### Fixed

- dialog behavior after adding an article on oxe-web-admin
- dialog behavior after adding a taxonomy on oxe-web-admin
- dialog behavior after adding an entity on oxe-web-admin

## [1.12.1] - 2022-07-26

### Fixed

- Displayed versions
- Prospector compliance
- Unittests

## [1.12.0] - 2022-07-25

### Added

- Add DELETE and PUT as a possible resource type on API
- Add "ignored_taxonomy_values" param on article/get_articles and public/get_public_articles
- Add all rights to "Administrator" user group on API init
- CompanyRelationship table on database structure
- CompanyRelationshipType table on database structure
- Note table on database structure
- public/get_public_company_relationships resource
- relationship/add_relationship resource
- relationship/add_relationship_type resource
- relationship/get_relationship_types resource
- relationship/delete_relationship resource
- relationship/delete_relationship_type resource
- relationship/update_relationship resource
- relationship/update_relationship_type resource
- note/add_note resource
- note/delete_note resource
- note/get_notes resource
- note/update_note resource
- Company relationship management on oxe-web-admin
- Noting system for companies on oxe-web-admin
- Noting system for articles on oxe-web-admin
- Noting system for taxonomies on oxe-web-admin
- Noting system for user on oxe-web-admin

### Changed

- Set "company_id" params as not required for address/update_address resource
- Ignore "/" and "/doc" in resource/get_resources resource
- Restructure the Entity page on oxe-web-admin
- Rename "ecosystem" to community on UI on oxe-web-admin
- Rename "Company_Address" table to "CompanyAddress"
- Add "ids" params on user/get_users resource

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
