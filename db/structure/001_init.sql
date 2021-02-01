/*
MySQL version: 8.0.22 - https://dev.mysql.com/downloads/installer/

Database-First is used in this project

charset: utf8mb4
collation: utf8mb4_unicode_ci 
link: https://dev.mysql.com/doc/refman/8.0/en/charset-unicode-sets.html

Upper-case is used for database names
Camel cases is used for the table name to respect the PEP-8 convention for classes
Lower-case, separated with "_", is used for the column names to respect the PEP-8 convention for attributes
No schema name are used for the tables
*/

CREATE DATABASE CYBERLUX character set utf8mb4 collate utf8mb4_unicode_ci;
USE CYBERLUX;

CREATE TABLE Company (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	rscl_number VARCHAR(10),
	name VARCHAR(255) NOT NULL,
	description TEXT(8192),
	creation_date DATE,
	website varchar(255),

	type ENUM('ACTOR', 'PARTNER', 'OPERATOR') DEFAULT NULL,

	is_startup BOOL DEFAULT FALSE NOT NULL,
	is_cybersecurity_core_business BOOL DEFAULT FALSE NOT NULL,
	is_targeting_sme BOOL DEFAULT FALSE NOT NULL,
	
	editus_status ENUM('active', 'inactive')
);
	
CREATE TABLE ValueChain (
	name VARCHAR(20) PRIMARY KEY
);

INSERT INTO ValueChain (name) VALUES 
	('IDENTIFY'), ('DETECT'), ('PROTECT'), ('RESPOND'), ('RECOVER');
	
CREATE TABLE Company_ValueChain (
	company_id INT NOT NULL,
	value_chain_name VARCHAR(20) NOT NULL,
	PRIMARY KEY (company_id, value_chain_name),
	FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE,
	FOREIGN KEY (value_chain_name) REFERENCES ValueChain (name) ON DELETE CASCADE
);

CREATE TABLE SolutionCategory (
	name VARCHAR(80) PRIMARY KEY
);

INSERT INTO SolutionCategory (name) VALUES 
	('Maintenance'), ('Data Security'), ('Communications'), 
	('Security Continuous Monitoring'), ('Supply Chain Risk Management'), ('Identity Management & Access Control'), 
	('Asset Management'), ('Business Environment'), ('Awareness & Training'), ('Planning Response'), 
	('Information Protection Processes and Procedures'), ('Anomalies and Events'), 
	('Detection Processes'), ('Analysis'), ('Improvements'), ('Protective Technology'), ('Risk Assessment'), 
	('Recovery Planning'), ('Governance & Risk Management'), ('Risk Management Strategy'), ('Mitigation');
	
CREATE TABLE Company_SolutionCategory (
	company_id INT NOT NULL,
	solution_category_name VARCHAR(80) NOT NULL,
	PRIMARY KEY (company_id, solution_category_name),
	FOREIGN KEY (company_id) REFERENCES Company (id)  ON DELETE CASCADE,
	FOREIGN KEY (solution_category_name) REFERENCES SolutionCategory (name) ON DELETE CASCADE
);

CREATE TABLE ServiceGroup (
	name VARCHAR(255) PRIMARY KEY
);

INSERT INTO ServiceGroup (name) VALUES 
	('Backup/Storage Security'), ('Supply Chain Risk Management'), ('System Recovery'), ('IoT Security'), 
	('Awareness Trainings'), ('Incident Management'), ('Penetration Testing/ Red Teaming'), ('Risk & Compliance (GRC)'), 
	('Access Management'), ('Underground/Darkweb Investigation'), ('Risk Management Strategy'), 
	('Software & Security Lifecycle Management'), ('Governance'), ('Firewalls/NextGen Firewalls'), 
	('PC/Mobile/End Point Security'), ('DDoS Protection'), ('Risk Assessment'), ('Services (CSRIT aas) Incident Response'), 
	('Cyber Threat Intelligence'), ('Honeypots/Cybertraps'), ('Digital Signature'), ('Forensics'), 
	('Crisis Communication'), ('Content Filtering & Monitoring'), ('Application Security'), ('Identity Management'), 
	('Fraud management'), ('Static Application Security Testing (SAST)'), ('Business Impact Analysis'), ('Encryption'), 
	('Data Recovery'), ('Improvements'), ('Cloud Access Security Brokers'), ('Hardware Security Modules (HSM)'), 
	('Crisis Management'), ('Security Certification'), ('Data Leakage Prevention'), ('Authorisation'), ('Communications'), 
	('PKI/Digital Certificates'), ('Unified Threat management (UTM)'), ('Sandboxing'), ('Wireless Security'), 
	('IT Service Management'), ('Patch Management'), ('Mobile Security/Device Management'), ('Anti Virus/Worm/Malware'), 
	('Anti-Spam'), ('Vulnerability Management'), ('Intrusion Detection'), ('Authentication'), ('Fraud Investigation'), 
	('Remote Access/VPN'), ('Cyber Security Insurance'), ('Security Operations Center (SOC)'), ('SIEM/Event Correlation Solutions'), 
	('Social Media & Brand Monitoring'), ('Business Continuity/Recovery Planning');
	
