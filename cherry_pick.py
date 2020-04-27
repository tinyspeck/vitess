import argparse
import json
import subprocess
import sys

def get_cherry_picks():
    with open('cherry-picks.json') as f:
        return json.load(f)


def apply(cherry_pick, dry_run=False):
    command = [
        "git",
        "cherry-pick",
        cherry_pick['sha'],
    ]

    if cherry_pick.get('merge', True):
        command += ['-m', '1']

    command.extend(cherry_pick.get('cherry-pick-args', []))

    print("INFO: {}".format(" ".join(command)))

    try:
        if not dry_run:
            output = subprocess.check_output(command)
            print(output)
        else:
            print("DRY-RUN")
    except subprocess.CalledProcessError as e:
        print(
            "Error cherry-picking {sha}\nCommand: {command}\nReturn code: {err}\ngit stdout: {stdout}".format(
                sha=cherry_pick['sha'],
                command=" ".join(command),
                err=e.returncode,
                stdout=e.output,
            )
        )


def main(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', default=False)

    args = parser.parse_args(argv)

    cherry_picks = get_cherry_picks()
    for cherry_pick in cherry_picks:
        apply(cherry_pick, dry_run=args.dry_run)


if __name__ == "__main__":
    main(sys.argv[1:])
