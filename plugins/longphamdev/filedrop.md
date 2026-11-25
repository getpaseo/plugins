Filedrop uploads files and folders from your browser to a directory on the Paseo daemon host. Open File drop in the Explorer rail, pick a destination, then drop files or browse to select them. Folder uploads preserve their directory structure. The panel shows upload progress and asks before replacing a destination file.

The destination starts at the current workspace directory. Uploads and directory browsing are limited to the daemon user's home by default. Daemon owners can set `FILEDROP_ALLOWED_ROOTS` to choose other allowed directories. File contents travel over Paseo's existing daemon connection and are written to the selected directory. An interrupted upload can leave an incomplete staging file beside its destination.

Requires Paseo 0.17.0 or later with plugins enabled. File and folder selection works in the web and desktop apps. Native mobile clients can browse directories.
