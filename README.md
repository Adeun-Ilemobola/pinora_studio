<div align="center">

# Pinora Studio

**A desktop workspace for creating, opening, building, flashing, and managing Rust-based ESP32 projects.**

Built with Tauri, Rust, React, and TypeScript.

[Pinora CLI](https://github.com/Adeun-Ilemobola/pinora_cli) · [Report an issue](https://github.com/Adeun-Ilemobola/pinora_studio/issues)

</div>

> [!IMPORTANT]
> Pinora Studio is under active development. Several screens and workflows are still incomplete, and breaking changes should be expected before the first stable release.

## Overview

Pinora Studio is the desktop interface for the Pinora toolchain. It provides a visual workspace for projects created around Rust and the ESP32, while keeping common development actions available from one place.

The application is designed to work alongside **Pinora CLI**. The CLI handles project scaffolding and automation, while Studio provides project discovery, navigation, progress reporting, command execution, and project-level tools through a desktop interface.

## Current capabilities

The current application includes:

- Loading and displaying registered Pinora projects
- Showing firmware and UI paths for each project
- Copying project paths to the clipboard
- Opening a project workspace in Visual Studio Code
- Creating a new project through the Tauri backend
- Selecting a destination directory with a native dialog
- Receiving structured project-creation progress events
- Loading individual project configuration data
- Running and copying configured build commands
- Running and copying configured flash commands
- Displaying build progress emitted by the Rust backend
- Detecting whether a project contains a Git repository
- Loading the available firmware-module list
- Searching and copying Rust module declarations

## In progress

The following areas are present in the interface but are not complete yet:

- Full project-creation form integration
- Flash-progress presentation
- Module installation and update workflows
- Git initialization, commit, and push actions
- Serial-port discovery and device selection
- Expanded project details and management controls
- Production-ready error handling and validation feedback
- Final application branding, icons, and release packaging

## Technology stack

### Desktop and backend

- [Tauri 2](https://tauri.app/)
- Rust 2021 edition
- Tokio
- Serde and Serde JSON
- Reqwest
- UUID
- Tauri plugins for dialogs, clipboard access, logging, opening files, and URLs

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router
- Tailwind CSS 4
- Radix UI and shadcn components
- Zod
- Sonner
- Lucide and Phosphor icons

## Requirements

Before running Pinora Studio, install:

- [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/tools/install)
- The [Tauri system prerequisites](https://v2.tauri.app/start/prerequisites/) for your operating system
- Visual Studio Code, if you plan to use the **Open VS Code** actions

Pinora Studio currently assumes that its Rust backend commands and Pinora project data are available. Some workflows may also require the Pinora CLI and an ESP-IDF/Rust ESP32 development environment.

## Getting started

Clone the repository:

```bash
git clone https://github.com/Adeun-Ilemobola/pinora_studio.git
cd pinora_studio
```

Install the frontend dependencies:

```bash
bun install
```

Start the desktop application in development mode:

```bash
bun run tauri dev
```

## Available commands

```bash
# Start the Vite frontend only
bun run dev

# Type-check and build the frontend
bun run build

# Preview the built frontend
bun run preview

# Run Tauri CLI commands
bun run tauri

# Start the complete desktop application
bun run tauri dev

# Build release bundles
bun run tauri build
```

## Project structure

```text
pinora_studio/
├── src/
│   ├── components/       # Shared UI components
│   ├── lib/              # Frontend utilities
│   ├── page/             # Dashboard and project screens
│   ├── App.tsx           # Router host
│   ├── routes.tsx        # Application routes
│   └── main.tsx          # React entry point
├── src-tauri/
│   ├── src/              # Rust commands and desktop backend
│   ├── Cargo.toml        # Rust dependencies and package metadata
│   └── tauri.conf.json   # Tauri application and bundle configuration
├── package.json          # Frontend dependencies and scripts
└── README.md
```

## Application flow

```text
Pinora Studio UI
        │
        │ Tauri invoke calls and events
        ▼
Rust desktop backend
        │
        ├── project registry and configuration
        ├── filesystem and native dialogs
        ├── build and flash command execution
        ├── progress events
        └── module information
        │
        ▼
Rust-based ESP32 project workspace
```

The frontend calls Rust commands through Tauri and listens for structured progress events. This keeps filesystem access, process execution, and project management in the Rust layer while the React application handles interaction and presentation.

## Development status

Pinora Studio is currently an early-stage development project rather than a finished end-user release. The project dashboard, project configuration screen, build execution, flash execution, native path selection, module discovery, and progress-event foundations are already being developed, but some visible controls remain placeholders.

When contributing or testing, treat the current `main` branch as actively changing.

## Related project

### Pinora CLI

[Pinora CLI](https://github.com/Adeun-Ilemobola/pinora_cli) provides the command-line scaffolding and automation side of the Pinora toolchain. Studio is intended to complement it with a visual desktop workflow.

## Contributing

Issues and focused pull requests are welcome while the project is under active development.

Before submitting changes:

```bash
bun install
bun run build
```

For changes involving the Rust backend or Tauri integration, also verify the desktop application:

```bash
bun run tauri dev
```

Please keep pull requests focused and clearly describe which workflow was changed.

## License

No license has been published for this repository yet. Until one is added, the source remains protected by the repository owner's default copyright rights.
