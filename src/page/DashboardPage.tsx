import { useEffect, useState } from "react";
import z from "zod"
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";

import { Link } from "react-router";
import { FolderOpen, Icon, PiIcon, Plus, Search } from "lucide-react";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";



type RustMessage ={
      status: boolean,
     text: string,
}
type ProgressType = "Started" | "Step" | "Finished" | "Failed" | "Complete";
type ProgressTypeMode = "create" | "flash" | null;

type ProjectProgress = {
    task: string,
    stage: ProgressType,
    message: string,
    detail: string,
    step: number,
    total: number,
};


type ProjectIn = {
    name: string;
    id: string;
    firmware_path: string;
    ui_path: string
};
const zMakeProject = z.object({
    name: z.string().min(4),
    path: z.string().min(15)
})

export default function DashboardPage() {
    const [dataBase, setDataBase] = useState<ProjectIn[]>([])
    const [project, setProject] = useState<ProjectIn | null>(null)
    const [progress, setProgress] = useState<{ mode: ProgressTypeMode, progressData: ProjectProgress[] }>({
        mode: null,
        progressData: []
    })
    const [portList, setPortList] = useState<string[]>(["None"])
    const [mainPort, setMainPort] = useState<string>("None")
    const [search, setSearch] = useState("")
    const [createForm, setCreateForm] = useState<z.infer<typeof zMakeProject>>({
        name: "",
        path: ""
    })
    const [showCreateForm, setShowCreateForm] = useState(false)


    function ProgressHandle(P: ProjectProgress, m: string) {
        setProgress(state => ({
            mode: m as ProgressTypeMode,
            progressData: [...state.progressData, P]
        }))

    }




    useEffect(() => {
        invoke<ProjectIn[]>("load_data").then(data => {
            setDataBase(data)
        })

        const alllisten = async () => {

            const unlistenCreate = await listen<ProjectProgress>('listen_create', (event) => {
                console.log(`Got error, payload: ${event.payload}`);
                ProgressHandle(event.payload, "create")
            });
            const unlistenFlash = await listen<ProjectProgress>('listen_flash ', (event) => {
                console.log(`Got error, payload: ${event.payload}`);
                ProgressHandle(event.payload, "flash")
            });



            return [unlistenCreate, unlistenFlash]

        }


        return () => {
            alllisten().then(list => {
                list.forEach(fu => {
                    fu()
                })
            })
        };

    }, []);



    async function start_Create() {
        const valid = zMakeProject.safeParse(createForm)

        if (!valid.success) {
            const err = z.flattenError(valid.error)
            err.formErrors.forEach(item => {

            })
            return

        }
        const data = valid.data
        await invoke("create_project", { name: data.name, path: data.path })


    }




    function build_project(id: string) {

    }

    function project_flash(id: string) {

    }
    async function open_select_directory() {
        const directory = await open({
            directory: true,
            multiple: false,
        });

        if (directory) {
            setCreateForm(state => ({
                ...state,
                path: directory
            }))
            console.log("Selected directory:", directory);
        } else {
            console.error("failed to select directory:", directory);
        }

    }
    function openSide(id: string) {
        const get_project = dataBase.find(item => item.id === id);
        if (!get_project) {

            return
        }
        setProject(get_project)
    }
    function closeSide() {
        setProject(null)
    }




    return (
        <main className="min-h-screen bg-background text-foreground  flex flex-col gap-5">

            <header className=" flex flex-row-reverse gap-1.5 p-6 items-center">
                <Button size={"lg"}>
                    Create
                </Button>

            </header>

            <section className={` flex p-4 flex-1 flex-row gap-3 ${dataBase.length === 0 && " items-center justify-center"}`}>
                {dataBase.length === 0 ?
                    (<>
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <PiIcon />
                                </EmptyMedia>
                                <EmptyTitle>No data</EmptyTitle>
                                <EmptyDescription>No data found</EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button>Add data</Button>
                            </EmptyContent>
                        </Empty>


                    </>)
                    :
                    (<>
                        {dataBase.map(content => (<ProjectCard key={content.id} info={content} Expand={openSide} />))}


                    </>)
                }

            </section>



            <Drawer
            
                onClose={() => {
                    closeSide()

                }}
                onOpenChange={(open) => {
                    if (!open) {
                        setProject(null);
                    }
                }}
                open={project != null}
                direction="right"
            >

                <DrawerContent className=" w-[50vw]">
                    <DrawerHeader>
                        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                        <DrawerDescription>This action cannot be undone.</DrawerDescription>
                    </DrawerHeader>
                    <div className="flex-1 overflow-y-auto p-4">{/* Content here */}</div>
                    <DrawerFooter>

                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

        </main>
    );
}
type ProjectCardProp = {
    Expand: (id: string) => void,
    info: ProjectIn

}

function ProjectCard({ Expand, info }: ProjectCardProp) {


    async function copy_path(path: string) {
        await writeText(path);
        toast.success("successfully copied")
    }
    async function open_vs_code() {

        const get_root_path = info.firmware_path.replace("/Firmware", "")
        console.info(`raw path: ${info.firmware_path} new path: ${get_root_path}`)
        const output = await invoke<RustMessage>("open_vs_code", { path: get_root_path })
        if (output.status) {
            toast.success(output.text)
        }else{
             toast.success(output.text)
        }

    }


    return (
        <Card className=" min-w-2xs h-fit">
            <CardContent className=" flex flex-col gap-1">
                <h1 className=" text-3xl font-bold truncate">{info.name}</h1>

                <div className=" flex flex-row gap-2.5 items-center">
                    <Button size={"sm"} variant={"secondary"} onClick={() => copy_path(info.firmware_path)} >
                        Firmware path
                    </Button>
                    <Button size={"sm"} variant={"secondary"} onClick={() => copy_path(info.ui_path)} >
                        Ui path
                    </Button>
                </div>
                <Separator />
                <div className=" flex flex-row-reverse gap-2.5 items-center">
                    <Button variant={"default"} onClick={() => Expand(info.id)} >
                        Expand
                    </Button>
                    <Button variant={"link"} onClick={() => open_vs_code()} >
                        open vs code
                    </Button>

                </div>

            </CardContent>

        </Card>
    )


}
