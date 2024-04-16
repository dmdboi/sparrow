import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { TaskCreate } from "./endpoints/taskCreate";
import { TaskFetch } from "./endpoints/taskFetch";
import { TaskList } from "./endpoints/taskList";
import { TaskStats } from "endpoints/taskStats";
import { TaskCheck } from "endpoints/check";

export const router = OpenAPIRouter({
  docs_url: "/",
});

router.get("/api/tasks/", TaskList);
router.post("/api/tasks/", TaskCreate);
router.get("/api/tasks/:taskId/", TaskFetch);

router.get("/api/stats/", TaskStats);
router.get("/api/check", TaskCheck);

// 404 for everything else
router.all("*", () =>
  Response.json(
    {
      success: false,
      error: "Route not found",
    },
    { status: 404 }
  )
);

export default {
  fetch: router.handle,
  scheduled: async (event, env, ctx) => {
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
  },
};
