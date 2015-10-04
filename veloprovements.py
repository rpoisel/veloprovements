from flask import Flask
from flask_restful import Resource, Api
import psycopg2
import json

app = Flask(__name__)
api = Api(app)


class Veloprovements(Resource):

    def get(self):
        veloprovements = []
        dbconn = psycopg2.connect(host="localhost", dbname="veloprovements", user="user", password="pass")
        dbcur = dbconn.cursor()
        dbcur.execute("SELECT name, description, ST_AsGeoJSON(geom) FROM tbl_veloprovements;")
        for veloprovement in dbcur.fetchall():
            veloprovements.append({
                "type": "Feature",
                "properties": {
                    "name": veloprovement[0],
                    "description": veloprovement[1]
                },
                "geometry": json.loads(veloprovement[2])
            })
        dbcur.close();
        dbconn.close();
        return {
            "type": "FeatureCollection",
            "features": veloprovements
        }

    def post(self):
        #INSERT INTO tbl_veloprovements (name, description, geom) VALUES ( 'Europaplatz', 'Radwegfrei', ST_GeomFromGeoJSON('{"type":"Point","coordinates":[15.620176792144774,48.20100838448463]}'));
        pass

api.add_resource(Veloprovements, '/dynamic/veloprovements')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)

