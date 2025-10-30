export async function up(q, S) {
  await q.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  await q.createTable('pets', {
    id: { type: S.UUID, defaultValue: S.literal('uuid_generate_v4()'), primaryKey: true },
    owner_user_id: { type: S.UUID, allowNull: false }, 
    name: { type: S.STRING, allowNull: false },
    species: { type: S.ENUM('DOG','CAT','OTHER'), allowNull: false },
    breed: { type: S.STRING },
    weight_kg: { type: S.FLOAT, allowNull: false },
    photo_url: { type: S.STRING },
    created_at: { type: S.DATE, defaultValue: S.fn('now') },
    updated_at: { type: S.DATE, defaultValue: S.fn('now') }
  });
  await q.addIndex('pets', ['owner_user_id']);
}
export async function down(q) {
  await q.dropTable('pets');
  await q.sequelize.query('DROP TYPE IF EXISTS "enum_pets_species";');
}
