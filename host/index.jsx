var project = app.project;

function getProjectLocation() {
    var path = project.file.fsName;
    return path;
}

// Imports all the files in the input folder given by folderLocation
function importFiles(folderLocation) {
    
    var files = new Folder(folderLocation).getFiles();
    var item;
    
    app.beginUndoGroup("Google Drive Files Import");
    for(var i = 0; i < files.length; i++) {
        item = project.importFile(new ImportOptions(files[i]));
        $.writeln(item.name)
    }
    app.endUndoGroup();
}

// Imports the one file given by fileLocation
function importFile(fileLocation) {
    
    projectItems = project.rootFolder.items;
    
    var driveFolder;
    
    if (projectItems.length == 0) {
        driveFolder = project.items.addFolder('Google Drive Downloads');
    }
    
    // Scans each project item and adds the Google Drive Downloads folder if it doens't already exist
    for (var i = 1; i <= projectItems.length; i++) {      
        if (projectItems[i].name == 'Google Drive Downloads') {
            driveFolder = projectItems[i];
            break;
        }
        else if (i == projectItems.length) {
            alert("Didn't find any folder");
            break;
        }
    }

    var importedFile = project.importFile(new ImportOptions(fileLocation));
    importedFile.parentFolder = driveFolder;
    importedFile.selected = true;
}
