-- ADDRESS

CREATE TABLE Company_Address (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	company_id INT NOT NULL,
	number VARCHAR(15),
	address_1 VARCHAR(100) NOT NULL,
	address_2 VARCHAR(100),
	postal_code VARCHAR(10),
	city VARCHAR(80) NOT NULL,
	administrative_area VARCHAR(80),
	country VARCHAR(50) NOT NULL,
	latitude DOUBLE,
	longitude DOUBLE,
	FOREIGN KEY (company_id) REFERENCES Company (id) ON DELETE CASCADE
);

-- TAXONOMY

CREATE TABLE TaxonomyCategory (
	name VARCHAR(80) NOT NULL PRIMARY KEY
);

CREATE TABLE TaxonomyCategoryHierarchy (
	parent_category VARCHAR(80) NOT NULL,
	child_category VARCHAR(80) NOT NULL,
	PRIMARY KEY (parent_category, child_category),
	FOREIGN KEY (parent_category) REFERENCES TaxonomyCategory (name) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (child_category) REFERENCES TaxonomyCategory (name) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE TaxonomyValue (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	name VARCHAR(80) NOT NULL,
	category VARCHAR(80) NOT NULL,
	FOREIGN KEY (category) REFERENCES TaxonomyCategory (name) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT unique_taxonomy_value_name_category UNIQUE (name, category)
);

CREATE TABLE TaxonomyValueHierarchy (
	parent_value int NOT NULL,
	child_value int NOT NULL,
	PRIMARY KEY (parent_value, child_value),
	FOREIGN KEY (parent_value) REFERENCES TaxonomyValue (id) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (child_value) REFERENCES TaxonomyValue (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE TaxonomyAssignment (
	company INT NOT NULL,
	taxonomy_value INT NOT NULL,
	PRIMARY KEY (company, taxonomy_value),
	FOREIGN KEY (company) REFERENCES Company (id) ON DELETE CASCADE,
	FOREIGN KEY (taxonomy_value) REFERENCES TaxonomyValue (id) ON UPDATE CASCADE ON DELETE CASCADE
);

INSERT INTO `TaxonomyCategory` VALUES ('INDUSTRY VERTICAL'),('ROLE'),('SERVICE GROUP'),('SOLUTION CATEGORY'),('VALUE CHAIN');
INSERT INTO `TaxonomyValue` VALUES (16,'#N/A','INDUSTRY VERTICAL'),(1,'Academic and Research','ROLE'),(47,'Access Management','SERVICE GROUP'),(17,'Accomodation & Food services activities','INDUSTRY VERTICAL'),(2,'Advisory','ROLE'),(18,'Aerospace & defense','INDUSTRY VERTICAL'),(110,'Analysis','SOLUTION CATEGORY'),(111,'Anomalies and Events','SOLUTION CATEGORY'),(48,'Anti Virus/Worm/Malware','SERVICE GROUP'),(49,'Anti-Spam','SERVICE GROUP'),(50,'Application Security','SERVICE GROUP'),(19,'Arts Entertainment and recreation','INDUSTRY VERTICAL'),(112,'Asset Management','SOLUTION CATEGORY'),(51,'Authentication','SERVICE GROUP'),(52,'Authorisation','SERVICE GROUP'),(113,'Awareness & Training','SOLUTION CATEGORY'),(53,'Awareness Trainings','SERVICE GROUP'),(54,'Backup/Storage Security','SERVICE GROUP'),(20,'BFSI','INDUSTRY VERTICAL'),(55,'Business Continuity/Recovery Planning','SERVICE GROUP'),(114,'Business Environment','SOLUTION CATEGORY'),(56,'Business Impact Analysis','SERVICE GROUP'),(21,'Cleantech','INDUSTRY VERTICAL'),(57,'Cloud Access Security Brokers','SERVICE GROUP'),(58,'Communications','SERVICE GROUP'),(115,'Communications (Recover)','SOLUTION CATEGORY'),(152,'Communications (Respond)','SOLUTION CATEGORY'),(156,'Communications coaching & consulting','SERVICE GROUP'),(3,'Consultant','ROLE'),(154,'Containment Support','SERVICE GROUP'),(59,'Content Filtering & Monitoring','SERVICE GROUP'),(60,'Crisis Communication','SERVICE GROUP'),(61,'Crisis Management','SERVICE GROUP'),(158,'Cyber Ranges','SERVICE GROUP'),(62,'Cyber Security Insurance','SERVICE GROUP'),(63,'Cyber Threat Intelligence','SERVICE GROUP'),(64,'Data Leakage Prevention','SERVICE GROUP'),(65,'Data Recovery','SERVICE GROUP'),(116,'Data Security','SOLUTION CATEGORY'),(66,'DDoS Protection','SERVICE GROUP'),(141,'DETECT','VALUE CHAIN'),(117,'Detection Processes','SOLUTION CATEGORY'),(67,'Digital Signature','SERVICE GROUP'),(22,'Education','INDUSTRY VERTICAL'),(4,'Education','ROLE'),(68,'Encryption','SERVICE GROUP'),(23,'Energy and Utilities','INDUSTRY VERTICAL'),(24,'Finance and Insurance activities','INDUSTRY VERTICAL'),(69,'Firewalls/NextGen Firewalls','SERVICE GROUP'),(70,'Forensics','SERVICE GROUP'),(71,'Fraud Investigation (Analysis)','SERVICE GROUP'),(161,'Fraud Investigation (Recovery Planning)','SERVICE GROUP'),(72,'Fraud management','SERVICE GROUP'),(118,'Governance & Risk Management','SOLUTION CATEGORY'),(88,'Governance, Risk & Compliance (GRC)','SERVICE GROUP'),(74,'Hardware Security Modules (HSM)','SERVICE GROUP'),(25,'Healthcare','INDUSTRY VERTICAL'),(75,'Honeypots/Cybertraps','SERVICE GROUP'),(142,'IDENTIFY','VALUE CHAIN'),(76,'Identity Management','SERVICE GROUP'),(119,'Identity Management & Access Control','SOLUTION CATEGORY'),(77,'Improvements','SERVICE GROUP'),(120,'Improvements (Recover)','SOLUTION CATEGORY'),(153,'Improvements (Respond)','SOLUTION CATEGORY'),(78,'Incident Management','SERVICE GROUP'),(94,'Incident Response Services (CSRIT aaS)','SERVICE GROUP'),(121,'Information Protection Processes and Procedures','SOLUTION CATEGORY'),(5,'Insurance','ROLE'),(79,'Intrusion Detection','SERVICE GROUP'),(80,'IoT Security','SERVICE GROUP'),(26,'IT & Telecom','INDUSTRY VERTICAL'),(81,'IT Service Management','SERVICE GROUP'),(6,'Legal','ROLE'),(122,'Maintenance','SOLUTION CATEGORY'),(27,'Manufacturing','INDUSTRY VERTICAL'),(123,'Mitigation','SOLUTION CATEGORY'),(82,'Mobile Security/Device Management','SERVICE GROUP'),(28,'Others','INDUSTRY VERTICAL'),(83,'Patch Management','SERVICE GROUP'),(84,'PC/Mobile/End Point Security','SERVICE GROUP'),(85,'Penetration Testing/ Red Teaming','SERVICE GROUP'),(86,'PKI/Digital Certificates','SERVICE GROUP'),(124,'Planning Response','SOLUTION CATEGORY'),(157,'Post incident reviews & consulting','SERVICE GROUP'),(143,'PROTECT','VALUE CHAIN'),(125,'Protective Technology','SOLUTION CATEGORY'),(29,'Public Administration','INDUSTRY VERTICAL'),(144,'RECOVER','VALUE CHAIN'),(126,'Recovery Planning','SOLUTION CATEGORY'),(87,'Remote Access/VPN','SERVICE GROUP'),(145,'RESPOND','VALUE CHAIN'),(30,'Retail','INDUSTRY VERTICAL'),(127,'Risk Assessment','SOLUTION CATEGORY'),(155,'Risk Management solutions & services','SERVICE GROUP'),(128,'Risk Management Strategy','SOLUTION CATEGORY'),(90,'Risk Management Strategy development & consulting','SERVICE GROUP'),(91,'Sandboxing','SERVICE GROUP'),(92,'Security Certification','SERVICE GROUP'),(129,'Security Continuous Monitoring','SOLUTION CATEGORY'),(93,'Security Operations Center (SOC)','SERVICE GROUP'),(7,'Service Provider','ROLE'),(95,'SIEM/Event Correlation Solutions','SERVICE GROUP'),(96,'Social Media & Brand Monitoring','SERVICE GROUP'),(97,'Software & Security Lifecycle Management','SERVICE GROUP'),(8,'Solution Provider','ROLE'),(98,'Static Application Security Testing (SAST)','SERVICE GROUP'),(130,'Supply Chain Risk Management','SOLUTION CATEGORY'),(99,'Supply chain risk monitoring solutions & services','SERVICE GROUP'),(100,'System Recovery','SERVICE GROUP'),(159,'Takedown Services','SERVICE GROUP'),(31,'Transportation & Storage','INDUSTRY VERTICAL'),(101,'Underground/Darkweb Investigation','SERVICE GROUP'),(102,'Unified Threat management (UTM)','SERVICE GROUP'),(103,'Vulnerability Management','SERVICE GROUP'),(104,'Wireless Security','SERVICE GROUP');
INSERT INTO `TaxonomyCategoryHierarchy` VALUES ('SOLUTION CATEGORY','SERVICE GROUP'),('VALUE CHAIN','SOLUTION CATEGORY');
INSERT INTO `TaxonomyValueHierarchy` VALUES (119,47),(125,48),(125,49),(121,50),(119,51),(119,52),(113,53),(125,54),(126,55),(114,56),(116,57),(125,59),(152,60),(124,61),(123,62),(129,63),(116,64),(123,65),(123,66),(116,67),(116,68),(125,69),(110,70),(110,71),(111,72),(116,74),(117,75),(119,76),(124,78),(111,79),(125,80),(112,81),(125,82),(122,83),(125,84),(122,85),(116,86),(125,87),(118,88),(128,90),(125,91),(118,92),(129,93),(123,94),(129,95),(117,96),(112,97),(121,98),(130,99),(117,101),(125,102),(122,103),(125,104),(145,110),(141,111),(142,112),(143,113),(142,114),(144,115),(143,116),(141,117),(142,118),(143,119),(144,120),(143,121),(143,122),(145,123),(145,124),(143,125),(144,126),(142,127),(142,128),(141,129),(142,130),(145,152),(145,153),(153,154),(127,155),(115,156),(120,157),(113,158),(123,159),(126,161);
INSERT INTO `TaxonomyAssignment` VALUES (1,47),(17,47),(22,47),(23,47),(27,47),(34,47),(36,47),(41,47),(46,47),(50,47),(55,47),(75,47),(78,47),(88,47),(93,47),(100,47),(127,47),(141,47),(144,47),(149,47),(150,47),(169,47),(184,47),(201,47),(224,47),(250,47),(296,47),(301,47),(1,48),(8,48),(27,48),(38,48),(49,48),(57,48),(59,48),(61,48),(62,48),(63,48),(65,48),(71,48),(91,48),(97,48),(100,48),(101,48),(106,48),(108,48),(111,48),(112,48),(131,48),(143,48),(145,48),(150,48),(154,48),(165,48),(183,48),(184,48),(186,48),(226,48),(231,48),(270,48),(283,48),(1,49),(27,49),(59,49),(65,49),(97,49),(112,49),(145,49),(154,49),(22,50),(55,50),(57,50),(62,50),(86,50),(123,50),(145,50),(161,50),(173,50),(177,50),(184,50),(196,50),(222,50),(226,50),(236,50),(262,50),(263,50),(1,51),(10,51),(22,51),(23,51),(34,51),(36,51),(44,51),(47,51),(52,51),(55,51),(57,51),(75,51),(78,51),(82,51),(88,51),(93,51),(99,51),(100,51),(106,51),(108,51),(111,51),(123,51),(144,51),(146,51),(149,51),(150,51),(159,51),(163,51),(169,51),(181,51),(184,51),(191,51),(192,51),(194,51),(197,51),(199,51),(201,51),(202,51),(207,51),(208,51),(210,51),(211,51),(219,51),(233,51),(235,51),(238,51),(240,51),(241,51),(248,51),(252,51),(253,51),(255,51),(256,51),(260,51),(261,51),(272,51),(273,51),(274,51),(276,51),(280,51),(287,51),(288,51),(289,51),(291,51),(293,51),(294,51),(297,51),(300,51),(301,51),(303,51),(10,52),(22,52),(23,52),(36,52),(44,52),(47,52),(55,52),(75,52),(82,52),(88,52),(93,52),(99,52),(100,52),(146,52),(149,52),(159,52),(163,52),(169,52),(181,52),(184,52),(191,52),(192,52),(194,52),(199,52),(202,52),(207,52),(208,52),(210,52),(211,52),(219,52),(225,52),(235,52),(238,52),(240,52),(241,52),(248,52),(253,52),(256,52),(260,52),(272,52),(273,52),(274,52),(276,52),(280,52),(287,52),(288,52),(289,52),(291,52),(293,52),(294,52),(297,52),(300,52),(301,52),(303,52),(5,53),(7,53),(14,53),(24,53),(37,53),(42,53),(50,53),(57,53),(63,53),(66,53),(67,53),(70,53),(88,53),(90,53),(97,53),(101,53),(108,53),(110,53),(118,53),(119,53),(121,53),(122,53),(140,53),(142,53),(149,53),(150,53),(152,53),(156,53),(157,53),(161,53),(166,53),(173,53),(178,53),(196,53),(206,53),(227,53),(229,53),(231,53),(236,53),(251,53),(254,53),(258,53),(261,53),(267,53),(268,53),(277,53),(278,53),(279,53),(281,53),(285,53),(292,53),(302,53),(305,53),(3,54),(4,54),(6,54),(8,54),(22,54),(29,54),(30,54),(32,54),(39,54),(41,54),(43,54),(49,54),(52,54),(54,54),(55,54),(59,54),(62,54),(63,54),(64,54),(65,54),(68,54),(72,54),(75,54),(77,54),(79,54),(83,54),(84,54),(85,54),(97,54),(98,54),(100,54),(106,54),(114,54),(117,54),(132,54),(144,54),(145,54),(154,54),(162,54),(165,54),(173,54),(182,54),(184,54),(186,54),(223,54),(226,54),(230,54),(239,54),(252,54),(255,54),(265,54),(271,54),(5,55),(7,55),(14,55),(16,55),(26,55),(31,55),(37,55),(42,55),(43,55),(46,55),(48,55),(50,55),(52,55),(54,55),(59,55),(63,55),(66,55),(75,55),(78,55),(83,55),(87,55),(94,55),(98,55),(100,55),(110,55),(119,55),(121,55),(122,55),(134,55),(149,55),(152,55),(166,55),(217,55),(227,55),(239,55),(251,55),(277,55),(285,55),(303,55),(14,56),(16,56),(22,56),(26,56),(37,56),(42,56),(50,56),(66,56),(75,56),(78,56),(88,56),(94,56),(118,56),(134,56),(152,56),(195,56),(216,56),(217,56),(224,56),(227,56),(251,56),(267,56),(277,56),(282,56),(295,56),(55,57),(138,57),(143,57),(283,57),(171,58),(1,59),(31,59),(39,59),(62,59),(63,59),(165,59),(226,59),(236,59),(275,59),(58,60),(110,60),(155,60),(171,60),(7,61),(14,61),(25,61),(42,61),(50,61),(58,61),(66,61),(88,61),(110,61),(152,61),(155,61),(171,61),(206,61),(227,61),(257,61),(11,62),(15,62),(18,62),(19,62),(21,62),(33,62),(63,62),(189,62),(243,62),(5,63),(7,63),(14,63),(24,63),(25,63),(37,63),(42,63),(45,63),(50,63),(53,63),(62,63),(66,63),(75,63),(86,63),(88,63),(100,63),(108,63),(135,63),(152,63),(153,63),(161,63),(184,63),(226,63),(227,63),(236,63),(259,63),(261,63),(262,63),(3,64),(27,64),(36,64),(100,64),(133,64),(138,64),(213,64),(231,64),(304,64),(306,64),(8,65),(28,65),(32,65),(65,65),(72,65),(95,65),(97,65),(112,65),(116,65),(131,65),(144,65),(162,65),(184,65),(261,65),(27,66),(56,66),(84,66),(160,66),(186,66),(264,66),(10,67),(29,67),(32,67),(44,67),(47,67),(52,67),(82,67),(96,67),(99,67),(123,67),(136,67),(159,67),(163,67),(181,67),(182,67),(187,67),(191,67),(194,67),(197,67),(199,67),(202,67),(207,67),(208,67),(210,67),(211,67),(212,67),(219,67),(225,67),(235,67),(238,67),(239,67),(240,67),(241,67),(248,67),(260,67),(266,67),(272,67),(273,67),(274,67),(276,67),(287,67),(288,67),(289,67),(291,67),(294,67),(300,67),(301,67),(1,68),(22,68),(23,68),(29,68),(31,68),(32,68),(44,68),(46,68),(47,68),(48,68),(52,68),(55,68),(61,68),(82,68),(96,68),(100,68),(111,68),(114,68),(117,68),(123,68),(126,68),(136,68),(146,68),(163,68),(168,68),(169,68),(182,68),(191,68),(194,68),(197,68),(199,68),(202,68),(203,68),(207,68),(208,68),(210,68),(211,68),(216,68),(219,68),(221,68),(223,68),(225,68),(230,68),(233,68),(235,68),(238,68),(239,68),(241,68),(247,68),(248,68),(252,68),(253,68),(255,68),(260,68),(263,68),(266,68),(272,68),(273,68),(274,68),(276,68),(287,68),(288,68),(289,68),(291,68),(293,68),(294,68),(295,68),(297,68),(300,68),(303,68),(309,68),(1,69),(2,69),(22,69),(27,69),(36,69),(39,69),(41,69),(45,69),(48,69),(49,69),(50,69),(53,69),(54,69),(55,69),(56,69),(57,69),(62,69),(63,69),(71,69),(75,69),(91,69),(97,69),(100,69),(108,69),(111,69),(143,69),(165,69),(168,69),(183,69),(184,69),(186,69),(226,69),(236,69),(283,69),(7,70),(25,70),(37,70),(45,70),(46,70),(53,70),(63,70),(75,70),(78,70),(88,70),(109,70),(135,70),(140,70),(161,70),(184,70),(214,70),(237,70),(261,70),(262,70),(305,70),(14,71),(42,71),(47,71),(66,71),(75,71),(88,71),(120,71),(130,71),(135,71),(152,71),(176,71),(227,71),(242,71),(5,72),(10,72),(34,72),(44,72),(47,72),(82,72),(88,72),(100,72),(120,72),(149,72),(159,72),(163,72),(167,72),(180,72),(181,72),(192,72),(214,72),(215,72),(233,72),(240,72),(246,72),(271,72),(285,72),(294,72),(303,72),(306,72),(307,72),(100,74),(169,74),(192,74),(195,74),(203,74),(233,74),(234,74),(263,74),(284,75),(22,76),(25,76),(34,76),(36,76),(44,76),(46,76),(47,76),(52,76),(55,76),(75,76),(82,76),(88,76),(93,76),(99,76),(100,76),(108,76),(123,76),(149,76),(163,76),(169,76),(184,76),(191,76),(194,76),(199,76),(202,76),(207,76),(208,76),(210,76),(211,76),(215,76),(219,76),(235,76),(238,76),(239,76),(247,76),(248,76),(250,76),(253,76),(256,76),(260,76),(261,76),(272,76),(274,76),(276,76),(287,76),(288,76),(289,76),(291,76),(293,76),(294,76),(301,76),(303,76),(14,77),(37,77),(42,77),(59,77),(62,77),(66,77),(97,77),(121,77),(152,77),(226,77),(227,77),(2,78),(5,78),(7,78),(14,78),(20,78),(25,78),(37,78),(42,78),(45,78),(46,78),(50,78),(53,78),(62,78),(66,78),(75,78),(78,78),(87,78),(88,78),(100,78),(101,78),(108,78),(140,78),(152,78),(161,78),(164,78),(173,78),(226,78),(227,78),(236,78),(257,78),(259,78),(261,78),(262,78),(265,78),(277,78),(284,78),(305,78),(27,79),(36,79),(37,79),(54,79),(57,79),(75,79),(100,79),(143,79),(173,79),(183,79),(184,79),(259,79),(284,79),(296,79),(304,79),(22,80),(45,80),(53,80),(62,80),(102,80),(109,80),(148,80),(161,80),(217,80),(224,80),(226,80),(236,80),(244,80),(261,80),(290,80),(299,80),(5,81),(7,81),(9,81),(16,81),(20,81),(22,81),(24,81),(26,81),(27,81),(29,81),(32,81),(34,81),(35,81),(40,81),(41,81),(47,81),(48,81),(49,81),(50,81),(51,81),(52,81),(59,81),(60,81),(62,81),(64,81),(65,81),(69,81),(71,81),(73,81),(75,81),(78,81),(79,81),(81,81),(85,81),(88,81),(90,81),(91,81),(93,81),(94,81),(100,81),(102,81),(103,81),(104,81),(106,81),(107,81),(108,81),(112,81),(118,81),(119,81),(121,81),(122,81),(124,81),(125,81),(136,81),(138,81),(141,81),(142,81),(143,81),(149,81),(154,81),(158,81),(162,81),(165,81),(166,81),(167,81),(168,81),(170,81),(172,81),(173,81),(174,81),(179,81),(183,81),(195,81),(198,81),(201,81),(205,81),(209,81),(212,81),(216,81),(222,81),(226,81),(230,81),(232,81),(244,81),(249,81),(250,81),(266,81),(268,81),(274,81),(278,81),(279,81),(285,81),(305,81),(308,81),(22,82),(27,82),(34,82),(41,82),(45,82),(48,82),(53,82),(59,82),(91,82),(108,82),(149,82),(184,82),(263,82),(2,83),(57,83),(87,83),(111,83),(161,83),(184,83),(265,83),(1,84),(2,84),(8,84),(17,84),(27,84),(34,84),(50,84),(57,84),(59,84),(63,84),(70,84),(71,84),(83,84),(91,84),(100,84),(102,84),(108,84),(143,84),(150,84),(154,84),(168,84),(184,84),(5,85),(7,85),(14,85),(24,85),(25,85),(31,85),(36,85),(46,85),(50,85),(62,85),(63,85),(67,85),(75,85),(78,85),(88,85),(92,85),(101,85),(108,85),(109,85),(110,85),(118,85),(119,85),(122,85),(127,85),(128,85),(134,85),(137,85),(140,85),(145,85),(149,85),(158,85),(161,85),(164,85),(165,85),(166,85),(173,85),(183,85),(196,85),(204,85),(206,85),(217,85),(221,85),(226,85),(228,85),(236,85),(261,85),(262,85),(267,85),(277,85),(278,85),(284,85),(285,85),(298,85),(305,85),(32,86),(56,86),(77,86),(89,86),(100,86),(106,86),(108,86),(123,86),(130,86),(169,86),(187,86),(199,86),(212,86),(239,86),(301,86),(1,87),(17,87),(22,87),(36,87),(39,87),(49,87),(61,87),(75,87),(87,87),(100,87),(108,87),(127,87),(143,87),(145,87),(165,87),(169,87),(184,87),(201,87),(250,87),(283,87),(301,87),(2,88),(5,88),(7,88),(12,88),(13,88),(14,88),(16,88),(20,88),(22,88),(24,88),(25,88),(26,88),(27,88),(32,88),(34,88),(36,88),(37,88),(40,88),(42,88),(44,88),(45,88),(46,88),(48,88),(50,88),(52,88),(53,88),(54,88),(55,88),(63,88),(66,88),(67,88),(74,88),(75,88),(76,88),(78,88),(80,88),(81,88),(83,88),(85,88),(86,88),(88,88),(90,88),(92,88),(94,88),(100,88),(101,88),(102,88),(103,88),(105,88),(107,88),(108,88),(109,88),(110,88),(113,88),(114,88),(115,88),(118,88),(119,88),(122,88),(124,88),(125,88),(127,88),(128,88),(129,88),(132,88),(134,88),(137,88),(139,88),(140,88),(141,88),(143,88),(147,88),(149,88),(151,88),(152,88),(154,88),(156,88),(158,88),(161,88),(164,88),(166,88),(167,88),(170,88),(171,88),(173,88),(174,88),(175,88),(176,88),(178,88),(180,88),(185,88),(188,88),(190,88),(193,88),(198,88),(200,88),(204,88),(205,88),(214,88),(215,88),(217,88),(218,88),(220,88),(221,88),(224,88),(227,88),(228,88),(232,88),(236,88),(237,88),(239,88),(242,88),(245,88),(246,88),(249,88),(251,88),(257,88),(258,88),(261,88),(266,88),(267,88),(268,88),(269,88),(271,88),(275,88),(277,88),(278,88),(280,88),(281,88),(282,88),(285,88),(292,88),(298,88),(304,88),(305,88),(306,88),(307,88),(308,88),(7,90),(12,90),(13,90),(14,90),(16,90),(19,90),(20,90),(22,90),(24,90),(25,90),(32,90),(34,90),(37,90),(42,90),(47,90),(50,90),(63,90),(66,90),(67,90),(74,90),(75,90),(78,90),(80,90),(81,90),(83,90),(88,90),(94,90),(100,90),(101,90),(110,90),(134,90),(140,90),(143,90),(145,90),(149,90),(152,90),(156,90),(161,90),(167,90),(171,90),(173,90),(185,90),(190,90),(193,90),(204,90),(227,90),(251,90),(257,90),(258,90),(267,90),(268,90),(269,90),(278,90),(281,90),(282,90),(285,90),(286,90),(292,90),(284,91),(50,92),(54,92),(114,92),(178,92),(229,92),(279,92),(7,93),(20,93),(24,93),(25,93),(27,93),(36,93),(37,93),(40,93),(45,93),(46,93),(48,93),(50,93),(53,93),(75,93),(78,93),(83,93),(86,93),(88,93),(92,93),(102,93),(108,93),(120,93),(160,93),(161,93),(166,93),(173,93),(204,93),(212,93),(224,93),(236,93),(261,93),(277,93),(279,93),(296,93),(7,94),(37,94),(40,94),(50,94),(75,94),(101,94),(108,94),(161,94),(184,94),(231,94),(236,94),(261,94),(24,95),(36,95),(50,95),(62,95),(75,95),(83,95),(108,95),(143,95),(161,95),(204,95),(226,95),(261,95),(284,95),(130,96),(135,96),(153,96),(22,97),(34,97),(35,97),(41,97),(50,97),(65,97),(75,97),(88,97),(104,97),(157,97),(177,97),(216,97),(220,97),(262,97),(279,97),(262,98),(277,98),(45,99),(53,99),(102,99),(167,99),(266,99),(279,99),(286,99),(2,100),(8,100),(28,100),(59,100),(84,100),(95,100),(97,100),(112,100),(116,100),(131,100),(162,100),(184,100),(231,100),(261,100),(47,101),(130,101),(153,101),(213,101),(45,102),(53,102),(91,102),(168,102),(1,103),(7,103),(34,103),(46,103),(50,103),(62,103),(63,103),(88,103),(100,103),(101,103),(140,103),(143,103),(149,103),(158,103),(161,103),(166,103),(184,103),(196,103),(226,103),(236,103),(262,103),(277,103),(284,103),(285,103),(305,103),(1,104),(8,104),(34,104),(39,104),(57,104),(62,104),(63,104),(93,104),(121,104),(131,104),(162,104),(169,104),(196,104),(226,104),(2,155),(5,155),(7,155),(12,155),(13,155),(14,155),(16,155),(20,155),(22,155),(24,155),(25,155),(26,155),(34,155),(36,155),(37,155),(42,155),(45,155),(47,155),(48,155),(50,155),(52,155),(53,155),(55,155),(63,155),(66,155),(67,155),(74,155),(75,155),(78,155),(80,155),(81,155),(83,155),(86,155),(88,155),(94,155),(99,155),(100,155),(101,155),(102,155),(104,155),(105,155),(108,155),(109,155),(110,155),(118,155),(121,155),(122,155),(128,155),(134,155),(140,155),(143,155),(147,155),(149,155),(152,155),(156,155),(158,155),(161,155),(166,155),(167,155),(185,155),(190,155),(198,155),(206,155),(217,155),(224,155),(227,155),(236,155),(239,155),(249,155),(251,155),(257,155),(258,155),(261,155),(267,155),(268,155),(269,155),(275,155),(277,155),(278,155),(281,155),(282,155),(285,155),(292,155),(298,155),(14,161),(42,161),(66,161),(75,161),(152,161),(227,161);

INSERT INTO TaxonomyAssignment (taxonomy_value, company)
SELECT tv.id, cr.company_id
FROM Company_Role cr
LEFT JOIN TaxonomyValue tv ON cr.role_name = tv.name and tv.category = "ROLE";

INSERT INTO TaxonomyAssignment (taxonomy_value, company)
SELECT tv.id, cr.company_id
FROM Company_IndustryVertical cr
LEFT JOIN TaxonomyValue tv ON cr.industry_vertical_name = tv.name and tv.category = "INDUSTRY VERTICAL";

DROP TABLE Company_IndustryVertical;
DROP TABLE Company_Role;
DROP TABLE Company_ServiceGroup;
DROP TABLE Company_SolutionCategory;
DROP TABLE Company_ValueChain;
DROP TABLE IndustryVertical;
DROP TABLE Role;
DROP TABLE ServiceGroup;
DROP TABLE SolutionCategory;
DROP TABLE ValueChain;

-- LOG

CREATE TABLE Log (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	user_id INT,
	request VARCHAR(150) NOT NULL,
	request_method VARCHAR(10) NOT NULL,
	params TEXT,
	status_code INT NOT NULL,
	status_description VARCHAR(150),
	FOREIGN KEY (user_id) REFERENCES User (id) ON UPDATE CASCADE ON DELETE CASCADE
);
