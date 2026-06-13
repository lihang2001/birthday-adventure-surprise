import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/birthday-adventure-surprise/" : "/",
  server: {
    host: "127.0.0.1",
  },
}));
