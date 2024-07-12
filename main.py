from flask import Flask, render_template, request
import json 

#use python -m http.server TES T      8000

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/getSettings")
def getsettings():
    with open("settingsDefault.json", "r") as f:
        settings = json.load(f)
    return settings

@app.route("/getLibraries")
def getLibraries():
    with open("settingsLibraries.json", "r") as jsonFile:
        libraries = json.load(jsonFile)
    return libraries

@app.route("/getLibraryData", methods=['PATCH'])
def getLibraryData():
    data = request.get_json()
    libraryFileName = data.get('libraryFileName', "")
    with open(libraryFileName, "r") as dataFile:
        fileData = dataFile.read()
    return fileData


if __name__ == '__main__':
    app.run(debug=True)