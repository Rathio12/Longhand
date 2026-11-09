import { BASICS_INPUT, LANGUAGE_BASICS } from './languageBasics.js';
import {
  ALLOW_LIST, CUSTOM_SORT, DELTA_TIME, MEMOIZATION, READING_INPUT,
  SLIDING_WINDOW, STACK_QUEUE, STATE_MACHINE, TRACE_TABLE,
} from './exampleCode.js';

// Runnable worked examples. Each teaches a technique on its own small task, so
// none of them gives away an answer from the problem list.
export const EXAMPLES = [
  {
    id: 'language-basics',
    title: 'How this language works',
    level: 'Basics',
    body: 'The same small program in every language. It shows how to read input, write a function, loop, use lists and maps, and handle text.\n\nPick a language above the editor, press Run, then change things and see what happens. If your exam allows only one language, get this program into your memory first.',
    stdin: BASICS_INPUT,
    variants: LANGUAGE_BASICS,
  },
  {
    id: 'reading-input',
    title: 'Reading input',
    level: 'Basics',
    body: 'Exam judges send input as text. Most mistakes happen here, so learn one reliable pattern and reuse it.\n\nThe example reads a count and then that many numbers, and prints their average. Notice that line breaks stop mattering once you read values in order.',
    stdin: '3\n10 20 60\n',
    variants: READING_INPUT,
  },
  {
    id: 'trace-table',
    title: 'Tracing a loop by hand',
    level: 'Basics',
    body: 'Without a debugger in the exam, you become the debugger. Write a small table with one column per variable and one row per pass through the loop.\n\nRun this and compare it with a table you fill in on paper **first**.\n\n| i | total |\n|---|---|\n| 1 | 1 |\n| 2 | 3 |\n| 3 | 6 |',
    stdin: '',
    variants: TRACE_TABLE,
  },
  {
    id: 'stacks-queues',
    title: 'Stacks and queues',
    level: 'Data structures',
    body: 'A **stack** gives back the newest item first, like a pile of plates. A **queue** gives back the oldest first, like a line of people.\n\nBoth start with the same three values here. The order they come out in is the whole difference.',
    stdin: '',
    variants: STACK_QUEUE,
  },
  {
    id: 'sliding-window',
    title: 'Sliding window',
    level: 'Algorithms',
    body: 'When a question asks about every run of `k` neighbours, you do not need to re-add each run. Moving the window one place adds one value and removes one value.\n\nThat turns a nested loop into a single pass. Here we find the largest sum of `k` values in a row.',
    stdin: '2\n1 4 2 10 3\n',
    variants: SLIDING_WINDOW,
  },
  {
    id: 'memoization',
    title: 'Recursion with memory',
    level: 'Algorithms',
    body: 'A recursive function that solves the same small case over and over can be fixed by saving each answer the first time.\n\nThe example counts the ways to climb stairs taking 1 or 2 steps at a time. Remove the memory and try 40 to feel the difference.',
    stdin: '40\n',
    variants: MEMOIZATION,
  },
  {
    id: 'custom-sort',
    title: 'Sorting by your own rule',
    level: 'Algorithms',
    body: 'Exams love "sort by score, highest first, and break ties by name". Compare on the first rule, and only look at the second when the first is a draw.',
    stdin: 'mia 70\nzed 90\nabe 90\n',
    variants: CUSTOM_SORT,
  },
  {
    id: 'allow-list',
    title: 'Allow only what you expect',
    level: 'Cybersecurity',
    body: 'Trying to list every dangerous input is a losing game. Decide what valid input looks like and reject everything else.\n\nThese usernames must be 3 to 12 letters, digits or underscores. Notice how `bob;rm`, with characters a shell treats as special, never gets further.',
    stdin: 'alice_01\nbob;rm\nab\n',
    variants: ALLOW_LIST,
  },
  {
    id: 'sql-injection',
    title: 'Stopping SQL injection',
    level: 'Cybersecurity',
    body: 'When user input is pasted into a query, the input can change what the query means. A placeholder sends the input separately, so it can only ever be treated as data.\n\nRun this with the input provided. The first query returns every user, because the quotes in the input rewrote it. The second finds nobody.\n\nThis example is in Python because it includes a database. The placeholder idea is the same in every language.',
    stdin: "' OR '1'='1\n",
    variants: {
      python: `import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT)")
db.execute("INSERT INTO users VALUES ('alice'), ('bob')")

typed = input()

# Unsafe: the input becomes part of the SQL itself.
unsafe = f"SELECT name FROM users WHERE name = '{typed}'"
print("Joined into the query:", db.execute(unsafe).fetchall())

# Safe: the ? keeps the input as plain data.
safe = "SELECT name FROM users WHERE name = ?"
print("Using a placeholder:  ", db.execute(safe, (typed,)).fetchall())
`,
    },
  },
  {
    id: 'password-storage',
    title: 'Storing passwords',
    level: 'Cybersecurity',
    body: 'Never store a password itself. Store a slow hash of it, with a random **salt** for each user.\n\nThe salt means two people with the same password get different hashes, so one stolen table can\'t be cracked all at once. The slow hash makes each guess expensive.\n\nThis needs a cryptography library, so it is shown in the two languages that include one by default.',
    stdin: 'hunter2\n',
    variants: {
      python: `import hashlib
import hmac
import os

ROUNDS = 200_000

def make_hash(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ROUNDS)

password = input()

salt_a, salt_b = os.urandom(16), os.urandom(16)
stored_a = make_hash(password, salt_a)
stored_b = make_hash(password, salt_b)

print("Same password, same hash?", stored_a == stored_b)

# compare_digest takes the same time wherever the bytes differ.
print("Correct password accepted?", hmac.compare_digest(stored_a, make_hash(password, salt_a)))
print("Wrong password accepted?  ", hmac.compare_digest(stored_a, make_hash("guess", salt_a)))
`,
      javascript: `const crypto = require('crypto');

const ROUNDS = 200000;
const makeHash = (password, salt) => crypto.pbkdf2Sync(password, salt, ROUNDS, 32, 'sha256');

const password = require('fs').readFileSync(0, 'utf8').trim();

const saltA = crypto.randomBytes(16);
const saltB = crypto.randomBytes(16);
const storedA = makeHash(password, saltA);
const storedB = makeHash(password, saltB);

console.log('Same password, same hash?', storedA.equals(storedB));

// timingSafeEqual takes the same time wherever the bytes differ.
console.log('Correct password accepted?', crypto.timingSafeEqual(storedA, makeHash(password, saltA)));
console.log('Wrong password accepted?  ', crypto.timingSafeEqual(storedA, makeHash('guess', saltA)));
`,
    },
  },
  {
    id: 'pipelines',
    title: 'Connecting commands',
    level: 'Linux',
    body: 'The `|` symbol sends the output of one command into the next. Most Linux tasks are a short chain of small tools.\n\nThis one finds the word that appears most often. Delete everything after a `|` and run it again to watch each stage.',
    stdin: 'ann bob ann cid ann bob\n',
    variants: {
      bash: `tr ' ' '\\n' | sort | uniq -c | sort -rn | head -n 1
`,
    },
  },
  {
    id: 'looping-files',
    title: 'Looping over files safely',
    level: 'Linux',
    body: 'File names can contain spaces. Without quotes, `$file` splits into separate words and the command breaks.\n\nAlways write `"$file"` with the double quotes, and loop over a pattern such as `notes/*.txt` rather than the output of `ls`.',
    stdin: '',
    variants: {
      bash: `mkdir -p notes
touch "notes/first draft.txt" notes/todo.txt

for file in notes/*.txt; do
    echo "Found: $file"
    wc -c < "$file"
done
`,
    },
  },
  {
    id: 'linux-commands',
    title: 'Commands worth memorising',
    level: 'Linux',
    body: '| Command | What it does |\n|---|---|\n| `pwd`, `cd`, `ls -la` | Where am I, move, list everything |\n| `cat`, `less`, `head`, `tail -f` | Read files |\n| `cp`, `mv`, `rm`, `mkdir -p` | Copy, move, delete, create |\n| `grep -rin` | Search text in files |\n| `find . -name "*.log"` | Search for files |\n| `sort`, `uniq -c`, `wc -l`, `cut`, `tr` | Reshape text |\n| `sed`, `awk` | Edit and process columns |\n| `chmod 640`, `chown` | Permissions and owner |\n| `ps aux`, `top`, `kill` | Processes |\n| `ss -tulpn` | Listening ports |\n| `journalctl -u`, `dmesg` | Logs |\n| `sudo`, `id`, `who` | Privileges and users |\n\nPermissions in `chmod 640` read as owner, group, others. Each digit adds read 4, write 2 and execute 1, so 6 means read and write.',
    stdin: '',
    variants: {
      bash: `# Permission digits are just added together.
read=4; write=2; execute=1
echo "read + write = $((read + write))"
echo "all three = $((read + write + execute))"

echo "This folder holds:"
ls
`,
    },
  },
  {
    id: 'state-machine',
    title: 'An enemy state machine',
    level: 'Game development',
    track: 'Game logic',
    body: 'A state machine keeps game behaviour readable: the enemy is in exactly one state, and each state decides when to switch.\n\nThe input is a list of distances to the player, one per frame. Near the player the enemy chases, and when it is very close it attacks.',
    stdin: '12 7 4 1 6 20\n',
    variants: STATE_MACHINE,
  },
  {
    id: 'delta-time',
    title: 'Movement with delta time',
    level: 'Game development',
    track: 'Game logic',
    body: 'Frames do not take equal time. Multiply speed by the time since the last frame and the object covers the same distance on any computer.\n\nThe input is frame times in seconds. The object moves at 100 units per second.',
    stdin: '0.5 0.25 0.25\n',
    variants: DELTA_TIME,
  },
];
