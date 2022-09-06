#!/usr/bin/env python3

import json
from datetime import date
from flask import Flask, render_template, request, make_response
from string import ascii_letters
import pandas as pd

targets = list(ascii_letters)
targets.extend(range(21))

class Database(object):
    def __init__(self, db_path):
        self.db_path = db_path
        try:
            with open(db_path, 'r') as f:
                self.db = json.load(f)
        except FileNotFoundError:
            self.db = {'students': [], 'quizzes': {}}

    @property
    def students(self):
        return self.db['students']

    def new_student(self, student):
        if student in self.db['students']:
            return 'Student in list'
        self.db['students'].append(student)
        self.save_db()
        return 'Success'

    def delete_student(self, student):
        if student not in self.db['students']:
            return 'Student not in list'
        self.db['students'].remove(student)
        self.save_db()
        return 'Success'

    @property
    def dates(self):
        return self.db['quizzes'].keys()

    def save_db(self):
        with open(self.db_path, 'w') as f:
            json.dump(self.db, f)

    def new_quiz(self, student):
        if student not in self.students:
            return False
        
        today = str(date.today())
        if today not in self.dates:
            self.db['quizzes'][today] = {
                student: {x: False for x in targets}
            }
        else:
            self.db['quizzes'][today][student] = {x:False for x in targets}

        return True

    def generate_report(self):
        success_dicts = {}
        student_dates = {}

        for date, quizzes in self.db['quizzes'].items():
            for student in quizzes.keys():
                if student not in self.students:
                    continue

                if student not in student_dates:
                    student_dates[student] = [date]
                else:
                    student_dates[student].append(date)

        for student in student_dates:
            student_dates[student].sort()
            student_dates[student] = student_dates[student][-1]

        for student, date in student_dates.items():
            quiz = self.db['quizzes'][date][student]
            success_dicts[student] = {}
            success_dicts[student]['date'] = date
            success_dicts[student]['results'] = quiz

        return(success_dicts)


app = Flask(
    __name__,
    template_folder='templates'
)

db = Database('students.json')

@app.route('/', methods = ['GET'])
def index():
    return render_template('index.html', students = db.students)

@app.route('/quiz/<student>', methods = ['GET', 'POST'])
def quiz(student):
    if request.method == 'GET':
        db.new_quiz(student)
        return render_template('quiz.html', student = student)
    elif request.method == 'POST':
        today = str(date.today())
        rq = request.get_json()
        if rq['action'] == 'quiz_complete':
            for section in [rq['upper'], rq['lower']]:
                for letter, correct in section.items():
                    db.db['quizzes'][today][rq['student']][letter] = correct
            
            for num, correct in rq['numbers'].items():
                num = int(num[1:])
                db.db['quizzes'][today][rq['student']][num] = correct

            db.save_db()
            return 'OK', 200

@app.route('/api/<action>', methods = ['GET', 'POST'])
def api(action):
    if action == 'make-csv':
        csv_dicts = []
        for date, quizzes in db.db['quizzes'].items():
            for student, quiz in quizzes.items():
                for target, results in quiz.items():
                    for category, success in results.items():
                        csv_dicts.append({
                            'date': date,
                            'student': student,
                            'target': target,
                            'category': category,
                            'success': success
                        })

        response = make_response(pd.DataFrame(csv_dicts).to_csv(index = False))
        response.headers['Content-Disposition'] = 'attachment; filename=quiz-results.csv'
        response.headers['Content-Type'] = 'text/csv'
        return response

    elif action == 'add-student':
        print('Adding student')
        rq = request.get_json()
        success = db.new_student(rq['student'])
        return 'OK', 200

    elif action == 'delete-student':
        print('Deleting student')
        rq = request.get_json()
        success = db.delete_student(rq['student'])
        return 'OK', 200

    else:
        print('bad request')
        print(request.get_json())

@app.route('/student-dashboard', methods = ['GET'])
def dashboard():
    success_strings = db.generate_report()
    return render_template('dashboard.html', success_strings = json.dumps(success_strings))