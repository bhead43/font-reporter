# Overview

This is a tool to check every document (within a given directory) inside a GraFx Publisher environment and report the fonts used in each document. When run, this will download the XML definition of each document it finds,
read the fonts section, and then record the fonts used by their ID, name, and the document IDs they appeared in. This data is then output to a CSV file.

This is not intended for use as a production ready tool. There are many aspects of this that could be more rigourously tested and optimized. The goal of this is just to demonstrate the feasibility of such a tool, and to 
act as a learning resource for anybody who wants to build their own production ready tool.  

This is a Node JS application, which means that you need to have Node installed to run this.

# How to use

To use this tool, all you need to do is fill out the `config.json` file, then run the `node index.js` in the command line while in the code install directory. Once finished, the result file will be in the `/results` directory
in the install location. 

`config.json` can be broken down into 2 broad categories:
### Authentication and Connection
These properties are all used to establish a connection to the correct GraFx environment.
1. `user`: This should hold the username for a previously configured GraFx Publisher API User (if `apikey` has a value, then this can be left blank)
2. `pass`: This should hold the password for a previously configured GraFx Publisher API User (if `apikey` has a value, then this can be left blank)
3. `apikey`: This should hold a live, valid CHILI API key (if `user` and `pass` have values, then this can be left blank)
4. `environment`: This should hold the name of your GraFx environment, i.e. "cp-abc-123"
5. `isSandbox`: If pointing to a sandbox environment, this should be set to `True`. Otherwise, leave it as `False`.  

On the first three properties: `user`/`pass` are used to generate an API key for the rest of the tool to function. `apikey` does the same thing, but is there if you want to just directly provide an API key and skip the 
login step. If there is _any_ value in `apikey`, then the tool will attempt to use that and will ignore `user`/`pass`.  

### Tool Specific Properties
These properties are all used to fine tune the actual functionality of the tool.
1. `startingDirectory`: This should hold the folder path to the top-most directory you want to run this on, i.e. "Templates\\Brochures". Do note, the tool will search for _every_ document within this directory, including those within subfolders. Keep this blank if you want to search the entire environment.
2. `fontToSearch`: This should hold the name of the font you want to search for. The name _must_ match the name as it exists in the GraFx Publisher environment. If this field is left blank, a report will be generated for every single unique font ID found in doucments on the environment.
