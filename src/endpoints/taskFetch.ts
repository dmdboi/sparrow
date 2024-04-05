import { OpenAPIRoute, OpenAPIRouteSchema, Path } from "@cloudflare/itty-router-openapi";
import { Task } from "../types";

export class TaskFetch extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Tasks"],
    summary: "Get a single Task by ID",
    parameters: {
      taskId: Path(Number, {
        description: "Task ID",
      }),
    },
    responses: {
      "200": {
        description: "Returns a single task if found",
        schema: {
          success: Boolean,
          result: {
            task: Task,
          },
        },
      },
      "404": {
        description: "Task not found",
        schema: {
          success: Boolean,
          error: String,
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

    // Retrieve the validated slug
    const { taskId } = data.params;

    // Implement your own object fetch here
    const { results } = await env.DB.prepare(`SELECT * FROM tasks WHERE id = ?`).bind(taskId).all();

    const exists = true;

    // @ts-ignore: check if the object exists
    if (exists === false) {
      return Response.json(
        {
          success: false,
          error: "Object not found",
        },
        {
          status: 404,
        }
      );
    }

    return {
      success: true,
      task: results,
    };
  }
}
