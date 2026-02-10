import express from "express";
import { auth } from "./lib/auth.js";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import dotenv from "dotenv";
import taskRouter from "./routes/task.routes.js";
import categoryRouter from "./routes/category.routes.js";
import authRouter from "./routes/auth.routes.js";
import { config } from "./config/app.config.js";
import userRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import morganMiddleware from "./logger/morgan.logger.js";

dotenv.config({
  path: ".env",
  override: true,
});

const app = express();
const port = 3005;

app.use(
  cors({
    origin: [config.FRONTEND_ORIGIN],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morganMiddleware);

app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("", authRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
