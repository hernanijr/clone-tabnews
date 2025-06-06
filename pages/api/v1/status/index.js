import database from "infra/database.js";
import { InternalServerError } from "infra/errors.js";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const databaseVersionResult = await database.query(`SHOW server_version;`);
    const databaseVersionValue = databaseVersionResult.rows[0].server_version;
    const databaseMaxConnectionsResult = await database.query(
      `SHOW max_connections;`,
    );
    const databaseMaxConnectionsValue =
      databaseMaxConnectionsResult.rows[0].max_connections;

    const databaseName = process.env.POSTGRES_DB;
    const databaseOpenedConnectionsResult = await database.query({
      text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1;",
      values: [databaseName],
    });
    const databaseOpenedConnectionsValue =
      databaseOpenedConnectionsResult.rows[0].count;

    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersionValue,
          max_connections: parseInt(databaseMaxConnectionsValue),
          opened_connections: databaseOpenedConnectionsValue,
        },
      },
    });
  } catch (error) {
    const publicError = new InternalServerError({
      cause: error,
    });
    console.log("\n Erro dentro do catch do controller;");
    console.error(publicError);
    response.status(500).json(publicError);
  }
}

export default status;
