import "dotenv/config";
import z from "zod";
export function env(name) {
    return z.string().parse(process.env[name]);
}
//# sourceMappingURL=env.js.map