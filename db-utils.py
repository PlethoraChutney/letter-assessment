#!/usr/bin/env python
from letter_assessment import Database
import argparse

db = Database("students.json")

def main(args):
    if args.del_test:
        kid, test_type, date = args.del_test.split("::")
        db.delete_test(kid, test_type, date)

parser = argparse.ArgumentParser()
parser.add_argument(
    "--del-test",
    help = "Format like this: kid::type::date"
)
if __name__ == "__main__":
    args = parser.parse_args()
    main(args)