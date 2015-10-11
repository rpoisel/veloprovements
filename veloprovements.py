from flask import Flask
from flask_restful import Resource, Api, reqparse
import psycopg2
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy import create_engine, MetaData
from sqlalchemy import func
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql.base import ischema_names
from geoalchemy2.types import _GISType

import json
import datetime

Base = declarative_base()

class VeloprovementsDb(object):

    def __init__(self, path):
        self.engine = create_engine('postgresql://' + path, echo=True)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker()
        self.Session.configure(bind=self.engine)

    def getSession(self):
        return self.Session()

    def getEngine(self):
        return self.engine


class JSONGeometry(_GISType):

    name = "geometry"

    from_text = "ST_GeomFromGeoJSON"


class Veloprovement(Base):

    __tablename__ = 'veloprovements'
    __table_args__ = {'schema': 'velo'}

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    geom = Column(JSONGeometry, nullable=False)
    created_date = Column(DateTime, default=datetime.datetime.utcnow)


class Veloprovements(Resource):

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('southWestLat', type=float)
        parser.add_argument('southWestLng', type=float)
        parser.add_argument('northEastLat', type=float)
        parser.add_argument('northEastLng', type=float)
        args = parser.parse_args()

        veloprovements = []
        if args['southWestLat'] is not None and \
            args['southWestLng'] is not None and \
            args['northEastLat'] is not None and \
            args['northEastLng'] is not None:
            session = db.getSession()
            for veloprovement in session.query(
                    Veloprovement.id, Veloprovement.name, Veloprovement.description, Veloprovement.geom.ST_AsGeoJSON()
                    ).filter(Veloprovement.geom.ST_Intersects(func.ST_MakeEnvelope(
                        args['southWestLng'], args['southWestLat'], args['northEastLng'], args['northEastLat']))):
                veloprovements.append({
                    "type": "Feature",
                    "properties": {
                        "id": veloprovement[0],
                        "name": veloprovement[1],
                        "description": veloprovement[2]
                    },
                    "geometry": json.loads(veloprovement[3])
                })
            session.close();
        return {
            "type": "FeatureCollection",
            "features": veloprovements
        }

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str)
        parser.add_argument('description', type=str)
        parser.add_argument('geometry', type=str)
        args = parser.parse_args()

        session = db.getSession()
        session.add(Veloprovement(name=args['name'], description=args['description'], geom=args['geometry']))
        session.commit()
        session.close();

    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int)
        args = parser.parse_args()

        session = db.getSession()
        veloprovement = session.query(Veloprovement).filter(Veloprovement.id == args['id']).first()
        session.delete(veloprovement)
        session.commit()
        session.close();


app = Flask(__name__)
api = Api(app)
dbpath = 'velo:velo@localhost/veloprovements'
db = VeloprovementsDb(path=dbpath)
api.add_resource(Veloprovements, '/dynamic/veloprovements')

if __name__ == "__main__":
    db = VeloprovementsDb(path=dbpath)
    session = db.getSession()
    session.add(Veloprovement(name='userdefined', description='bla', geom='{"type":"LineString","coordinates":[[1,2],[4,5],[7,8]]}'))
    for veloprovement in session.query(Veloprovement.name, Veloprovement.description, Veloprovement.geom.ST_AsGeoJSON()):
        print(veloprovement)
    session.commit()
    session.close()

    #app.run(host='0.0.0.0', port=8080)

