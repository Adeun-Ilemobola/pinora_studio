import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { Link } from "react-router";
import { FolderOpen, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProjectProgress = {
    stage: string;
    message: string;
    current: number;
    total: number;
};

type ProjectIn = {
    name: string;
    id: string;
    path: string;
};

export default function DashboardPage() {
    const [createProjectForm, setCreateProjectForm] = useState({
        name: "",
        path: "",
    });
    const [projects, setProjects] = useState<ProjectIn[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [progress, setProgress] = useState<ProjectProgress | null>(null);

    useEffect(() => {
        async function loadProjects() {
            const projects = await invoke<ProjectIn[]>("load_data");
            setProjects(projects);
        }

        loadProjects();

        const unlistenPromise = listen<ProjectProgress>(
            "project-progress",
            (event) => {
                setProgress(event.payload);

                if (event.payload.current >= event.payload.total) {
                    setProgress(null);
                    setCreateProjectForm({ name: "", path: "" });
                    setShowForm(false);
                    loadProjects();
                }
            },
        );

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };
    }, []);

    async function handleCreateProject() {
        if (!createProjectForm.name || !createProjectForm.path) return;

        const project = await invoke<ProjectIn>("create_project", {
            name: createProjectForm.name,
            path: createProjectForm.path,
        });

        const newProject: ProjectIn = {
            id: project.id,
            name: project.name,
            path: project.path,
        };

        setProjects([...projects, newProject]);
        setCreateProjectForm({ name: "", path: "" });
        setShowForm(false);
    }

    async function selectFolder() {
        const selectedPath = await open({
            directory: true,
            multiple: false,
            title: "Select a Folder",
        });

        if (!selectedPath) return;

        setCreateProjectForm({
            ...createProjectForm,
            path: selectedPath as string,
        });
    }

    const progressPercent = progress && progress.total > 0
        ? ((progress.current / progress.total) * 100).toFixed(2)
        : "0.00";

    return (
        <main className="min-h-screen bg-background text-foreground">
            <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
                <header className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Project Dashboard
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Your projects
                        </h1>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                            Create, open, and manage your scaffolded projects from one place.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        className="w-full sm:w-auto"
                        onClick={() => setShowForm(true)}
                    >
                        <Plus className="mr-2 size-4" />
                        Create New Project
                    </Button>
                </header>

                {projects.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                ) : (
                    <EmptyProjectsState onCreateProject={() => setShowForm(true)} />
                )}
            </section>

            {progress && (
                <div className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border bg-card p-4 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">{progress.stage}</p>
                            <p className="text-sm text-muted-foreground">
                                {progress.message}
                            </p>
                        </div>

                        <p className="shrink-0 text-sm font-medium text-muted-foreground">
                            {progress.current}/{progress.total}
                        </p>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create a new project</DialogTitle>
                        <DialogDescription>
                            Add a project name and choose the folder where the project should be created.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project name</Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Project"
                                value={createProjectForm.name}
                                onChange={(event) =>
                                    setCreateProjectForm({
                                        ...createProjectForm,
                                        name: event.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="path">Project path</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="path"
                                    placeholder="/path/to/project"
                                    value={createProjectForm.path}
                                    readOnly
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={selectFolder}
                                >
                                    Browse
                                </Button>
                            </div>
                        </div>

                        {progress && (
                            <div className="rounded-xl border bg-muted/40 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">{progress.stage}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {progress.message}
                                        </p>
                                    </div>

                                    <p className="text-lg font-semibold">
                                        {progressPercent}%
                                    </p>
                                </div>

                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            className="w-full sm:w-auto"
                            onClick={handleCreateProject}
                            disabled={!createProjectForm.name || !createProjectForm.path}
                        >
                            Create Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

function EmptyProjectsState({ onCreateProject }: { onCreateProject: () => void }) {
    return (
        <Card className="flex min-h-[420px] items-center justify-center border-dashed">
            <CardContent className="flex max-w-md flex-col items-center gap-4 p-8 text-center">
                <div className="rounded-full bg-muted p-4">
                    <Search className="size-10 text-muted-foreground" />
                </div>

                <div className="space-y-1">
                    <h2 className="text-xl font-semibold">No projects found</h2>
                    <p className="text-sm text-muted-foreground">
                        Create your first project to get started.
                    </p>
                </div>

                <Button onClick={onCreateProject}>
                    <Plus className="mr-2 size-4" />
                    Create New Project
                </Button>
            </CardContent>
        </Card>
    );
}

function ProjectCard({ name, id, path }: ProjectIn) {
    return (
        <Link to={`/project/${id}`} className="group block">
            <Card className="h-full transition-colors hover:bg-muted/40">
                <CardContent className="flex h-full flex-col gap-4 p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-muted p-3">
                            <FolderOpen className="size-5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-lg font-semibold tracking-tight">
                                {name}
                            </h2>
                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                {path}
                            </p>
                        </div>
                    </div>

                    <p className="mt-auto truncate rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        {id}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
