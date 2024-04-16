import { OpenAPIRoute, OpenAPIRouteSchema } from "@cloudflare/itty-router-openapi";

export class TaskStats extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    tags: ["Stats"],
    summary: "List task count per tag",
    responses: {
      "200": {
        description: "Returns list of task count per tag",
        schema: {
          success: Boolean,
          result: {
            tags: [
              {
                tag: String,
                count: Number,
              },
            ],
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

    // Implement your own object insertion here
    const { results } = await env.DB.prepare(`SELECT * FROM tasks`).all();

    const tags = [];

    results.forEach(result => {
      const tag = result.tag ? result.tag : "Default";

      const tagIndex = tags.findIndex(t => t.tag === tag);

      if (tagIndex === -1) {
        tags.push({
          tag,
          count: 1,
        });
      } else {
        tags[tagIndex].count += 1;
      }
    });

    // return the new task
    return {
      success: true,
      tags,
    };
  }
}
