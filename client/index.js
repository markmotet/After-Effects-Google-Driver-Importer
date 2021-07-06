const folderId = 'FOLDER_ID';
const apiKey = 'API_KEY';
const folderUrl = 'https://www.googleapis.com/drive/v3/files?q=%' + folderId + '%27+in+parents&key=' + apiKey;

function getFileId(theFolderUrl) {
  https.get(theFolderUrl, (response) => {
  
    var data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      var theId = JSON.parse(data).files[1].id;
      someFunc(theId)
      return theId;
    });
  
  })
}

async function someFunc(id) {
  const reponse = await drive.files.get({
    fileId: id,
    fields: '*'
  });
}
//getFileId(folderUrl);




function toggleOptions() {

  const options = document.getElementById("options"); 

  if (options.style.display === "none") {
    options.style.display = "block";
  } 
  else {
    options.style.display = "none";
  } 
}


   







// /* 1) Create an instance of CSInterface. */
// var csInterface = new CSInterface();
// /* 2) Make a reference to your HTML button and add a click handler. */
// var applyButton = document.querySelector("#apply-button");
// applyButton.addEventListener("click", () => {
//   downloadFile('1rWYM2BlCVDQuujlaTdBEh45ekRJwHTwe', 'me.jpg');
// });

