
ALTER TABLE Company MODIFY rscl_number VARCHAR(50);
ALTER TABLE Company RENAME COLUMN rscl_number TO trade_register_number;
ALTER TABLE Company RENAME COLUMN editus_status TO status;

CREATE TABLE Setting (
	property VARCHAR(255) NOT NULL PRIMARY KEY,
	value TEXT NOT NULL
);

ALTER TABLE Article DROP COLUMN media;