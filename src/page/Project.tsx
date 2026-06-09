import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProjectOut = {
  id: string;
  name: string;
  path: string;
  build_command: string;
  flash_command: string;
  git_status: boolean;
};
type GitHubItem = {
  name: string,
  path: string,
  item_type: string,
  download_url: string
}
export default function Project() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modules, setModules] = useState<GitHubItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      setIsLoading(true);
      setErr(null);

      try {
        const projectData = await invoke<ProjectOut>("get_project_configs", {
          id: projectId,
        });
        const listOfModules = await invoke<GitHubItem[]>("load_available_modules");
        setModules(listOfModules);
        setProject(projectData);
      } catch (error) {
        console.error("Failed to load project data:", error);
        setErr("Failed to load project data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);


  function modulesFiller(text: string) {
    if (modules.length === 0) {
      return modules.map((module) => {
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(`mod ${module.name.replace(".rs", "")};`);
            }}
          >
            {module.name}
          </Button>
        );
      });
    }
    return modules.filter((module) => module.name.includes(text)).map((module) => {
      return (
       <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(`mod ${module.name.replace(".rs", "")};`);
        }}
      >
        {module.name}
      </Button>
      );
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Loading project...</h2>
          <p className="mt-2 text-sm text-muted-foreground">Fetching project details.</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Project not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The project with ID &quot;{projectId}&quot; does not exist.
          </p>
          {err && <p className="mt-4 text-sm text-destructive">{err}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-8 relative">
      Back to dashboard link here
      <Button variant="destructive" className=" fixed top-4 left-4" onClick={() => window.history.back()}>
        &larr; Back to Dashboard
      </Button>



      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Project</p>
            <h1 className="truncate text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="mt-2 truncate text-sm text-muted-foreground">{project.path}</p>
          </div>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {

            }}
          >
            Open VS Code
          </Button>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Useful commands</CardTitle>
              <CardDescription>Copy the commands you use most often.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div className="min-w-0 space-y-1">
                  <Label>Build command</Label>
                  <p className="truncate text-sm text-muted-foreground">{project.build_command}</p>
                </div>

                <div className="flex flex-row gap-1.5">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    }}
                  >
                    Run
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.build_command || "");
                    }}
                  >
                    Copy
                  </Button>

                </div>

              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div className="min-w-0 space-y-1">
                  <Label>Flash command</Label>
                  <p className="truncate text-sm text-muted-foreground">{project.flash_command}</p>
                </div>

                <div className="flex flex-row gap-1.5">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                    }}
                  >
                    Run
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(project.flash_command || "");
                    }}
                  >
                    Copy
                  </Button>

                </div>

              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Git status</CardTitle>
                <CardDescription>Manage the Git setup for this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {project.git_status ? (
                  <div className="space-y-4">
                    <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      Git repository found in this project.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Commit changes
                      </Button>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Push
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                      No Git repository found in this project.
                    </p>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Initialize Git
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Module manager</CardTitle>
                <CardDescription>Manage your project modules and dependencies.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="install" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="install">Install</TabsTrigger>
                    <TabsTrigger value="search">Update</TabsTrigger>
                  </TabsList>

                  <TabsContent value="install" className="mt-4">
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      No install UI added yet.
                    </div>
                  </TabsContent>

                  <TabsContent value="search" className="mt-4 space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input placeholder="Search for a module" />
                      <Button variant="outline" className="w-full sm:w-auto">
                        Search
                      </Button>
                    </div>

                    <div className="min-h-20 rounded-md border border-dashed p-4 text-sm text-muted-foreground flex flex-row gap-2 flex-wrap">
                      {modulesFiller("")}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
