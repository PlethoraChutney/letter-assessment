#!/bin/zsh
cd $(dirname $0)
source venv/bin/activate
export FLASK_APP=letter_assessment
flask run
