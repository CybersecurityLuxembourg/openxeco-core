
-- COMPANY ECOSYSTEM ROLE AND ENTITY TYPE

INSERT INTO TaxonomyCategory (name)
VALUE
    ("ENTITY TYPE"),
    ("ECOSYSTEM ROLE");

INSERT INTO TaxonomyValue (name, category) VALUES ('PUBLIC SECTOR', 'ENTITY TYPE');
INSERT INTO TaxonomyValue (name, category) VALUES ('PRIVATE SECTOR', 'ENTITY TYPE');
INSERT INTO TaxonomyValue (name, category) VALUES ('CIVIL SOCIETY', 'ENTITY TYPE');

INSERT INTO TaxonomyValue (name, category) VALUES ('ACTOR', 'ECOSYSTEM ROLE');
INSERT INTO TaxonomyValue (name, category) VALUES ('DRIVING SEAT', 'ECOSYSTEM ROLE');
INSERT INTO TaxonomyValue (name, category) VALUES ('EXTERNAL PARTNER', 'ECOSYSTEM ROLE');
INSERT INTO TaxonomyValue (name, category) VALUES ('JOB PLATFORM', 'ECOSYSTEM ROLE');
INSERT INTO TaxonomyValue (name, category) VALUES ('VENTURE CAPITAL', 'ECOSYSTEM ROLE');

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE c.type = "ACTOR"
    AND tv.name = "ACTOR";

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE c.type = "JOB PLATFORM"
    AND tv.name = "JOB PLATFORM";

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE (c.name LIKE "Security Made In%"
        OR c.name LIKE "Haut-Commissariat à la%"
        OR c.name LIKE "Luxinnovation%")
    AND tv.name = "DRIVING SEAT";

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE c.type = "PUBLIC SECTOR"
    AND tv.name = "PUBLIC SECTOR";

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE c.type = "PRIVATE SECTOR"
    AND tv.name = "PRIVATE SECTOR";

INSERT INTO TaxonomyAssignment (company, taxonomy_value)
    SELECT c.id, tv.id
    FROM Company c
    JOIN TaxonomyValue tv
    WHERE c.type = "CIVIL SOCIETY"
    AND tv.name = "CIVIL SOCIETY";

-- REMOVE DEPRECATED COLUMN

ALTER TABLE Company
  DROP COLUMN type;