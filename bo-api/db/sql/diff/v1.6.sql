
-- ADD COMMUNICATION TABLE

CREATE TABLE Communication (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	addresses TEXT,
	subject VARCHAR(255) NOT NULL,
	body TEXT NOT NULL,
	status enum('DRAFT', 'PROCESSED') NOT NULL DEFAULT 'DRAFT',
	sys_date timestamp NULL DEFAULT CURRENT_TIMESTAMP
);

-- ADD NODE TABLE

CREATE TABLE NetworkNode (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	api_endpoint VARCHAR(255) NOT NULL
);

-- [OPTIONAL] ADD is_targeting_sme TAXONOMY VALUES TO COMPANIES

INSERT INTO TaxonomyAssignment
SELECT c.id, tv.id
FROM Company c
LEFT JOIN TaxonomyValue tv
    ON tv.`name` = "SMALL ENTERPRISE - 10 TO 49"
    AND tv.category = "ENTITY TARGET"
WHERE is_targeting_sme = true
AND (
    SELECT COUNT(*)
    FROM TaxonomyAssignment ta
    WHERE ta.company = c.id
    AND ta.taxonomy_value = tv.id
    ) = 0;

INSERT INTO TaxonomyAssignment
SELECT c.id, tv.id
FROM Company c
LEFT JOIN TaxonomyValue tv
	ON tv.`name` = "MICRO-ENTERPRISE - LESS THAN 10"
    AND tv.category = "ENTITY TARGET"
WHERE is_targeting_sme = true
AND (
    SELECT COUNT(*)
    FROM TaxonomyAssignment ta
    WHERE ta.company = c.id
    AND ta.taxonomy_value = tv.id
    ) = 0;

-- Remove is_targeting_sme column

ALTER TABLE Company
DROP COLUMN is_targeting_sme;

-- Resize the abstract field of Article

ALTER TABLE Article
MODIFY COLUMN `abstract`
    VARCHAR(500)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    DEFAULT NULL;

-- Optimization

ALTER TABLE `Article` ADD INDEX `article_type_index` (`type`);
ALTER TABLE `Article` ADD INDEX `article_status_index` (`status`);
ALTER TABLE `Company` ADD INDEX `company_status_index` (`status`);
ALTER TABLE `TaxonomyValue` ADD INDEX `taxonomy_value_name_index` (`name`);

-- Add user information when subscription

ALTER TABLE `User` ADD COLUMN `accept_communication` BOOLEAN DEFAULT TRUE;
ALTER TABLE `User` ADD COLUMN `company_on_subscription` VARCHAR(510) DEFAULT NULL;
ALTER TABLE `User` ADD COLUMN `department_on_subscription` ENUM('TOP MANAGEMENT','HUMAN RESOURCE','MARKETING','FINANCE','OPERATION/PRODUCTION','INFORMATION TECHNOLOGY','OTHER') DEFAULT NULL;

-- Add department on UserCompanyAssignment

ALTER TABLE `UserCompanyAssignment` ADD COLUMN `department` ENUM('TOP MANAGEMENT','HUMAN RESOURCE','MARKETING','FINANCE','OPERATION/PRODUCTION','INFORMATION TECHNOLOGY','OTHER') DEFAULT NULL;
