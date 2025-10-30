import crypto from "crypto";

export async function up(q) {
  const now = new Date();
  const customerId = "15dbce00-81f8-4fe1-b64f-14fe597744cc"; 

  await q.bulkInsert("pets", [
    {
      id: crypto.randomUUID(),
      owner_user_id: customerId,
      name: "Firulais",
      species: "DOG",
      breed: "Mestizo",
      weight_kg: 18,
      photo_url: null,
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(q) {
  await q.bulkDelete("pets", { name: "Firulais" });
}
