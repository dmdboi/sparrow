import { OpenAPIRoute, OpenAPIRouteSchema, Query } from "@cloudflare/itty-router-openapi";
import { Task } from "../types";

export class TaskList extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Tasks"],
    summary: "List Tasks",
    parameters: {
      page: Query(Number, {
        description: "Page number",
        default: 0,
        required: true,
      }),
      limit: Query(Number, {
        description: "Limit number",
        default: 0,
        required: true,
      }),
      order: Query(String, {
        description: "Order direction",
        default: "ASC",
        required: true,
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of tasks",
        schema: {
          success: Boolean,
          result: {
            tasks: [Task],
          },
        },
      },
    },
  };

  async handle(request: Request, env: any, context: any, data: Record<string, any>) {
    const AUTH_TOKEN = env.AUTH_TOKEN;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const { page, limit, order } = data.query;

    if (Number.isNaN(page) || page < 0) {
      return {
        success: false,
        error: "Invalid page number",
      };
    }

    if (Number.isNaN(limit) || limit < 0) {
      return {
        success: false,
        error: "Invalid limit",
      };
    }

    console.log(`
    SELECT *
    FROM tasks
    ORDER BY created_at ${order}
    LIMIT ${limit}
    OFFSET ${Number(page) * Number(limit)}
    `);

    const { results } = await env.DB.prepare(
      `
    SELECT *
    FROM tasks
    ORDER BY created_at ${order}
    LIMIT ${limit}
    OFFSET ${Number(page) * Number(limit)}
    `
    ).all();

    return {
      success: true,
      tasks: results,
    };
  }
}
