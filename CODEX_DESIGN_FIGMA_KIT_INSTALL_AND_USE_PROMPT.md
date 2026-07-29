# Codex Design/Figma Kit

## Install Prompt For Codex

Use this after the zip is extracted into the target project folder.

```text
Install the local Codex design kit from this folder.

Context:
- This kit contains AGENTS.md, .codex/skills, .codex/prompts, .codex/agents, and design reference docs.
- The intended work is Figma design, UI/UX design systems, and optional frontend implementation.
- Do not copy or create auth tokens, API keys, sessions, sqlite logs, cache, runtime files, or secrets.

Tasks:
1. Inspect the extracted kit structure.
2. If this project already has AGENTS.md, merge the useful instructions without deleting project-specific rules.
3. Copy or merge .codex/skills, .codex/prompts, and .codex/agents into the project-local .codex folder.
4. Preserve existing user/project skills if present.
5. Confirm that design/UI/Figma-related skills are available:
   - ui-ux-pro-max
   - ui-styling
   - design-system
   - brand
   - banner-design
   - design
   - visual-ralph
   - ralph
   - analyze
   - plan
   - code-review
6. If Figma work is needed, verify the Figma connector/plugin is connected in Codex/ChatGPT. If it is not connected, tell the user to connect Figma; do not fake Figma access.
7. Run a lightweight validation: list the installed skills and report what was installed or skipped.

Ask only before overwriting an existing AGENTS.md or deleting/renaming existing project files.
```

## Figma Design Prompt

Use this after the kit is installed and the Figma connector is connected.

```text
Create a polished Figma design from the attached brief/references.

Use the Figma connector. If no target file is provided, create a new Figma design file. Use installed UI/UX/design skills as guidance, especially ui-ux-pro-max, design-system, brand, and Figma skills.

Deliverables:
- Desktop frame 1440px
- Mobile frame 390px
- Reusable local components
- Color, typography, spacing, radius, shadow tokens
- Main user flow screens
- Component states: default, hover/focus where relevant, empty, loading, error
- Short design rationale inside the Figma file

Work incrementally:
1. Read the brief and references.
2. Create or inspect the Figma file.
3. Establish design direction and tokens.
4. Build layout section by section.
5. Validate screenshots after each major section.
6. Fix text clipping, overlap, contrast, spacing, and mobile responsiveness.
7. Final report with Figma link and what was created.

Rules:
- Do not use random hardcoded styling if design-system variables/components exist.
- Do not create paid resources.
- Do not use emoji as structural icons.
- Do not leave text clipped or overlapping.
- Ask only if you need access to a Figma team/file or missing brand assets.
```

If there is an existing Figma file, add:

```text
Target Figma file: <paste Figma link>
Use this file, do not create a new one.
```
