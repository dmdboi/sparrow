import { OpenAPIRoute, OpenAPIRouteSchema } from "@cloudflare/itty-router-openapi";

export class TaskCheck extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Tasks"],
    summary: "Checks if task was recorded today",
    responses: {
      "200": {
        description: "Returns success boolean",
        schema: {
          success: Boolean,
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

    // Implement your own object insertion here
    const { results } = await env.DB.prepare(
      ` SELECT * FROM tasks 
        ORDER BY created_at DESC
        LIMIT 10`
    ).all();

    let today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastNight = today.setDate(today.getDate() - 1).valueOf();

    // Check if task.created_at epoch is greater than midnight yesterday
    const task = results.find(result => result.created_at > lastNight);

    if (task) {
      await fetch(env.DISCORD_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `No task recorded today`,
        }),
      });

      return {
        success: false,
        error: "No task recorded today",
      };
    }

    return {
      success: true,
    };
  }
}
