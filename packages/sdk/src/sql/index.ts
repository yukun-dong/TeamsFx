import {
  initializeComponentAsync,
  registerComponent,
  resolveComponent,
  ComponentContainer,
  ComponentMetadata,
  InitializeOptions,
} from "../internal";
import { Logger } from "../util/logger";
import { Connection, Request } from "tedious";
import { DefaultTediousConnectionConfiguration } from "./defaultTediousConnectionConfiguration";
import { SqlConfiguration } from "../models/configuration";
import { getSqlConfigFromEnv } from "../util/configurationProvider";

function registerSql() {
  const sqlFactory = async (
    componentContainer: ComponentContainer,
    options?: InitializeOptions
  ) => {
    const sqlOption = options as unknown as SqlConfiguration;
    const logger = componentContainer.resolve("logger") as Logger;
    const tediousConfig = new DefaultTediousConnectionConfiguration(sqlOption, logger);
    return new Connection(await tediousConfig.getConfig());
  };
  registerComponent(new ComponentMetadata("SQL", sqlFactory, false));
}

export async function initializeSqlAsync(config?: SqlConfiguration, identifier = "default") {
  config = config ?? getSqlConfigFromEnv();
  await initializeComponentAsync("SQL", { ...config }, identifier);
}

export function getSqlConnection(identifier = "default"): Connection {
  return resolveComponent("SQL", identifier) as Connection;
}

export async function connect(connection?: Connection): Promise<Connection> {
  const conn = connection ?? getSqlConnection();
  return new Promise((resolve, reject) => {
    conn.on("connect", (error) => {
      if (error) {
        console.log(error);
        reject(conn);
      }
      resolve(conn);
    });
    conn.connect();
  });
}

export async function execQuery(query: string, connection?: Connection): Promise<any[]> {
  const conn = connection ?? getSqlConnection();
  return new Promise((resolve, reject) => {
    const res: any[] = [];
    const request = new Request(query, (err: unknown) => {
      if (err) {
        throw err;
      }
    });

    request.on("row", (columns) => {
      const row: string[] = [];
      columns.forEach((column) => {
        row.push(column.value);
      });
      res.push(row);
    });
    request.on("requestCompleted", () => {
      resolve(res);
    });
    request.on("error", () => {
      console.error("SQL execQuery failed");
      reject(res);
    });
    conn.execSql(request);
  });
}

export function close(connection?: Connection) {
  const conn = connection ?? getSqlConnection();
  conn.close();
}

registerSql();
