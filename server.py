from flask import Flask, jsonify, request, flash, redirect, abort
import tempfile
from ng_whistles import predict
import os

api = Flask(__name__, static_folder='client/build', static_url_path='/')
api.secret_key = b'geheimasdfasdf'

@api.route('/')
def index():
    return api.send_static_file('index.html')

@api.route('/segments', methods=['POST'])
def post_segments():
    if 'file' not in request.files:
        return 'No file part', 422
    file = request.files['file']
    if file.filename == '':
        return 'No file', 422
    fname = next(tempfile._get_candidate_names())
    file.save(fname)
    segments,Y = predict.predict(fname)
    segments.start /= predict.fs
    segments.end /= predict.fs
    os.remove(fname)
    return jsonify({
        'segments': segments.to_dict('records'),
        'Y': Y.tolist()
        })

if __name__ == "__main__":
    from waitress import serve
    serve(api, host="0.0.0.0", port=8080)
