import path from "node:path";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import "express-async-errors";

import errorMiddleware from "@/middlewares/error.middleware";
import { env } from "./env";
import { routes } from "./routes";

const swaggerDocument = YAML.load(path.join(__dirname, "../docs/swagger.yaml"));

class App {
	public app: express.Express;

	constructor() {
		this.app = express();

		this.config();
		this.routes();
	}

	private config(): void {
		this.app.use(
			cors({
				origin: env.URL_CORS,
				methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
				allowedHeaders: ["Content-Type", "Authorization"],
			}),
		);
		this.app.use(
			express.json({
				limit: "10mb",
			}),
		);
	}

	private routes(): void {
		this.app.get("/", (_req, res) => {
			res.status(200).json({
				message: "Welcome to the API",
			});
			return;
		});

		this.app.use(routes.authRouter);
		this.app.use(routes.companyRouter);
		this.app.use(routes.productRouter);

		this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

		this.app.use(errorMiddleware);

		this.app.use("*", (_req, res, _next) => {
			res.redirect("/docs");
		});
	}

	public start(PORT: string | number): void {
		this.app.listen(PORT, () => console.log(`Running on port ${PORT}`));
	}
}

export { App };

// A execução dos testes de cobertura depende dessa exportação
export const { app } = new App();
