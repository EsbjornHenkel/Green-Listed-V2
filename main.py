from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/loadTxtFile", methods=['PATCH'])
def loadTxtFile():
    data = request.get_json()
    filename = data.get('libraryFile', "")
    with open(filename, "r") as f:
        text = f.read()
    return text

if __name__ == '__main__':
    app.run(debug=True)