from pathlib import Path

def list_all_files(directory_path):
    """Recursively lists all files in the specified directory."""
    target_dir = Path(directory_path)
    
    if not target_dir.exists():
        print(f"Directory '{directory_path}' does not exist.")
        return

    print(f"Files found in: {target_dir.resolve()}\n")
    
    # rglob('*') finds everything recursively; is_file() filters out folders
    file_count = 0
    for file_path in target_dir.rglob('*'):
        if file_path.is_file():
            # Prints the path relative to your target folder
            print(file_path.relative_to(target_dir))
            file_count += 1
            
    print(f"\nTotal files found: {file_count}")

if __name__ == "__main__":
    # Replace with your target folder path
    target_folder = "images/photos/photo-gallery"
    list_all_files(target_folder)