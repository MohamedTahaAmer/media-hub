//#region // < encodeURI and encodeURIComponent
/*
1- we are using encodeURIComponent to convert the slashes '/' in the dir paths to '%2F' so that all the dirs will be caught by the same route '/dir/[dir]' in the nextjs app
2- we use decodeURIComponent to convert the '%2F' back to it's original '/' in the page component, then we pass the original path to the getFilesAndFolders function

3- we use encodeURI in the getFilesAndFolders function to convert any special chars in the thumbnail path to a format that can be uses in the href attribute of the img tag
*/
//#endregion
