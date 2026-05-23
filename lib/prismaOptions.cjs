const { PrismaPg } = require("@prisma/adapter-pg");

function getDatabaseUrl() {
  return process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/jpspare?schema=public";
}

function createPrismaOptions() {
  return {
    adapter: new PrismaPg({
      connectionString: getDatabaseUrl(),
    }),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  };
}

module.exports = {
  createPrismaOptions,
  getDatabaseUrl,
};
