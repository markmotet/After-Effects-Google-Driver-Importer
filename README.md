# Adobe After Effects Google Drive Importer Extension
An After Effects extension that lets you download files from a Google Drive folder by pasting in the Drive folder link.

## Preview
<img src="https://user-images.githubusercontent.com/47171417/139519797-1573c23e-2e58-40cc-b8df-4086c672ca3b.png" width="400" />

## Requirements:
- After Effects 2021 or newer
- Windows 10

## Installation
1. Download the Extension ([Download Link](https://github.com/markmotet/After-Effects-Google-Driver-Importer/raw/main/GoogleDriveImporter.zxp))
2. Download and install ZXP Installer ([Download Link](https://aescripts.com/learn/zxp-installer/))
3. Install GoogleDriveImporter.zxp using ZXP Installer
4. You're done!

## Use
1. Open the extension window in After Effects by selecting *Window > Extensions > Google Drive Importer*

<img src="https://user-images.githubusercontent.com/47171417/139520326-731fa43a-5ad9-4c73-aadb-a03e3e0e0df8.png" width="500" />

2. Click *Link to Google Account*
Your default web browser will open and it will ask you to choose which Google account you want to link. Follow the prompts and agree to all permission requests.

3. Paste the code you get into the extension window field and click *Submit Code*.

4. Paste the Full Google Drive Link or the folder ID of the folder you want to import using the extension

For example:

```
https://drive.google.com/drive/u/0/folders/1NMcSwAnDjJw2RiT_l3az-fripAmxv6ht
```
or
```
1NMcSwAnDjJw2RiT_l3az-fripAmxv6ht
```
5. You're done!

## Note
This app is not verified by Google yet and is in developer mode. This means nobody can use it without me manually adding your email to the dev list.

## Change active Google Account
I have not implemented a way to sign out yet, so for now you need to navigate to *C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\google-drive-importer* and delete token.js.

<img src="https://user-images.githubusercontent.com/47171417/139521177-d099ded2-5e81-41c0-b207-9520d57c2946.png" width="600" />







