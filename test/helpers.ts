import { ServerScope } from 'nano'

export async function deleteDb(
  connection: ServerScope,
  dbName: string
): Promise<any> {
  const databases = await connection.db.list()
  if (databases.indexOf(dbName) !== -1) {
    await connection.db.destroy(dbName)
  }
}
