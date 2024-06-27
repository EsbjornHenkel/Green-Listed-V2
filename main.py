from flask import Flask, render_template, request
import json
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/defaultSettings")
def defaultSettings():
    with open("defaultSettings.json", "r") as f:
        settings = json.load(f)
    return settings

@app.route("/loadLibrary", methods=['PATCH'])
def loadLibrary():
    data = request.get_json()
    libraryName = data.get('libraryName', "")
    with open("libraries.json", "r") as jsonFile:
        libraries = json.load(jsonFile)
        for library in libraries:
            if library.get("name") == libraryName:
                with open(library["fileName"], "r") as dataFile:
                    fileData = dataFile.read()
                    library["fileData"] = fileData
                    return library

    return ""


if __name__ == '__main__':
    app.run(debug=True)