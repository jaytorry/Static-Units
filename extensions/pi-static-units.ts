
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execSync } from "node:child_process";
import path from "node:path"; import fs from "node:fs";

export default function (pi: ExtensionAPI) {

  let extension_active = true;
  let prompt_injected = false;
  let requirements_installed = false;

  const resources = `${path.dirname(__dirname)}/resources`
  const units_checker = `${resources}/python/check_python_units.py`
  const python_requirements = `${resources}/python/requirements.txt`
  const prompt_file = `${resources}/prompts/units-with-automated-check.md`

  pi.on("before_agent_start", async (event, ctx) => {
    /** Inject units-specific system prompt */
    if (extension_active) {
      if (!prompt_injected) {
        try {
          const units_prompt = fs.readFileSync(prompt_file);
          event.systemPromptOptions.appendSystemPrompt = `<units>\n${units_prompt}</units>`;
          prompt_injected = true;
        } catch (err: any) {
          const msg = "Disabling extension static-units: Failed to update system prompt";
          ctx.ui.notify(`${err.stack}\n${msg}`);
          extension_active = false;
        }
      }
    }
  })

  pi.on("tool_result", async (event, ctx) => {
    if (extension_active) {
      if (event.toolName === "write" || event.toolName === "edit") {
        if (path.extname(String(event.input.path)).toLowerCase() === ".py") {
          /** Install Python dependencies */
          if (!requirements_installed) {
            const cmd = `pip install --no-cache-dir -r ${python_requirements}`;
            try {
              const response = execSync(cmd).toString();
              requirements_installed = true;
            } catch (err: any) {
              const msg = "Disabling extension static-units: Failed to install python dependencies";
              ctx.ui.notify(`${cmd}\n${err.stack}\n${msg}`);
              extension_active = false;
            }              
          }
          /** Run the units checker */
          if (requirements_installed) {
            try {
              const cmd = `python ${units_checker} ${event.input.path}`;
              const checker_output = execSync(cmd);
              ctx.ui.notify(checker_output.toString());
              return {  // add output to context
                content: [...event.content, {type: "text", text: checker_output.toString()}]
              };
            } catch (err: any) {
              const msg = "Disabling extension static-units: Failed to execute static units checker"
              ctx.ui.notify(`${err.stack}\n${msg}`);
              extension_active = false;
            }
          }
        }
      }
    }
  })

}
