
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execSync } from "node:child_process";
import path from "node:path"; import fs from "node:fs";

export default function (pi: ExtensionAPI) {

  let extension_active = true;

  const resources = `${path.dirname(__dirname)}/resources`
  const units_checker = `${resources}/python/check_python_units.py`
  const python_requirements = `${resources}/python/requirements.txt`
  const prompt_file = `${resources}/prompts/units-with-automated-check.md`

  pi.on("session_start", async (event, ctx) => {
    /**
      Install Python dependencies for the static units checker
      Important: The current default pip location will be used 
      To use a venv, activate in terminal before launching pi
    */
    if (extension_active) {
      const cmd = `pip install --no-cache-dir -r ${python_requirements}`;
      try {
        const response = execSync(cmd).toString();
        ctx.ui.notify(`Extension static-units: Installing Python dependencies ...\n${cmd}\n${response}`);
      } catch (err: any) {
        const msg = "Disabling extension static-units: Failed to install python dependencies";
        ctx.ui.notify(`${cmd}\n${err.stack}\n${msg}`);
        extension_active = false;
      }
    }
  })

  pi.on("before_agent_start", async (event, ctx) => {
    /** Inject units-specific system prompt */
    if (extension_active) {
      try {
        const units_prompt = fs.readFileSync(prompt_file);
        ctx.ui.notify(`Extension static-units: Injecting system prompt:\n<units>\n${units_prompt}</units>`);
        event.systemPromptOptions.appendSystemPrompt = `<units>\n${units_prompt}</units>`;
      } catch (err: any) {
        const msg = "Disabling extension static-units: Failed to update system prompt";
        ctx.ui.notify(`${err.stack}\n${msg}`);
        extension_active = false;
      }
    }
  })

  pi.on("tool_result", async (event, ctx) => {
    /** Run the static units checker */
    if (extension_active) {
      try {
        if (event.toolName === "write" || event.toolName === "edit") {
          if (path.extname(String(event.input.path)).toLowerCase() === ".py") {
            const cmd = `python ${units_checker} ${event.input.path}`;
            const checker_output = execSync(cmd);  // run the checker
            ctx.ui.notify(checker_output.toString());
            return {  // add checker output to context
              content: [...event.content, {type: "text", text: checker_output.toString()}]
            };
          }
        }
      } catch (err: any) {
        const msg = "Disabling extension static-units: Failed to execute static units checker"
        ctx.ui.notify(`${err.stack}\n${msg}`);
        extension_active = false;
      }
    }
  })

}