CREATE TABLE Company_ServiceGroup (
	company_id INT NOT NULL,
	service_group_name VARCHAR(255) NOT NULL,
	PRIMARY KEY (company_id, service_group_name),
	FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE,
	FOREIGN KEY (service_group_name) REFERENCES ServiceGroup (name) ON DELETE CASCADE
);
	
CREATE TABLE Role (
	name VARCHAR(50) PRIMARY KEY
);

INSERT INTO Role (name) VALUES 
	('Solution Provider'), ('Service Provider'), ('Consultant'), ('Legal'), ('Insurance'), ('Advisory'), ('Education')
	, ('Academic and Research');
	
CREATE TABLE Company_Role (
	company_id INT NOT NULL,
	role_name VARCHAR(50) NOT NULL,
	PRIMARY KEY (company_id, role_name),
	FOREIGN KEY (company_id) REFERENCES Company (id)  ON DELETE CASCADE,
	FOREIGN KEY (role_name) REFERENCES Role (name) ON DELETE CASCADE
);
	
CREATE TABLE IndustryVertical (
	name VARCHAR(50) PRIMARY KEY
);

INSERT INTO IndustryVertical (name) VALUES 
	('Accomodation & Food services activities'), ('IT & Telecom'), ('Education'), 
	('Aerospace & defense'), ('#N/A'), ('Arts Entertainment and recreation'), ('Healthcare'), 
	('Others'), ('Finance and Insurance activities'), ('Retail'), ('BFSI'), ('Manufacturing'), 
	('Transportation & Storage'), ('Energy and Utilities'), ('Public Administration'), ('Cleantech');

CREATE TABLE Company_IndustryVertical (
	company_id INT NOT NULL,
	industry_vertical_name VARCHAR(50) NOT NULL,
	PRIMARY KEY (company_id, industry_vertical_name),
	FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE,
	FOREIGN KEY (industry_vertical_name) REFERENCES IndustryVertical (name) ON DELETE CASCADE
);
	
CREATE TABLE Source (
	name VARCHAR(80) PRIMARY KEY
);

INSERT INTO Source (name) VALUES 
	('Technoport'), ('Check P. Steichen'), ('LHoFT'), ('EDITUS "Cybersecurity" & "Securité Informatique"'), 
	('Incubators list'), ('Securitymadein.lu'), ('Linkedin Sales'), ('ABBLFintech'), ('LXI Start-ups list'), 
	('Google search'), ('EDITUS "Additionnal categories"'), 
	('apsi'), ('Incubator list'), ('Wavestone'), ('fdi'), ('ILNAS'), ('opal'), ('ABBL Fintech'), 
	('Linkedin Search'), ('ICT Cluster member'), ('Press LU'), ('Tomorrow Street'), ('Annual account'), ('Paperjam'),
	('EDITUS');
	
CREATE TABLE Workforce (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	company INT NOT NULL,
	workforce INT NOT NULL,
	date DATE NOT NULL,
	is_estimated BOOL NOT NULL DEFAULT FALSE,
	source VARCHAR(80) NOT NULL,
	FOREIGN KEY (company) REFERENCES Company (id) ON DELETE CASCADE,
	FOREIGN KEY (source) REFERENCES Source (name) ON UPDATE CASCADE
);

CREATE TABLE `User` (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	email VARCHAR(80) NOT NULL,
	password VARCHAR(255) NOT NULL,
	CONSTRAINT UC_User_Email UNIQUE (email)
);