#!/usr/bin/env python3

import json
from datetime import date
from flask import Flask, render_template, request, make_response, redirect
import pandas as pd
import subprocess
from pathlib import Path

with open(Path("static", "words.json"), "r") as f:
    words_dict = json.load(f)


def generate_default_dict(name):
    return {
        "name": name,
        "latest_tests": {},
        "upper": {},
        "lower": {},
        "words": {},
        "heart_words": {},
        "numbers": {},
        "cvc": {},
        "ccvc": {},
        "digraphs": {},
    }


class Database(object):
    def __init__(self, db_path):
        self.db_path = db_path
        try:
            with open(db_path, "r") as f:
                self.db = json.load(f)
        except FileNotFoundError:
            self.db = {"kids": {}, "settings": {}}

    def save(self):
        with open(self.db_path, "w") as f:
            json.dump(self.db, f)

    @property
    def kids(self):
        kid_names = list(self.db["kids"].keys())
        kid_names.sort()
        return kid_names

    def new_kid(self, kid_name) -> bool:
        kid_dict = generate_default_dict(kid_name)
        kid_dict["name"] = kid_name
        self.db["kids"][kid_name] = kid_dict
        self.save()
        return True

    def delete_kid(self, kid_name) -> bool:
        del self.db["kids"][kid_name]
        self.save()
        return True

    def get_kid(self, kid_name) -> "Kid":
        kid_dict = self.db["kids"].get(kid_name, generate_default_dict(kid_name))
        if kid_dict["name"] is None:
            kid_dict["name"] = kid_name
        kid = Kid(kid_dict)
        return kid

    def save_kid(self, kid: "Kid"):
        self.db["kids"][kid.name] = kid.dict

    def update_kid(self, kid_name: str, test_type: str, new_results: dict) -> None:
        kid = self.get_kid(kid_name)
        kid.new_test(test_type, new_results)
        print(new_results)
        self.save_kid(kid)
        self.save()

    def make_df(self):
        list_of_dicts = []
        for kid_name in self.kids:
            kid = self.get_kid(kid_name)
            list_of_dicts.extend(kid.data_frame)

        df = pd.DataFrame(list_of_dicts)
        return df.pivot(
            columns="student",
            index=["quiz_type", "date", "target", "type"],
            values="success",
        )

    def generate_dashboard_data(self, dashboard_type):
        dashboard_data = {"students": {}}

        unique_vals = []
        for kid_name in self.kids:
            try:
                kid = self.get_kid(kid_name)
                dashboard_data["students"][kid_name] = {
                    "date": kid.latest_tests[dashboard_type],
                    "results": getattr(kid, dashboard_type),
                }
                # set this here in case the last kid is missing
                # this test type
                unique_vals = list(getattr(kid, dashboard_type).keys())
            except KeyError:
                continue

        if dashboard_type == "words":
            unique_vals = words_dict["words"]

        dashboard_data["unique_vals"] = unique_vals
        return dashboard_data


class Kid(object):
    def __init__(self, kid_dict):
        self.name = kid_dict["name"]
        self.latest_tests = kid_dict.get("latest_tests")
        self.upper_tests = kid_dict.get("upper")
        self.lower_tests = kid_dict.get("lower")
        self.words_tests = kid_dict.get("words")
        self.numbers_tests = kid_dict.get("numbers")
        self.cvc_tests = kid_dict.get("cvc")
        self.ccvc_tests = kid_dict.get("ccvc")
        self.digraphs_tests = kid_dict.get("digraphs")
        self.accepted_test_types = [
            "upper",
            "lower",
            "words",
            "numbers",
            "cvc",
            "ccvc",
            "digraphs",
        ]

    @property
    def dict(self) -> dict:
        return {
            "name": self.name,
            "latest_tests": self.latest_tests,
            "upper": self.upper_tests,
            "lower": self.lower_tests,
            "words": self.words_tests,
            "numbers": self.numbers_tests,
            "cvc": self.cvc_tests,
            "ccvc": self.ccvc_tests,
            "digraphs": self.digraphs_tests,
        }

    @property
    def upper(self) -> dict:
        return self.upper_tests.get(self.latest_tests.get("upper"))

    @property
    def lower(self) -> dict:
        return self.lower_tests.get(self.latest_tests.get("lower"))

    @property
    def words(self) -> dict:
        return self.words_tests.get(self.latest_tests.get("words"))

    @property
    def numbers(self) -> dict:
        return self.numbers_tests.get(self.latest_tests.get("numbers"))

    @property
    def cvc(self) -> dict:
        return self.cvc_tests.get(self.latest_tests.get("cvc"))

    @property
    def ccvc(self) -> dict:
        return self.ccvc_tests.get(self.latest_tests.get("ccvc"))

    @property
    def digraphs(self) -> dict:
        return self.digraphs_tests.get(self.latest_tests.get("digraphs"))

    @property
    def data_frame(self) -> pd.DataFrame:
        list_of_dicts = []
        for quiz_type in self.accepted_test_types:
            for date, results in getattr(self, f"{quiz_type}_tests").items():
                for target in results.values():
                    for success_type, success_value in target["success"].items():
                        list_of_dicts.append(
                            {
                                "student": self.name,
                                "quiz_type": quiz_type,
                                "date": date,
                                "target": target["targetChar"],
                                "type": success_type,
                                "success": success_value,
                            }
                        )

        return list_of_dicts

    def new_test(self, test_type: str, new_results: dict) -> None:
        if test_type not in self.accepted_test_types:
            raise ValueError(f"{test_type} is not an accepted test type.")

        self.latest_tests[test_type] = str(date.today())
        test_dict = getattr(self, f"{test_type}_tests")
        test_dict[str(date.today())] = new_results
        setattr(self, f"{test_type}_tests", test_dict)


app = Flask(__name__, template_folder="templates")
db = Database("students.json")


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", students=db.kids)


@app.route("/quiz/<quiz_type>/<student>", methods=["GET", "POST"])
def quiz(quiz_type, student):
    if request.method == "GET":
        return render_template(f"quiz.html", student=student, type=quiz_type)
    elif request.method == "POST":
        rq = request.get_json()
        if rq["action"] == "quiz_complete":
            db.update_kid(student, quiz_type, rq["results"])
            return "OK", 200


@app.route("/dashboard/<dashboard_type>", methods=["GET"])
def dashboard(dashboard_type):
    success_strings = db.generate_dashboard_data(dashboard_type)
    return render_template(
        "dashboard.html",
        dashboard_type=json.dumps(dashboard_type),
        success_strings=json.dumps(success_strings),
    )


@app.route("/api/<action>", methods=["GET", "POST"])
def api(action):
    if action == "add-kid":
        rq = request.get_json()
        success = db.new_kid(rq["kid_name"])
        return "success" if success else "failure", 200
    elif action == "delete-kid":
        rq = request.get_json()
        success = db.delete_kid(rq["kid_name"])
        return "success" if success else "failure", 200
    elif action == "make-csv":
        response = make_response(db.make_df().to_csv(index=True))
        response.headers[
            "Content-Disposition"
        ] = "attachment; filename=quiz-results.csv"
        response.headers["Content-Type"] = "text/csv"
        return response
    elif action == "make-table":
        table_type = request.args.get("type", "full")
        db.make_df().to_csv("student-results.csv", index=True)

        if table_type == "full":
            subprocess.run(["Rscript", "make-graphs.R"])
        elif table_type == "collapsed":
            subprocess.run(["Rscript", "collapsed-graph.R"])

        return redirect("/static/student_table.html", code=302)
