CREATE EXTENSION "pgcrypto";

CREATE TABLE "SystemSettings" (
    "name" varchar(128) NOT NULL,
    "timezone" varchar(64) NOT NULL DEFAULT 'Asia/Novosibirsk'
);
ALTER TABLE "SystemSettings" ADD CONSTRAINT "pkSystemSettings" PRIMARY KEY ( "name" );

CREATE OR REPLACE FUNCTION CURRENT_SYSTEM_TIME() RETURNS timestamp without time zone LANGUAGE SQL AS $$
SELECT CURRENT_TIMESTAMP AT TIME ZONE ( SELECT "timezone" FROM "SystemSettings" );
$$;

CREATE TABLE "Role"(
  "name" text NOT NULL
);

ALTER TABLE "Role" ADD CONSTRAINT "pkRole" PRIMARY KEY ( "name" );
INSERT INTO "Role"(name) VALUES ('user');

CREATE TABLE "SystemUser"(
  "username"  char( 11 ) NOT NULL,
  "password" text NOT NULL,
  "role" text NOT NULL,
  "createdTime" timestamp(3) DEFAULT CURRENT_SYSTEM_TIME()
);

ALTER TABLE "SystemUser" ADD CONSTRAINT "pkSystemUser" PRIMARY KEY ( "username" );
ALTER TABLE "SystemUser" ADD CONSTRAINT "fkSystemUserRoleName" FOREIGN KEY ( "role" ) REFERENCES "Role"( "name" ) ON DELETE CASCADE;

CREATE TABLE "Session"(
  "username"  char( 11 ) NOT NULL,
  "token" uuid NOT NULL,
  "createdTime" timestamp(3) DEFAULT CURRENT_SYSTEM_TIME()
);

ALTER TABLE "Session" ADD CONSTRAINT "pkSession" PRIMARY KEY ( "token" );
ALTER TABLE "Session" ADD CONSTRAINT "fkSessionUserUsername" FOREIGN KEY ( "username" ) REFERENCES  "SystemUser"( "username" ) ON DELETE CASCADE;

INSERT INTO "SystemSettings"(name) VALUES ('web-soft-settings');
