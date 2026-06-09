use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use tauri::Emitter;


#[derive(Serialize)]
struct ProjectIn {
    id: String,
    name: String,
    path: String,
}

#[derive(Debug, Serialize, Clone , Deserialize)]
struct ProjectConfig {
    project_name: String,
    project_path: String,
    id: String,
    build_command: String,
    flash_command: String,
}


#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectOut {
    id: String,
    name: String,
    path: String,
    build_command: String,
    flash_command: String,
    git_status: bool,
}


#[derive(Serialize , Deserialize)]
struct ProjectProgress {
    stage: String,
    message: String,
    current: u8,
    total: u8,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}



#[tauri::command]
fn create_project(app: tauri::AppHandle, name: String, path: String) -> Result<(), String> {
    println!("Creating project: {} at path: {}", name, path);
    let mut child = Command::new("cliEsp")
        .arg("create")
        .arg(&name)
        .arg("--path")
        .arg(&path)
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|err| err.to_string())?;

    let stdout = child
        .stdout
        .take()
        .ok_or("Failed to capture CLI output")?;

    let reader = BufReader::new(stdout);

    for line in reader.lines() {
        let line = line.map_err(|err| err.to_string())?;

        if let Some(json_text) = line.strip_prefix("__ESP_PROGRESS__:") {
            let progress: ProjectProgress =
                serde_json::from_str(json_text).map_err(|err| err.to_string())?;

            app.emit("project-progress", &progress)
                .map_err(|err| err.to_string())?;
        } else {
            println!("{}", line);
        }
    }

    let status = child.wait().map_err(|err| err.to_string())?;

    if status.success() {
        Ok(())
    } else {
        Err("CLI failed to create project.".to_string())
    }
}


#[tauri::command]
fn load_data() -> Result<Vec<ProjectIn>, String> {
    let home_dir = dirs::home_dir()
        .ok_or("Failed to get home directory")?;

    let db_path = home_dir.join("esp_rust_projects.json");

    if !db_path.exists() {
        return Ok(Vec::new());
    }

    let db_content = std::fs::read_to_string(&db_path)
        .map_err(|err| err.to_string())?;

    let data: Vec<ProjectConfig> = serde_json::from_str(&db_content)
        .map_err(|err| err.to_string())?;

    let projects: Vec<ProjectIn> = data
        .into_iter()
        .map(|project| ProjectIn {
            id: project.id,
            name: project.project_name,
            path: project.project_path,
        })
        .collect();

    Ok(projects)
}


fn get_project_by_id(id: &str) -> Result<ProjectConfig, String> {
    let home_dir = dirs::home_dir()
        .ok_or("Failed to get home directory")?;

    let db_path = home_dir.join("esp_rust_projects.json");

    if !db_path.exists() {
        return Err("No projects found".to_string());
    }

    let db_content = std::fs::read_to_string(&db_path)
        .map_err(|err| err.to_string())?;

    let data: Vec<ProjectConfig> = serde_json::from_str(&db_content)
        .map_err(|err| err.to_string())?;

    data.into_iter()
        .find(|project| project.id == id)
        .ok_or("Project not found".to_string())
}

#[tauri::command]
fn get_project_configs(id: &str) -> Result<ProjectOut, String> {

    let project = get_project_by_id(id);

        match project {
            Ok(proj) => {
                 let git_dir = PathBuf::from(&proj.project_path).join(".git");
                let has_git = git_dir.exists();
                let  project_out = ProjectOut {
                    id: proj.id,
                    name: proj.project_name,
                    path: proj.project_path,
                    build_command: proj.build_command,
                    flash_command: proj.flash_command,
                    git_status: has_git
                };

                Ok(project_out)
               
             
            },
            Err(err) => Err(err.clone()),
        }

   
}










#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_project, load_data, get_project_configs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
