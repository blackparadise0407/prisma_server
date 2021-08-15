import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class PostTable1629019611150 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.addColumns('posts', [
			new TableColumn({
				name: 'createdAt',
				type: 'timestamp',
				default: 'now()',
			}),
			new TableColumn({
				name: 'updatedAt',
				type: 'timestamp',
				default: 'now()',
			}),
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('posts');
	}
}
