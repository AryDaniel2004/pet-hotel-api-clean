import crypto from "crypto";

export async function up(queryInterface) {
  const now = new Date();
  const ids = {
    small: crypto.randomUUID(),
    medium: crypto.randomUUID(),
    large: crypto.randomUUID(),
  };

  await queryInterface.bulkInsert("room_types", [
    {
      id: ids.small,
      name: "Pequeña",
      min_weight: 0,
      max_weight: 10,
      allowed_species: ["DOG"],
      base_rate: 20,
      created_at: now,
      updated_at: now,
    },
    {
      id: ids.medium,
      name: "Mediana",
      min_weight: 10,
      max_weight: 25,
      allowed_species: ["DOG"],
      base_rate: 25,
      created_at: now,
      updated_at: now,
    },
    {
      id: ids.large,
      name: "Grande",
      min_weight: 25,
      max_weight: 60,
      allowed_species: ["DOG"],
      base_rate: 30,
      created_at: now,
      updated_at: now,
    },
  ]);

  const mkRoom = (code, room_type_id) => ({
    id: crypto.randomUUID(),
    code,
    room_type_id,
    status: "ACTIVE",
    created_at: now,
    updated_at: now,
  });

  await queryInterface.bulkInsert("rooms", [
    mkRoom("S-101", ids.small),
    mkRoom("S-102", ids.small),
    mkRoom("M-201", ids.medium),
    mkRoom("M-202", ids.medium),
    mkRoom("L-301", ids.large),
    mkRoom("L-302", ids.large),
  ]);


  await queryInterface.bulkInsert("services", [
    {
      id: crypto.randomUUID(),
      name: "Baño",
      description: "Baño básico",
      price_type: "FIXED",
      price: 10,
      created_at: now,
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Paseo",
      description: "30 minutos",
      price_type: "PER_NIGHT",
      price: 5,
      created_at: now,
      updated_at: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Adiestramiento",
      description: "Sesión corta",
      price_type: "FIXED",
      price: 15,
      created_at: now,
      updated_at: now,
    },
  ]);
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("rooms", null, {});
  await queryInterface.bulkDelete("services", null, {});
  await queryInterface.bulkDelete("room_types", null, {});
}
