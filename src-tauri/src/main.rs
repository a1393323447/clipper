#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent, GlobalWindowEvent, AppHandle};
use tauri::WindowEvent;
use tauri::Manager;

fn window_event_handler(event: GlobalWindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event.event() {
        api.prevent_close();
        event.window().hide().expect("Failed to hide window");
    }
}

fn system_tray_event_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } if id == "exit" => {
            app.windows().values().for_each(|window| { let _ = window.close(); });
            app.exit(0);
        }
        SystemTrayEvent::DoubleClick { .. } => {
            let main_window = app.get_window("main").expect("Failed to get main window");
            main_window.show().expect("Failed to show main window !");
        },
        _ => { },
    }
}

fn main() {
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("exit".to_string(), "Exit"));

    
    tauri::Builder::default()
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_window_event(window_event_handler)
        .on_system_tray_event(system_tray_event_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
