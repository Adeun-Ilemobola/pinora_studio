
import { useState, useRef, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from "@/components/ui/dialog"

import {
    Card,

    CardContent,


} from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Search } from "lucide-react";

import { listen } from "@tauri-apps/api/event";

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
    const folderPathRef = useRef<HTMLInputElement>(null);
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
                
            }
        );

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };



    }, []);



    async function handleCreateProject() {
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        if (createProjectForm.name && createProjectForm.path) {
            const project = await invoke<ProjectIn>("create_project", { name: createProjectForm.name, path: createProjectForm.path });
            const newProject: ProjectIn = {
                id: project.id,
                name: project.name,
                path: project.path,
            };
            await invoke("create_project", {
                name: "test_project",
                path: "/Users/ad/Desktop",
            });


            setProjects([...projects, newProject]);
            setCreateProjectForm({ name: "", path: "" });
            setShowForm(false);

        }

    }

    async function selectFolder() {
        const selectedPath = await open({
            directory: true, // Prompts the folder explorer instead of a file picker
            multiple: false, // Restricts selection to a single folder
            title: 'Select a Folder'
        });

        if (selectedPath) {
            console.log("Selected folder path:", selectedPath);
            setCreateProjectForm({
                ...createProjectForm,
                path: selectedPath as string,
            });
        }
    }


    return (
        <main className=" h-screen relative flex flex-col bg-background text-foreground ">

            <Button
                className="absolute top-4 right-4 text-2xl"
                variant={"outline"}
                onClick={() => setShowForm(true)}>
                Create New Project
            </Button>

            {
                progress && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-muted text-white px-4 py-2 rounded-md flex items-center gap-2 z-50">
                        <p>{progress.stage}: {progress.message} ({progress.current}/{progress.total})</p>
                    </div>
                )
            }


            <Dialog open={showForm} onOpenChange={(open) => setShowForm(open)}>
                <DialogOverlay
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a new project</DialogTitle>
                        <DialogDescription>
                            Enter the details of the project you want to create.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                placeholder="My Awesome Project"
                                value={createProjectForm.name}
                                onChange={(e) =>
                                    setCreateProjectForm({
                                        ...createProjectForm,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="path">Project Path</Label>
                            <div className=" flex flex-row gap-1.5 justify-center">
                                <Input
                                    id="path"
                                    placeholder="/path/to/project"
                                    value={createProjectForm.path}
                                    readOnly
                                />
                                <Button
                                    variant={"outline"}
                                    onClick={selectFolder}
                                    className="ml-2"
                                >
                                    Browse
                                </Button>
                            </div>
                        </div>
                    </div>
                   {progress && (
                    <div>
                        <p className="  text-3xl">
                             {((progress.current /progress.total) * 100).toFixed(2)} %
                        </p>
                    </div>
                   )}

                    <DialogFooter>
                        <Button
                            onClick={handleCreateProject}
                        >
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>




            <div
                className={`flex flex-col gap-4 p-4 pt-15 flex-1 ${projects.length > 0 ? "" : " items-center justify-center"}`}
            >
                {projects.length > 0 ?
                    (<>
                        {projects.map((project, index) => (
                            <ProjectCard key={index} {...project} />
                        ))}

                    </>)

                    :
                    (<div className="flex flex-col items-center gap-2">
                        <Search size={48} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground/40">No projects found. Create a new project to get started.</p>
                    </div>)
                }

            </div>

        </main>
    )
}


function ProjectCard({ name, id, path }: ProjectIn) {


    return (
        <Link to={`/project/${id}`} >
        <Card className={` w-100 `}>
            <CardContent className="flex flex-col gap-1">
                <p className="text-2xl font-bold">{name}</p>
                <p className="text-[17px] text-muted-foreground/40 mb-2.5">{path}</p>
                <p className="text-[12px] text-muted-foreground/80 ml-auto ">{id}</p>
            </CardContent>

        </Card>
        </Link>

    )
}
