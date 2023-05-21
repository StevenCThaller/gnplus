import { MigrationInterface, QueryRunner } from "typeorm";

export class Hillnulbilly1684712021263 implements MigrationInterface {
    name = 'Hillnulbilly1684712021263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`station_factions\` DROP FOREIGN KEY \`FK_f2ea7e00abf8f9390ad0d70f6d0\``);
        await queryRunner.query(`ALTER TABLE \`station_factions\` CHANGE \`faction_state_id\` \`faction_state_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`station_factions\` ADD CONSTRAINT \`FK_f2ea7e00abf8f9390ad0d70f6d0\` FOREIGN KEY (\`faction_state_id\`) REFERENCES \`faction_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`station_factions\` DROP FOREIGN KEY \`FK_f2ea7e00abf8f9390ad0d70f6d0\``);
        await queryRunner.query(`ALTER TABLE \`station_factions\` CHANGE \`faction_state_id\` \`faction_state_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`station_factions\` ADD CONSTRAINT \`FK_f2ea7e00abf8f9390ad0d70f6d0\` FOREIGN KEY (\`faction_state_id\`) REFERENCES \`faction_state\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
