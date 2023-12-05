import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  const databaseVersionResult = await database.query(`SHOW server_version;`);
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;
  const databaseMaxConnectionsResult = await database.query(
    `SHOW max_connections;`
  );
  const databaseMaxConnectionsValue =
    databaseMaxConnectionsResult.rows[0].max_connections;

  const databaseOpenedConnectionsResult = await database.query(
    `SHOW reserved_connections;`
  );
  const databaseOpenedConnectionsValue =
    databaseOpenedConnectionsResult.rows[0].reserved_connections;

  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        opened_connections: databaseOpenedConnectionsValue,
        max_connections: databaseMaxConnectionsValue,
      },
    },
  });
}

export default status;
