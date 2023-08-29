#!/usr/bin/env python3

import json
from datetime import date
from flask import Flask, render_template, request, make_response, redirect
from string import ascii_letters
import pandas as pd
import subprocess

targets = list(ascii_letters)
targets.extend(range(21))
targets.extend(["cat", "flip", "think", "because"])


class Database(object):
    def __init__(self, db_path):
        self.db_path = db_path
        try:
            with open(db_path, "r") as f:
                self.db = json.load(f)
        except FileNotFoundError:
            self.db = {}

    @property
    def students(self):
        return list(self.db.keys())

    def new_student(self, student):
        if student in self.db:
            return "Student in list"
        self.db[student] = {"latest_results": {}, "results": {"letter_quizzes": {}}}
        self.save_db()
        return "Success"

    def delete_student(self, student):
        if student not in self.db["students"]:
            return "Student not in list"
        self.db["students"].remove(student)
        self.save_db()
        return "Success"

    @property
    def dates(self):
        return self.db["quizzes"].keys()

    def save_db(self):
        with open(self.db_path, "w") as f:
            json.dump(self.db, f)

    def new_quiz(self, student):
        if student not in self.students:
            return False
        return True

    def complete_quiz(self, student, results):
        today = str(date.today())

        self.db[student]["latest_results"]["letter_quiz"] = today
        self.db[student]["results"]["letter_quizzes"][today] = results

        self.save_db()
        return True

    def complete_heart_quiz(self, results):
        student = results["student"]

        today = str(date.today())
        if student not in self.db["words"]:
            self.db["words"][student] = {}

        self.db["words"][student][today] = results["correct_words"]

        self.save_db()

        return True

    @property
    def heart_words_report(self):
        heart_words = {}
        for student in self.db["words"].keys():
            try:
                latest_quiz = max(self.db["words"][student].keys())
            except ValueError:
                continue
            except KeyError:
                print(student)
            heart_words[student] = self.db["words"][student][latest_quiz]

        return json.dumps(heart_words)

    def generate_report(self):
        report = {}
        for student in self.students:
            latest_date = self.db[student]["latest_results"]["letter_quiz"]
            results = self.db[student]["results"]["letter_quizzes"][latest_date][
                "results"
            ]

            report[student] = {"date": latest_date}
            stu_results = {letter["targetChar"]: {} for letter in results}

            for letter in results:
                # convert for how the dashboard wants data
                if letter["targetType"] == "number":
                    letter["targetType"] = "name"
                elif letter["targetType"] == "word":
                    letter["targetType"] = "read"

                stu_results[letter["targetChar"]][letter["targetType"]] = letter[
                    "success"
                ]

            report[student]["results"] = stu_results

        with open("current-dashboard.json", "w") as f:
            json.dump(report, f)
        return report

    def make_df(self):
        csv_dicts = []
        for date, quizzes in self.db["quizzes"].items():
            for student, quiz in quizzes.items():
                for target, results in quiz.items():
                    try:
                        for category, success in results.items():
                            csv_dicts.append(
                                {
                                    "date": date,
                                    "student": student,
                                    "target": target,
                                    "category": category,
                                    "success": success,
                                }
                            )
                    except AttributeError:
                        print("Attribute error when generating csv")
                        continue

        return pd.DataFrame(csv_dicts)

    def update_record(self, rec):
        target = rec["target"]
        assessment = rec["assess"]

        if target in ["cat", "flip", "think", "because"] and assessment == "name":
            assessment = "read"

        print(target)
        print(assessment)
        print(self.db["quizzes"][rec["date"]][rec["student"]][target])

        if assessment in self.db["quizzes"][rec["date"]][rec["student"]][target]:
            self.db["quizzes"][rec["date"]][rec["student"]][target][assessment] = rec[
                "correct"
            ]
            self.save_db()
            return True
        else:
            return False

    def get_seating_chart(self):
        seating_chart = self.db.get("seating_chart")

        if seating_chart is None:
            seating_chart = {x: "drag-holder" for x in self.students}
        else:
            for student in self.students:
                if student not in seating_chart:
                    seating_chart[student] = "drag-holder"

        return seating_chart

    def update_seating_chart(self, chart):
        self.db["seating_chart"] = chart
        self.save_db()
        return "OK"


app = Flask(__name__, template_folder="templates")

db = Database("students.json")


@app.route("/", methods=["GET"])
def index():
    return render_template("index.html", students=db.students)


@app.route("/quiz/<student>", methods=["GET", "POST"])
def quiz(student):
    if request.method == "GET":
        db.new_quiz(student)
        return render_template("quiz.html", student=student)
    elif request.method == "POST":
        rq = request.get_json()
        if rq["action"] == "quiz_complete":
            del rq["action"]
            db.complete_quiz(student, rq)
            return "OK", 200


@app.route("/heart-words/<student>", methods=["GET", "POST"])
def heart_words(student):
    if request.method == "GET":
        return render_template("heart-words.html", student=student)
    elif request.method == "POST":
        rq = request.get_json()
        if rq["action"] == "quiz_complete":
            db.complete_heart_quiz(rq)
            return "OK", 200


@app.route("/heart-words-report/", methods=["GET"])
def heart_words_report():
    return render_template("heart-words-report.html", reportInfo=db.heart_words_report)


@app.route("/api/<action>", methods=["GET", "POST"])
def api(action):
    if action == "make-csv":
        response = make_response(db.make_df().to_csv(index=False))
        response.headers[
            "Content-Disposition"
        ] = "attachment; filename=quiz-results.csv"
        response.headers["Content-Type"] = "text/csv"
        return response

    elif action == "add-student":
        print("Adding student")
        rq = request.get_json()
        success = db.new_student(rq["student"])
        return "success" if success else "failure", 200

    elif action == "delete-student":
        print("Deleting student")
        rq = request.get_json()
        success = db.delete_student(rq["student"])
        return "success" if success else "failure", 200

    elif action == "update-quiz":
        print("Updating quiz")
        rq = request.get_json()
        success = db.update_record(rq)
        return "success" if success else "failure", 200

    elif action == "student-seats":
        return db.get_seating_chart(), 200, {"ContentType": "application/json"}

    elif action == "update-seating-chart":
        new_chart = request.get_json()
        db.update_seating_chart(new_chart)
        return "OK", 200

    elif action == "make-graphs":
        db.make_df().to_csv("student-results.csv", index=False)
        subprocess.run(["Rscript", "make-graphs.R"])

        return render_template("student-plot.html")

    elif action == "make-table":
        db.make_df().to_csv("student-results.csv", index=False)
        subprocess.run(["Rscript", "make-graphs.R"])

        return redirect("/static/student_table.html", code=302)

    else:
        print("bad request")
        print(request.get_json())


@app.route("/student-dashboard", methods=["GET"])
def dashboard():
    success_strings = db.generate_report()
    return render_template(
        "dashboard.html", success_strings=json.dumps(success_strings)
    )


@app.route("/seating-chart", methods=["GET", "POST"])
def seating_chart():
    return render_template(
        "seating-chart.html", seating_chart=json.dumps(db.get_seating_chart())
    )
