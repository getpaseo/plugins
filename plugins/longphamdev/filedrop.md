Filedrop moves files between your browser and the Paseo daemon host. Open File drop in the Explorer rail, pick a destination, then drop files or browse to select them. Folder uploads preserve their directory structure. The panel shows progress and asks before replacing a destination file.

You can also download from the host. Type a file path or browse the host filesystem, then click a file to save it through your browser. Folders are downloaded as a zip archive, including hidden files, that the daemon builds in its temporary directory and deletes after at most 10 minutes. Uploads and downloads share one Transfers list.

The destination starts at the current workspace directory. Uploads, downloads and directory browsing are limited to the daemon user's home by default, and symlinks that point outside it are refused. Daemon owners can set `FILEDROP_ALLOWED_ROOTS` to choose other allowed directories. File contents travel over Paseo's existing daemon connection. An interrupted upload can leave an incomplete staging file beside its destination. A downloaded file is held in browser memory before it is saved, so very large files can strain the tab.

Requires Paseo 0.17.0 or later with plugins enabled. Dropping, file selection and saving downloads work in the web and desktop apps. Native mobile clients can browse directories.
