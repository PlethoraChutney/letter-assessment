#!/bin/bash
cd $(dirname $0)
source venv/bin/activate
export FLASK_APP=run_quiz
flask run