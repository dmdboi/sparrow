import { OpenAPIRoute, OpenAPIRouteSchema } from "@cloudflare/itty-router-openapi";
import { Task } from "../types";

export class TaskCreate extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Tasks"],
    summary: "Create a new Task",
    requestBody: Task,
    responses: {
      "200": {
        description: "Returns the created task",
        schema: {
          success: Boolean,
          result: {
            task: Task,
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

    // Retrieve the validated request body
    const taskToCreate = data.body;

    // Implement your own object insertion here
    await env.DB.prepare(`INSERT INTO tasks (name, tag, created_at) VALUES (?, ?, ?)`)
      .bind(taskToCreate.name, taskToCreate.tag ? taskToCreate.tag : "Default", new Date().valueOf())
      .run();

    // return the new task
    return {
      success: true,
      task: {
        name: taskToCreate.name,
        slug: taskToCreate.slug,
        tag: taskToCreate.tag,
      },
    };
  }
}
