import { MigrationInterface, QueryRunner } from "typeorm";

export class Blackandyellow1684711649789 implements MigrationInterface {
    name = 'Blackandyellow1684711649789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`system_coordinates\` (\`id\` int NOT NULL AUTO_INCREMENT, \`x\` int NOT NULL, \`y\` int NOT NULL, \`z\` int NOT NULL, INDEX \`IDX_306eac150ac9de384957d5574c\` (\`x\`, \`y\`, \`z\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`security_levels\` (\`id\` int NOT NULL AUTO_INCREMENT, \`security_level\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_efa98986b6145ce33dea4dde6a\` (\`security_level\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`star_systems\` (\`system_address\` bigint UNSIGNED NOT NULL, \`system_name\` varchar(255) NOT NULL, \`system_coordinates_id\` int NULL, \`population\` int UNSIGNED NULL, \`allegiance_id\` int NULL, \`security_level_id\` int NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_507a8b8b39b4f7b7c87112fa3e\` (\`system_name\`), UNIQUE INDEX \`REL_8e822a85ab4acf2f09fc50d2e7\` (\`system_coordinates_id\`), PRIMARY KEY (\`system_address\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`allegiances\` (\`id\` int NOT NULL AUTO_INCREMENT, \`allegiance\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_10291546054d4753c56cd37d13\` (\`allegiance\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`station_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`station_type\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_4d88bc2935be517a91f67a164e\` (\`station_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`landing_pad_configurations\` (\`id\` int NOT NULL AUTO_INCREMENT, \`small\` int NOT NULL, \`medium\` int NOT NULL, \`large\` int NOT NULL, INDEX \`IDX_62963ae1ae98cf4d00c52c2381\` (\`small\`, \`medium\`, \`large\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`services\` (\`id\` int NOT NULL AUTO_INCREMENT, \`service\` varchar(255) NOT NULL, \`localised_en\` varchar(255) NULL, UNIQUE INDEX \`IDX_47991654cccebbd416dc94714d\` (\`service\`), UNIQUE INDEX \`IDX_a728c5d67a1bd62bc450500a57\` (\`localised_en\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`governments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`government\` varchar(255) NOT NULL, \`localised_en\` varchar(255) NULL, \`localised_es\` varchar(255) NULL, UNIQUE INDEX \`IDX_add7038a285893f252414e0194\` (\`government\`), UNIQUE INDEX \`IDX_775cff81ae9cd2b05fbfbb2410\` (\`localised_en\`), UNIQUE INDEX \`IDX_0a9e6f43c296a94d002b1339a8\` (\`localised_es\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`station_states\` (\`id\` int NOT NULL AUTO_INCREMENT, \`station_state\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_9b234565739788e7e99a5b42ee\` (\`station_state\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`economies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`economy_name\` varchar(255) NOT NULL, \`localised_en\` varchar(255) NULL, \`localised_es\` varchar(255) NULL, UNIQUE INDEX \`IDX_92bacd18ffdb52428fedfa74d2\` (\`economy_name\`), UNIQUE INDEX \`IDX_e63529a01c04c3391a8bd118a0\` (\`localised_en\`), UNIQUE INDEX \`IDX_b89bb7c2e09f4a337ed123ed94\` (\`localised_es\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`station_economies\` (\`id\` int NOT NULL AUTO_INCREMENT, \`station_id\` int UNSIGNED NOT NULL, \`economy_id\` int NULL, \`proportion\` float NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`stations\` (\`market_id\` int UNSIGNED NOT NULL, \`station_name\` varchar(255) NOT NULL, \`distance_from_arrival\` float NOT NULL, \`created_at\` datetime NOT NULL, \`updated_at\` datetime NOT NULL ON UPDATE CURRENT_TIMESTAMP, \`system_address\` bigint UNSIGNED NOT NULL, \`allegiance_id\` int NULL, \`government_id\` int NULL, \`station_type_id\` int NULL, \`landing_pad_configuration_id\` int NULL, \`station_state_id\` int NULL, \`station_faction_id\` int NULL, UNIQUE INDEX \`REL_a45f3ba694b1c38d5331bf2574\` (\`station_faction_id\`), PRIMARY KEY (\`market_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`faction_state\` (\`id\` int NOT NULL AUTO_INCREMENT, \`faction_state\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_ce4e8756f4a2ae0169164759ed\` (\`faction_state\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`station_factions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`station_id\` int UNSIGNED NOT NULL, \`faction_id\` int NOT NULL, \`faction_state_id\` int NOT NULL, \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX \`IDX_0cb025465edaf229ddf02a7c8c\` (\`station_id\`, \`faction_id\`), UNIQUE INDEX \`IDX_5694ef57a7a52ea9dba6b21649\` (\`station_id\`), UNIQUE INDEX \`REL_5694ef57a7a52ea9dba6b21649\` (\`station_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`factions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`faction_name\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_076c21ae4da4e2090e8ed68d68\` (\`faction_name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`station_has_services\` (\`station_id\` int UNSIGNED NOT NULL, \`service_id\` int NOT NULL, INDEX \`IDX_1db3557d0947e38cea239876c4\` (\`station_id\`), INDEX \`IDX_a9b2401a8db015474955985a89\` (\`service_id\`), PRIMARY KEY (\`station_id\`, \`service_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`star_systems\` ADD CONSTRAINT \`FK_6d8d77caac0e3bf959d427b8fe2\` FOREIGN KEY (\`security_level_id\`) REFERENCES \`security_levels\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`star_systems\` ADD CONSTRAINT \`FK_0ce2932a8fa8fc8584f5eb633b9\` FOREIGN KEY (\`allegiance_id\`) REFERENCES \`allegiances\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`star_systems\` ADD CONSTRAINT \`FK_8e822a85ab4acf2f09fc50d2e77\` FOREIGN KEY (\`system_coordinates_id\`) REFERENCES \`system_coordinates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_economies\` ADD CONSTRAINT \`FK_b3659856d9399411fa4bda37d81\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`market_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_economies\` ADD CONSTRAINT \`FK_246e53255b4d7269d7fad391dfd\` FOREIGN KEY (\`economy_id\`) REFERENCES \`economies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_686f937b60d973bd0a5547903db\` FOREIGN KEY (\`allegiance_id\`) REFERENCES \`allegiances\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_d10988a34c07a1b9daa7613c505\` FOREIGN KEY (\`government_id\`) REFERENCES \`governments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_aa0383803bf5d2b18315f11fd77\` FOREIGN KEY (\`station_type_id\`) REFERENCES \`station_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_0499e93ea5dad47450a83d7cb55\` FOREIGN KEY (\`landing_pad_configuration_id\`) REFERENCES \`landing_pad_configurations\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_ca970d8d32863292c64724d4d3b\` FOREIGN KEY (\`station_state_id\`) REFERENCES \`station_states\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_060cb298926f4a79b48681b5d6b\` FOREIGN KEY (\`system_address\`) REFERENCES \`star_systems\`(\`system_address\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`stations\` ADD CONSTRAINT \`FK_a45f3ba694b1c38d5331bf25744\` FOREIGN KEY (\`station_faction_id\`) REFERENCES \`station_factions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_factions\` ADD CONSTRAINT \`FK_5694ef57a7a52ea9dba6b216493\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`market_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_factions\` ADD CONSTRAINT \`FK_a564b109ce6fcffd64cefb312eb\` FOREIGN KEY (\`faction_id\`) REFERENCES \`factions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_factions\` ADD CONSTRAINT \`FK_f2ea7e00abf8f9390ad0d70f6d0\` FOREIGN KEY (\`faction_state_id\`) REFERENCES \`faction_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`station_has_services\` ADD CONSTRAINT \`FK_1db3557d0947e38cea239876c4c\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`market_id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`station_has_services\` ADD CONSTRAINT \`FK_a9b2401a8db015474955985a89d\` FOREIGN KEY (\`service_id\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`station_has_services\` DROP FOREIGN KEY \`FK_a9b2401a8db015474955985a89d\``);
        await queryRunner.query(`ALTER TABLE \`station_has_services\` DROP FOREIGN KEY \`FK_1db3557d0947e38cea239876c4c\``);
        await queryRunner.query(`ALTER TABLE \`station_factions\` DROP FOREIGN KEY \`FK_f2ea7e00abf8f9390ad0d70f6d0\``);
        await queryRunner.query(`ALTER TABLE \`station_factions\` DROP FOREIGN KEY \`FK_a564b109ce6fcffd64cefb312eb\``);
        await queryRunner.query(`ALTER TABLE \`station_factions\` DROP FOREIGN KEY \`FK_5694ef57a7a52ea9dba6b216493\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_a45f3ba694b1c38d5331bf25744\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_060cb298926f4a79b48681b5d6b\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_ca970d8d32863292c64724d4d3b\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_0499e93ea5dad47450a83d7cb55\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_aa0383803bf5d2b18315f11fd77\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_d10988a34c07a1b9daa7613c505\``);
        await queryRunner.query(`ALTER TABLE \`stations\` DROP FOREIGN KEY \`FK_686f937b60d973bd0a5547903db\``);
        await queryRunner.query(`ALTER TABLE \`station_economies\` DROP FOREIGN KEY \`FK_246e53255b4d7269d7fad391dfd\``);
        await queryRunner.query(`ALTER TABLE \`station_economies\` DROP FOREIGN KEY \`FK_b3659856d9399411fa4bda37d81\``);
        await queryRunner.query(`ALTER TABLE \`star_systems\` DROP FOREIGN KEY \`FK_8e822a85ab4acf2f09fc50d2e77\``);
        await queryRunner.query(`ALTER TABLE \`star_systems\` DROP FOREIGN KEY \`FK_0ce2932a8fa8fc8584f5eb633b9\``);
        await queryRunner.query(`ALTER TABLE \`star_systems\` DROP FOREIGN KEY \`FK_6d8d77caac0e3bf959d427b8fe2\``);
        await queryRunner.query(`DROP INDEX \`IDX_a9b2401a8db015474955985a89\` ON \`station_has_services\``);
        await queryRunner.query(`DROP INDEX \`IDX_1db3557d0947e38cea239876c4\` ON \`station_has_services\``);
        await queryRunner.query(`DROP TABLE \`station_has_services\``);
        await queryRunner.query(`DROP INDEX \`IDX_076c21ae4da4e2090e8ed68d68\` ON \`factions\``);
        await queryRunner.query(`DROP TABLE \`factions\``);
        await queryRunner.query(`DROP INDEX \`REL_5694ef57a7a52ea9dba6b21649\` ON \`station_factions\``);
        await queryRunner.query(`DROP INDEX \`IDX_5694ef57a7a52ea9dba6b21649\` ON \`station_factions\``);
        await queryRunner.query(`DROP INDEX \`IDX_0cb025465edaf229ddf02a7c8c\` ON \`station_factions\``);
        await queryRunner.query(`DROP TABLE \`station_factions\``);
        await queryRunner.query(`DROP INDEX \`IDX_ce4e8756f4a2ae0169164759ed\` ON \`faction_state\``);
        await queryRunner.query(`DROP TABLE \`faction_state\``);
        await queryRunner.query(`DROP INDEX \`REL_a45f3ba694b1c38d5331bf2574\` ON \`stations\``);
        await queryRunner.query(`DROP TABLE \`stations\``);
        await queryRunner.query(`DROP TABLE \`station_economies\``);
        await queryRunner.query(`DROP INDEX \`IDX_b89bb7c2e09f4a337ed123ed94\` ON \`economies\``);
        await queryRunner.query(`DROP INDEX \`IDX_e63529a01c04c3391a8bd118a0\` ON \`economies\``);
        await queryRunner.query(`DROP INDEX \`IDX_92bacd18ffdb52428fedfa74d2\` ON \`economies\``);
        await queryRunner.query(`DROP TABLE \`economies\``);
        await queryRunner.query(`DROP INDEX \`IDX_9b234565739788e7e99a5b42ee\` ON \`station_states\``);
        await queryRunner.query(`DROP TABLE \`station_states\``);
        await queryRunner.query(`DROP INDEX \`IDX_0a9e6f43c296a94d002b1339a8\` ON \`governments\``);
        await queryRunner.query(`DROP INDEX \`IDX_775cff81ae9cd2b05fbfbb2410\` ON \`governments\``);
        await queryRunner.query(`DROP INDEX \`IDX_add7038a285893f252414e0194\` ON \`governments\``);
        await queryRunner.query(`DROP TABLE \`governments\``);
        await queryRunner.query(`DROP INDEX \`IDX_a728c5d67a1bd62bc450500a57\` ON \`services\``);
        await queryRunner.query(`DROP INDEX \`IDX_47991654cccebbd416dc94714d\` ON \`services\``);
        await queryRunner.query(`DROP TABLE \`services\``);
        await queryRunner.query(`DROP INDEX \`IDX_62963ae1ae98cf4d00c52c2381\` ON \`landing_pad_configurations\``);
        await queryRunner.query(`DROP TABLE \`landing_pad_configurations\``);
        await queryRunner.query(`DROP INDEX \`IDX_4d88bc2935be517a91f67a164e\` ON \`station_types\``);
        await queryRunner.query(`DROP TABLE \`station_types\``);
        await queryRunner.query(`DROP INDEX \`IDX_10291546054d4753c56cd37d13\` ON \`allegiances\``);
        await queryRunner.query(`DROP TABLE \`allegiances\``);
        await queryRunner.query(`DROP INDEX \`REL_8e822a85ab4acf2f09fc50d2e7\` ON \`star_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_507a8b8b39b4f7b7c87112fa3e\` ON \`star_systems\``);
        await queryRunner.query(`DROP TABLE \`star_systems\``);
        await queryRunner.query(`DROP INDEX \`IDX_efa98986b6145ce33dea4dde6a\` ON \`security_levels\``);
        await queryRunner.query(`DROP TABLE \`security_levels\``);
        await queryRunner.query(`DROP INDEX \`IDX_306eac150ac9de384957d5574c\` ON \`system_coordinates\``);
        await queryRunner.query(`DROP TABLE \`system_coordinates\``);
    }

}
