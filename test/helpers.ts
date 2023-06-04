import { ServerScope } from 'nano';

export const deleteDb = async (connection: ServerScope, dbName: string): Promise<any> =>
  connection.db.destroy(dbName);
