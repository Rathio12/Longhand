// Worked examples, one program per language. Every version of an example prints
// exactly the same output, which is what the test suite checks.
const GD_WORDS = `	var words: Array = []
	while true:
		var line := OS.read_string_from_stdin().strip_edges()
		if line.is_empty():
			break
		words.append_array(line.replace("\\n", " ").replace("\\r", " ").split(" ", false))
`;

// The engine-style options share their parent language's version unless they have their own.
const withEngines = (variants) => ({
  ...variants,
  unity: variants.unity ?? variants.csharp,
  unreal: variants.unreal ?? variants.cpp,
  love: variants.love ?? variants.lua,
});

export const READING_INPUT = withEngines({
  python: `import sys

words = sys.stdin.read().split()
count = int(words[0])
numbers = [int(w) for w in words[1:count + 1]]

print(sum(numbers) // count)
`,
  javascript: `const words = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/);
const count = Number(words[0]);
const numbers = words.slice(1, count + 1).map(Number);

console.log(numbers.reduce((a, b) => a + b, 0) / count);
`,
  typescript: `import { readFileSync } from 'node:fs';

const words: string[] = readFileSync(0, 'utf8').trim().split(/\\s+/);
const count = Number(words[0]);
const numbers: number[] = words.slice(1, count + 1).map(Number);

console.log(numbers.reduce((a, b) => a + b, 0) / count);
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int count = in.nextInt();

        int total = 0;
        for (int i = 0; i < count; i++) {
            total += in.nextInt();
        }
        System.out.println(total / count);
    }
}
`,
  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        int count = int.Parse(words[0]);
        int total = words.Skip(1).Take(count).Sum(int.Parse);

        Console.WriteLine(total / count);
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    int count;
    cin >> count;

    int total = 0;
    for (int i = 0; i < count; i++) {
        int x;
        cin >> x;   // cin skips spaces and new lines for you
        total += x;
    }
    cout << total / count << "\\n";
}
`,
  c: `#include <stdio.h>

int main(void) {
    int count, total = 0;
    scanf("%d", &count);

    for (int i = 0; i < count; i++) {
        int x;
        scanf("%d", &x);   // %d skips spaces and new lines for you
        total += x;
    }
    printf("%d\\n", total / count);
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	var count int
	fmt.Fscan(in, &count)

	total := 0
	for i := 0; i < count; i++ {
		var x int
		fmt.Fscan(in, &x)
		total += x
	}
	fmt.Println(total / count)
}
`,
  rust: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let mut words = input.split_whitespace();
    let count: usize = words.next().unwrap().parse().unwrap();
    let total: i32 = words.take(count).map(|w| w.parse::<i32>().unwrap()).sum();

    println!("{}", total / count as i32);
}
`,
  kotlin: `fun main() {
    val words = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+"))
    val count = words[0].toInt()
    val total = words.subList(1, count + 1).sumOf { it.toInt() }

    println(total / count)
}
`,
  swift: `var words: [String] = []
while let line = readLine() {
    words += line.split(separator: " ").map(String.init)
}

let count = Int(words[0])!
let total = words[1...count].reduce(0) { $0 + Int($1)! }

print(total / count)
`,
  dart: `import 'dart:convert';
import 'dart:io';

Future<void> main() async {
  final text = await stdin.transform(utf8.decoder).join();
  final words = text.trim().split(RegExp(r'\\s+'));
  final count = int.parse(words[0]);
  final total = words.sublist(1, count + 1).map(int.parse).reduce((a, b) => a + b);

  print(total ~/ count);
}
`,
  ruby: `words = STDIN.read.split
count = words[0].to_i
numbers = words[1, count].map(&:to_i)

puts numbers.sum / count
`,
  php: `<?php
$words = preg_split('/\\s+/', trim(stream_get_contents(STDIN)));
$count = (int) $words[0];
$numbers = array_map('intval', array_slice($words, 1, $count));

echo intdiv(array_sum($numbers), $count), "\\n";
`,
  lua: `local words = {}
for word in io.read("a"):gmatch("%S+") do
  words[#words + 1] = word
end

local count = tonumber(words[1])
local total = 0
for i = 1, count do
  total = total + tonumber(words[i + 1])
end

print(total // count)
`,
  perl: `use strict;
use warnings;

my @words = split ' ', do { local $/; <STDIN> };
my $count = $words[0];

my $total = 0;
$total += $_ for @words[1 .. $count];

print int($total / $count), "\\n";
`,
  r: `lines <- readLines(file("stdin"), warn = FALSE)
words <- unlist(strsplit(trimws(lines), "\\\\s+"))
count <- as.integer(words[1])
numbers <- as.integer(words[2:(count + 1)])

cat(sum(numbers) %/% count, "\\n", sep = "")
`,
  bash: `read -r count
read -r line

total=0
for value in $line; do
    total=$(( total + value ))
done

echo $(( total / count ))
`,
  godot: `extends SceneTree

func _init():
${GD_WORDS}
	var count := int(words[0])
	var total := 0
	for i in range(1, count + 1):
		total += int(words[i])

	print(total / count)
	quit()
`,
});

export const TRACE_TABLE = withEngines({
  python: `total = 0
for i in range(1, 4):
    total += i
    print("i =", i, "total =", total)
`,
  javascript: `let total = 0;
for (let i = 1; i <= 3; i++) {
  total += i;
  console.log('i =', i, 'total =', total);
}
`,
  typescript: `let total: number = 0;
for (let i: number = 1; i <= 3; i++) {
  total += i;
  console.log('i =', i, 'total =', total);
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        int total = 0;
        for (int i = 1; i <= 3; i++) {
            total += i;
            System.out.println("i = " + i + " total = " + total);
        }
    }
}
`,
  csharp: `using System;

class Program {
    static void Main() {
        int total = 0;
        for (int i = 1; i <= 3; i++) {
            total += i;
            Console.WriteLine($"i = {i} total = {total}");
        }
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    int total = 0;
    for (int i = 1; i <= 3; i++) {
        total += i;
        cout << "i = " << i << " total = " << total << "\\n";
    }
}
`,
  c: `#include <stdio.h>

int main(void) {
    int total = 0;
    for (int i = 1; i <= 3; i++) {
        total += i;
        printf("i = %d total = %d\\n", i, total);
    }
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
	total := 0
	for i := 1; i <= 3; i++ {
		total += i
		fmt.Println("i =", i, "total =", total)
	}
}
`,
  rust: `fn main() {
    let mut total = 0;
    for i in 1..=3 {
        total += i;
        println!("i = {} total = {}", i, total);
    }
}
`,
  kotlin: `fun main() {
    var total = 0
    for (i in 1..3) {
        total += i
        println("i = $i total = $total")
    }
}
`,
  swift: `var total = 0
for i in 1...3 {
    total += i
    print("i = \\(i) total = \\(total)")
}
`,
  dart: `void main() {
  var total = 0;
  for (var i = 1; i <= 3; i++) {
    total += i;
    print('i = $i total = $total');
  }
}
`,
  ruby: `total = 0
(1..3).each do |i|
  total += i
  puts "i = #{i} total = #{total}"
end
`,
  php: `<?php
$total = 0;
for ($i = 1; $i <= 3; $i++) {
    $total += $i;
    echo "i = $i total = $total\\n";
}
`,
  lua: `local total = 0
for i = 1, 3 do
  total = total + i
  print("i = " .. i .. " total = " .. total)
end
`,
  perl: `use strict;
use warnings;

my $total = 0;
for my $i (1 .. 3) {
    $total += $i;
    print "i = $i total = $total\\n";
}
`,
  r: `total <- 0
for (i in 1:3) {
  total <- total + i
  cat("i =", i, "total =", total, "\\n")
}
`,
  bash: `total=0
for i in 1 2 3; do
    total=$(( total + i ))
    echo "i = $i total = $total"
done
`,
  godot: `extends SceneTree

func _init():
	var total := 0
	for i in range(1, 4):
		total += i
		print("i = ", i, " total = ", total)
	quit()
`,
});

export const STACK_QUEUE = withEngines({
  python: `from collections import deque

stack = []
for value in [1, 2, 3]:
    stack.append(value)

popped = []
while stack:
    popped.append(stack.pop())
print("Stack:", *popped)

queue = deque([1, 2, 3])
served = []
while queue:
    served.append(queue.popleft())
print("Queue:", *served)
`,
  javascript: `const stack = [];
for (const value of [1, 2, 3]) stack.push(value);

const popped = [];
while (stack.length) popped.push(stack.pop());
console.log('Stack:', popped.join(' '));

// A moving head index avoids the slow shift() on long queues.
const queue = [1, 2, 3];
const served = [];
for (let head = 0; head < queue.length; head++) served.push(queue[head]);
console.log('Queue:', served.join(' '));
`,
  typescript: `const stack: number[] = [];
for (const value of [1, 2, 3]) stack.push(value);

const popped: number[] = [];
while (stack.length) popped.push(stack.pop()!);
console.log('Stack:', popped.join(' '));

// A moving head index avoids the slow shift() on long queues.
const queue: number[] = [1, 2, 3];
const served: number[] = [];
for (let head = 0; head < queue.length; head++) served.push(queue[head]);
console.log('Queue:', served.join(' '));
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (int value : new int[] {1, 2, 3}) stack.push(value);

        StringBuilder popped = new StringBuilder("Stack:");
        while (!stack.isEmpty()) popped.append(" ").append(stack.pop());
        System.out.println(popped);

        Deque<Integer> queue = new ArrayDeque<>(List.of(1, 2, 3));
        StringBuilder served = new StringBuilder("Queue:");
        while (!queue.isEmpty()) served.append(" ").append(queue.pollFirst());
        System.out.println(served);
    }
}
`,
  csharp: `using System;
using System.Collections.Generic;

class Program {
    static void Main() {
        var stack = new Stack<int>();
        foreach (int value in new[] { 1, 2, 3 }) stack.Push(value);

        var popped = new List<int>();
        while (stack.Count > 0) popped.Add(stack.Pop());
        Console.WriteLine("Stack: " + string.Join(" ", popped));

        var queue = new Queue<int>(new[] { 1, 2, 3 });
        var served = new List<int>();
        while (queue.Count > 0) served.Add(queue.Dequeue());
        Console.WriteLine("Queue: " + string.Join(" ", served));
    }
}
`,
  cpp: `#include <iostream>
#include <queue>
#include <stack>
using namespace std;

int main() {
    stack<int> s;
    for (int value : {1, 2, 3}) s.push(value);

    cout << "Stack:";
    while (!s.empty()) {
        cout << " " << s.top();
        s.pop();
    }
    cout << "\\n";

    queue<int> q;
    for (int value : {1, 2, 3}) q.push(value);

    cout << "Queue:";
    while (!q.empty()) {
        cout << " " << q.front();
        q.pop();
    }
    cout << "\\n";
}
`,
  c: `#include <stdio.h>

int main(void) {
    // A stack is an array and the index of the next free slot.
    int stack[10], top = 0;
    for (int value = 1; value <= 3; value++) stack[top++] = value;

    printf("Stack:");
    while (top > 0) printf(" %d", stack[--top]);
    printf("\\n");

    // A queue is an array with a read position and a write position.
    int queue[10], head = 0, tail = 0;
    for (int value = 1; value <= 3; value++) queue[tail++] = value;

    printf("Queue:");
    while (head < tail) printf(" %d", queue[head++]);
    printf("\\n");
    return 0;
}
`,
  go: `package main

import "fmt"

func main() {
	stack := []int{}
	for _, value := range []int{1, 2, 3} {
		stack = append(stack, value)
	}

	fmt.Print("Stack:")
	for len(stack) > 0 {
		fmt.Print(" ", stack[len(stack)-1])
		stack = stack[:len(stack)-1]
	}
	fmt.Println()

	queue := []int{1, 2, 3}
	fmt.Print("Queue:")
	for len(queue) > 0 {
		fmt.Print(" ", queue[0])
		queue = queue[1:]
	}
	fmt.Println()
}
`,
  rust: `use std::collections::VecDeque;

fn main() {
    let mut stack = vec![];
    for value in [1, 2, 3] {
        stack.push(value);
    }

    print!("Stack:");
    while let Some(value) = stack.pop() {
        print!(" {}", value);
    }
    println!();

    let mut queue: VecDeque<i32> = VecDeque::from([1, 2, 3]);
    print!("Queue:");
    while let Some(value) = queue.pop_front() {
        print!(" {}", value);
    }
    println!();
}
`,
  kotlin: `fun main() {
    val stack = ArrayDeque<Int>()
    for (value in listOf(1, 2, 3)) stack.addLast(value)

    val popped = mutableListOf<Int>()
    while (stack.isNotEmpty()) popped.add(stack.removeLast())
    println("Stack: " + popped.joinToString(" "))

    val queue = ArrayDeque(listOf(1, 2, 3))
    val served = mutableListOf<Int>()
    while (queue.isNotEmpty()) served.add(queue.removeFirst())
    println("Queue: " + served.joinToString(" "))
}
`,
  swift: `var stack: [Int] = []
for value in [1, 2, 3] {
    stack.append(value)
}

var popped: [String] = []
while let value = stack.popLast() {
    popped.append(String(value))
}
print("Stack: " + popped.joined(separator: " "))

// A moving head index keeps taking from the front cheap.
let queue = [1, 2, 3]
var served: [String] = []
var head = 0
while head < queue.count {
    served.append(String(queue[head]))
    head += 1
}
print("Queue: " + served.joined(separator: " "))
`,
  dart: `import 'dart:collection';

void main() {
  final stack = <int>[];
  for (final value in [1, 2, 3]) {
    stack.add(value);
  }

  final popped = <int>[];
  while (stack.isNotEmpty) {
    popped.add(stack.removeLast());
  }
  print('Stack: \${popped.join(' ')}');

  final queue = Queue<int>.of([1, 2, 3]);
  final served = <int>[];
  while (queue.isNotEmpty) {
    served.add(queue.removeFirst());
  }
  print('Queue: \${served.join(' ')}');
}
`,
  ruby: `stack = []
[1, 2, 3].each { |value| stack.push(value) }

popped = []
popped << stack.pop until stack.empty?
puts "Stack: #{popped.join(' ')}"

queue = [1, 2, 3]
served = []
served << queue.shift until queue.empty?
puts "Queue: #{served.join(' ')}"
`,
  php: `<?php
$stack = [];
foreach ([1, 2, 3] as $value) {
    array_push($stack, $value);
}

$popped = [];
while ($stack) {
    $popped[] = array_pop($stack);
}
echo "Stack: ", implode(" ", $popped), "\\n";

$queue = new SplQueue();
foreach ([1, 2, 3] as $value) {
    $queue->enqueue($value);
}

$served = [];
while (!$queue->isEmpty()) {
    $served[] = $queue->dequeue();
}
echo "Queue: ", implode(" ", $served), "\\n";
`,
  lua: `local stack = {}
for _, value in ipairs({ 1, 2, 3 }) do
  table.insert(stack, value)
end

local popped = {}
while #stack > 0 do
  popped[#popped + 1] = table.remove(stack)
end
print("Stack: " .. table.concat(popped, " "))

-- A moving head index keeps taking from the front cheap.
local queue = { 1, 2, 3 }
local served = {}
local head = 1
while head <= #queue do
  served[#served + 1] = queue[head]
  head = head + 1
end
print("Queue: " .. table.concat(served, " "))
`,
  perl: `use strict;
use warnings;

my @stack;
push @stack, $_ for (1, 2, 3);

my @popped;
push @popped, pop @stack while @stack;
print "Stack: @popped\\n";

my @queue = (1, 2, 3);
my @served;
push @served, shift @queue while @queue;
print "Queue: @served\\n";
`,
  r: `stack <- c()
for (value in c(1, 2, 3)) {
  stack <- c(stack, value)
}

popped <- c()
while (length(stack) > 0) {
  popped <- c(popped, stack[length(stack)])
  stack <- stack[-length(stack)]
}
cat("Stack:", popped, "\\n")

queue <- c(1, 2, 3)
served <- c()
while (length(queue) > 0) {
  served <- c(served, queue[1])
  queue <- queue[-1]
}
cat("Queue:", served, "\\n")
`,
  bash: `# Adding to the front of a text list makes a stack.
stack=""
for value in 1 2 3; do
    stack="$value $stack"
done
echo "Stack:" $stack

# Adding to the end makes a queue.
queue=""
for value in 1 2 3; do
    queue="$queue $value"
done
echo "Queue:$queue"
`,
  godot: `extends SceneTree

func _init():
	var stack: Array = []
	for value in [1, 2, 3]:
		stack.push_back(value)

	var popped: Array = []
	while not stack.is_empty():
		popped.append(str(stack.pop_back()))
	print("Stack: ", " ".join(PackedStringArray(popped)))

	var queue: Array = [1, 2, 3]
	var served: Array = []
	while not queue.is_empty():
		served.append(str(queue.pop_front()))
	print("Queue: ", " ".join(PackedStringArray(served)))
	quit()
`,
});

export const SLIDING_WINDOW = withEngines({
  python: `import sys

words = sys.stdin.read().split()
k = int(words[0])
values = list(map(int, words[1:]))

window = sum(values[:k])
best = window
for right in range(k, len(values)):
    window += values[right] - values[right - k]
    best = max(best, window)

print(best)
`,
  javascript: `const words = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);
const k = words[0];
const values = words.slice(1);

let sum = 0;
for (let i = 0; i < k; i++) sum += values[i];

let best = sum;
for (let right = k; right < values.length; right++) {
  sum += values[right] - values[right - k];
  best = Math.max(best, sum);
}
console.log(best);
`,
  typescript: `import { readFileSync } from 'node:fs';

const words: number[] = readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);
const k = words[0];
const values = words.slice(1);

let sum = 0;
for (let i = 0; i < k; i++) sum += values[i];

let best = sum;
for (let right = k; right < values.length; right++) {
  sum += values[right] - values[right - k];
  best = Math.max(best, sum);
}
console.log(best);
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int k = in.nextInt();
        List<Integer> values = new ArrayList<>();
        while (in.hasNextInt()) values.add(in.nextInt());

        long window = 0;
        for (int i = 0; i < k; i++) window += values.get(i);

        long best = window;
        for (int right = k; right < values.size(); right++) {
            window += values.get(right) - values.get(right - k);
            best = Math.max(best, window);
        }
        System.out.println(best);
    }
}
`,
  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        int k = int.Parse(words[0]);
        int[] values = words.Skip(1).Select(int.Parse).ToArray();

        long window = values.Take(k).Sum();
        long best = window;
        for (int right = k; right < values.Length; right++) {
            window += values[right] - values[right - k];
            best = Math.Max(best, window);
        }
        Console.WriteLine(best);
    }
}
`,
  cpp: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    int k, x;
    cin >> k;
    vector<int> values;
    while (cin >> x) values.push_back(x);

    long long window = 0;
    for (int i = 0; i < k; i++) window += values[i];

    long long best = window;
    for (size_t right = k; right < values.size(); right++) {
        window += values[right] - values[right - k];
        best = max(best, window);
    }
    cout << best << "\\n";
}
`,
  c: `#include <stdio.h>

int main(void) {
    int k, values[1000], n = 0;
    scanf("%d", &k);
    while (scanf("%d", &values[n]) == 1) n++;

    long long window = 0;
    for (int i = 0; i < k; i++) window += values[i];

    long long best = window;
    for (int right = k; right < n; right++) {
        window += values[right] - values[right - k];
        if (window > best) best = window;
    }
    printf("%lld\\n", best);
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)
	var k int
	fmt.Fscan(in, &k)

	values := []int{}
	for {
		var x int
		if _, err := fmt.Fscan(in, &x); err != nil {
			break
		}
		values = append(values, x)
	}

	window := 0
	for i := 0; i < k; i++ {
		window += values[i]
	}

	best := window
	for right := k; right < len(values); right++ {
		window += values[right] - values[right-k]
		if window > best {
			best = window
		}
	}
	fmt.Println(best)
}
`,
  rust: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let numbers: Vec<i64> = input.split_whitespace().map(|w| w.parse().unwrap()).collect();
    let k = numbers[0] as usize;
    let values = &numbers[1..];

    let mut window: i64 = values[..k].iter().sum();
    let mut best = window;
    for right in k..values.len() {
        window += values[right] - values[right - k];
        best = best.max(window);
    }
    println!("{}", best);
}
`,
  kotlin: `fun main() {
    val numbers = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+")).map { it.toInt() }
    val k = numbers[0]
    val values = numbers.drop(1)

    var window = values.take(k).sum()
    var best = window
    for (right in k until values.size) {
        window += values[right] - values[right - k]
        best = maxOf(best, window)
    }
    println(best)
}
`,
  swift: `var numbers: [Int] = []
while let line = readLine() {
    numbers += line.split(separator: " ").map { Int($0)! }
}
let k = numbers[0]
let values = Array(numbers[1...])

var window = values[..<k].reduce(0, +)
var best = window
for right in k..<values.count {
    window += values[right] - values[right - k]
    best = max(best, window)
}
print(best)
`,
  dart: `import 'dart:convert';
import 'dart:io';
import 'dart:math';

Future<void> main() async {
  final text = await stdin.transform(utf8.decoder).join();
  final numbers = text.trim().split(RegExp(r'\\s+')).map(int.parse).toList();
  final k = numbers[0];
  final values = numbers.sublist(1);

  var window = values.take(k).reduce((a, b) => a + b);
  var best = window;
  for (var right = k; right < values.length; right++) {
    window += values[right] - values[right - k];
    best = max(best, window);
  }
  print(best);
}
`,
  ruby: `numbers = STDIN.read.split.map(&:to_i)
k = numbers[0]
values = numbers[1..]

window = values.first(k).sum
best = window
(k...values.length).each do |right|
  window += values[right] - values[right - k]
  best = [best, window].max
end

puts best
`,
  php: `<?php
$numbers = array_map('intval', preg_split('/\\s+/', trim(stream_get_contents(STDIN))));
$k = $numbers[0];
$values = array_slice($numbers, 1);

$window = array_sum(array_slice($values, 0, $k));
$best = $window;
for ($right = $k; $right < count($values); $right++) {
    $window += $values[$right] - $values[$right - $k];
    $best = max($best, $window);
}

echo $best, "\\n";
`,
  lua: `local values = {}
for word in io.read("a"):gmatch("%S+") do
  values[#values + 1] = tonumber(word)
end
local k = table.remove(values, 1)

local window = 0
for i = 1, k do
  window = window + values[i]
end

local best = window
for right = k + 1, #values do
  window = window + values[right] - values[right - k]
  best = math.max(best, window)
end

print(best)
`,
  perl: `use strict;
use warnings;

my @values = split ' ', do { local $/; <STDIN> };
my $k = shift @values;

my $window = 0;
$window += $values[$_] for 0 .. $k - 1;

my $best = $window;
for my $right ($k .. $#values) {
    $window += $values[$right] - $values[$right - $k];
    $best = $window if $window > $best;
}

print "$best\\n";
`,
  r: `lines <- readLines(file("stdin"), warn = FALSE)
numbers <- as.integer(unlist(strsplit(trimws(lines), "\\\\s+")))
k <- numbers[1]
values <- numbers[-1]

window <- sum(values[1:k])
best <- window
for (right in (k + 1):length(values)) {
  window <- window + values[right] - values[right - k]
  best <- max(best, window)
}

cat(best, "\\n", sep = "")
`,
  bash: `read -r k
read -r line

# awk is the shell's tool for arithmetic on columns.
echo "$line" | awk -v k="$k" '{
    for (i = 1; i <= NF; i++) {
        window += $i
        if (i > k) window -= $(i - k)
        if (i >= k && window > best) best = window
    }
    print best
}'
`,
  godot: `extends SceneTree

func _init():
${GD_WORDS}
	var k := int(words[0])
	var values: Array = []
	for i in range(1, words.size()):
		values.append(int(words[i]))

	var window := 0
	for i in range(k):
		window += values[i]

	var best := window
	for right in range(k, values.size()):
		window += values[right] - values[right - k]
		best = maxi(best, window)

	print(best)
	quit()
`,
});

export const MEMOIZATION = withEngines({
  python: `import sys

n = int(sys.stdin.read())
memory = {}

def ways(step):
    if step <= 1:
        return 1
    if step not in memory:
        memory[step] = ways(step - 1) + ways(step - 2)
    return memory[step]

print(ways(n))
`,
  javascript: `const n = Number(require('fs').readFileSync(0, 'utf8'));
const memory = new Map();

function ways(step) {
  if (step <= 1) return 1;
  if (!memory.has(step)) memory.set(step, ways(step - 1) + ways(step - 2));
  return memory.get(step);
}

console.log(ways(n));
`,
  typescript: `import { readFileSync } from 'node:fs';

const n = Number(readFileSync(0, 'utf8'));
const memory = new Map<number, number>();

function ways(step: number): number {
  if (step <= 1) return 1;
  if (!memory.has(step)) memory.set(step, ways(step - 1) + ways(step - 2));
  return memory.get(step)!;
}

console.log(ways(n));
`,
  java: `import java.util.*;

public class Main {
    static Map<Integer, Long> memory = new HashMap<>();

    static long ways(int step) {
        if (step <= 1) return 1;
        if (memory.containsKey(step)) return memory.get(step);
        long result = ways(step - 1) + ways(step - 2);
        memory.put(step, result);
        return result;
    }

    public static void main(String[] args) {
        System.out.println(ways(new Scanner(System.in).nextInt()));
    }
}
`,
  csharp: `using System;
using System.Collections.Generic;

class Program {
    static Dictionary<int, long> memory = new Dictionary<int, long>();

    static long Ways(int step) {
        if (step <= 1) return 1;
        if (memory.TryGetValue(step, out long saved)) return saved;
        return memory[step] = Ways(step - 1) + Ways(step - 2);
    }

    static void Main() {
        Console.WriteLine(Ways(int.Parse(Console.In.ReadToEnd())));
    }
}
`,
  cpp: `#include <iostream>
#include <map>
using namespace std;

map<int, long long> memory_;

long long ways(int step) {
    if (step <= 1) return 1;
    auto found = memory_.find(step);
    if (found != memory_.end()) return found->second;
    return memory_[step] = ways(step - 1) + ways(step - 2);
}

int main() {
    int n;
    cin >> n;
    cout << ways(n) << "\\n";
}
`,
  c: `#include <stdio.h>

// Zero means this step has not been worked out yet.
long long memory[100];

long long ways(int step) {
    if (step <= 1) return 1;
    if (memory[step] == 0) memory[step] = ways(step - 1) + ways(step - 2);
    return memory[step];
}

int main(void) {
    int n;
    scanf("%d", &n);
    printf("%lld\\n", ways(n));
    return 0;
}
`,
  go: `package main

import "fmt"

var memory = map[int]int{}

func ways(step int) int {
	if step <= 1 {
		return 1
	}
	if saved, ok := memory[step]; ok {
		return saved
	}
	memory[step] = ways(step-1) + ways(step-2)
	return memory[step]
}

func main() {
	var n int
	fmt.Scan(&n)
	fmt.Println(ways(n))
}
`,
  rust: `use std::collections::HashMap;
use std::io::{self, Read};

fn ways(step: u32, memory: &mut HashMap<u32, u64>) -> u64 {
    if step <= 1 {
        return 1;
    }
    if let Some(&saved) = memory.get(&step) {
        return saved;
    }
    let result = ways(step - 1, memory) + ways(step - 2, memory);
    memory.insert(step, result);
    result
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let n: u32 = input.trim().parse().unwrap();
    println!("{}", ways(n, &mut HashMap::new()));
}
`,
  kotlin: `val memory = mutableMapOf<Int, Long>()

fun ways(step: Int): Long {
    if (step <= 1) return 1
    memory[step]?.let { return it }
    val result = ways(step - 1) + ways(step - 2)
    memory[step] = result
    return result
}

fun main() {
    println(ways(readLine()!!.trim().toInt()))
}
`,
  swift: `var memory: [Int: Int] = [:]

func ways(_ step: Int) -> Int {
    if step <= 1 { return 1 }
    if let saved = memory[step] { return saved }
    let result = ways(step - 1) + ways(step - 2)
    memory[step] = result
    return result
}

print(ways(Int(readLine()!)!))
`,
  dart: `import 'dart:io';

final memory = <int, int>{};

int ways(int step) {
  if (step <= 1) return 1;
  return memory[step] ??= ways(step - 1) + ways(step - 2);
}

void main() {
  print(ways(int.parse(stdin.readLineSync()!.trim())));
}
`,
  ruby: `MEMORY = {}

def ways(step)
  return 1 if step <= 1

  MEMORY[step] ||= ways(step - 1) + ways(step - 2)
end

puts ways(STDIN.read.to_i)
`,
  php: `<?php
$memory = [];

function ways(int $step): int {
    global $memory;
    if ($step <= 1) {
        return 1;
    }
    return $memory[$step] ??= ways($step - 1) + ways($step - 2);
}

echo ways((int) trim(stream_get_contents(STDIN))), "\\n";
`,
  lua: `local memory = {}

local function ways(step)
  if step <= 1 then
    return 1
  end
  if not memory[step] then
    memory[step] = ways(step - 1) + ways(step - 2)
  end
  return memory[step]
end

print(ways(io.read("n")))
`,
  perl: `use strict;
use warnings;

my %memory;

sub ways {
    my ($step) = @_;
    return 1 if $step <= 1;
    $memory{$step} //= ways($step - 1) + ways($step - 2);
    return $memory{$step};
}

my $n = <STDIN>;
print ways($n + 0), "\\n";
`,
  r: `memory <- new.env()

ways <- function(step) {
  if (step <= 1) return(1)
  key <- as.character(step)
  if (is.null(memory[[key]])) {
    memory[[key]] <- ways(step - 1) + ways(step - 2)
  }
  memory[[key]]
}

n <- as.integer(readLines(file("stdin"), warn = FALSE)[1])
cat(sprintf("%.0f\\n", ways(n)))
`,
  bash: `# A shell function can't return a large number, so it sets a variable instead.
ways() {
    local step=$1 first
    if [ "$step" -le 1 ]; then
        result=1
        return
    fi

    eval "result=\\\${memo_$step:-}"
    if [ -n "$result" ]; then
        return
    fi

    ways $(( step - 1 ))
    first=$result
    ways $(( step - 2 ))
    result=$(( first + result ))
    eval "memo_$step=$result"
}

read -r n
ways "$n"
echo "$result"
`,
  godot: `extends SceneTree

var memory := {}

func ways(step: int) -> int:
	if step <= 1:
		return 1
	if not memory.has(step):
		memory[step] = ways(step - 1) + ways(step - 2)
	return memory[step]

func _init():
	print(ways(int(OS.read_string_from_stdin().strip_edges())))
	quit()
`,
});

export const CUSTOM_SORT = withEngines({
  python: `import sys

rows = [line.split() for line in sys.stdin if line.strip()]
rows.sort(key=lambda row: (-int(row[1]), row[0]))

for name, score in rows:
    print(name, score)
`,
  javascript: `const rows = require('fs').readFileSync(0, 'utf8').trim().split('\\n').map((l) => l.trim().split(/\\s+/));

rows.sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]));

for (const [name, score] of rows) console.log(name, score);
`,
  typescript: `import { readFileSync } from 'node:fs';

const rows: string[][] = readFileSync(0, 'utf8').trim().split('\\n').map((l) => l.trim().split(/\\s+/));

rows.sort((a, b) => Number(b[1]) - Number(a[1]) || a[0].localeCompare(b[0]));

for (const [name, score] of rows) console.log(name, score);
`,
  java: `import java.util.*;

public class Main {
    record Row(String name, int score) {}

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        List<Row> rows = new ArrayList<>();
        while (in.hasNext()) rows.add(new Row(in.next(), in.nextInt()));

        rows.sort(Comparator.comparingInt((Row r) -> -r.score()).thenComparing(Row::name));

        for (Row row : rows) System.out.println(row.name() + " " + row.score());
    }
}
`,
  csharp: `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static void Main() {
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        var rows = new List<(string Name, int Score)>();
        for (int i = 0; i < words.Length; i += 2) rows.Add((words[i], int.Parse(words[i + 1])));

        var sorted = rows.OrderByDescending(r => r.Score).ThenBy(r => r.Name, StringComparer.Ordinal);

        foreach (var row in sorted) Console.WriteLine($"{row.Name} {row.Score}");
    }
}
`,
  cpp: `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<pair<string, int>> rows;
    string name;
    int score;
    while (cin >> name >> score) rows.push_back({name, score});

    sort(rows.begin(), rows.end(), [](const auto& a, const auto& b) {
        if (a.second != b.second) return a.second > b.second;
        return a.first < b.first;
    });

    for (const auto& row : rows) cout << row.first << " " << row.second << "\\n";
}
`,
  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct row {
    char name[32];
    int score;
};

int compare(const void *x, const void *y) {
    const struct row *a = x, *b = y;
    if (a->score != b->score) return b->score - a->score;
    return strcmp(a->name, b->name);
}

int main(void) {
    struct row rows[100];
    int n = 0;
    while (scanf("%31s %d", rows[n].name, &rows[n].score) == 2) n++;

    qsort(rows, n, sizeof rows[0], compare);

    for (int i = 0; i < n; i++) printf("%s %d\\n", rows[i].name, rows[i].score);
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
)

type row struct {
	name  string
	score int
}

func main() {
	in := bufio.NewReader(os.Stdin)
	rows := []row{}
	for {
		var r row
		if _, err := fmt.Fscan(in, &r.name, &r.score); err != nil {
			break
		}
		rows = append(rows, r)
	}

	sort.Slice(rows, func(i, j int) bool {
		if rows[i].score != rows[j].score {
			return rows[i].score > rows[j].score
		}
		return rows[i].name < rows[j].name
	})

	for _, r := range rows {
		fmt.Println(r.name, r.score)
	}
}
`,
  rust: `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let mut rows: Vec<(&str, i32)> = input
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| {
            let mut parts = l.split_whitespace();
            (parts.next().unwrap(), parts.next().unwrap().parse().unwrap())
        })
        .collect();

    rows.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));

    for (name, score) in rows {
        println!("{} {}", name, score);
    }
}
`,
  kotlin: `fun main() {
    val rows = generateSequence(::readLine)
        .filter { it.isNotBlank() }
        .map { it.trim().split(" ") }
        .map { it[0] to it[1].toInt() }
        .toList()

    val sorted = rows.sortedWith(compareBy({ -it.second }, { it.first }))

    for ((name, score) in sorted) println("$name $score")
}
`,
  swift: `var rows: [(name: String, score: Int)] = []
while let line = readLine() {
    let parts = line.split(separator: " ")
    if parts.count == 2 {
        rows.append((String(parts[0]), Int(parts[1])!))
    }
}

rows.sort { a, b in
    if a.score != b.score { return a.score > b.score }
    return a.name < b.name
}

for row in rows {
    print(row.name, row.score)
}
`,
  dart: `import 'dart:convert';
import 'dart:io';

Future<void> main() async {
  final text = await stdin.transform(utf8.decoder).join();
  final rows = text.trim().split('\\n').map((l) => l.trim().split(RegExp(r'\\s+'))).toList();

  rows.sort((a, b) {
    final byScore = int.parse(b[1]).compareTo(int.parse(a[1]));
    return byScore != 0 ? byScore : a[0].compareTo(b[0]);
  });

  for (final row in rows) {
    print('\${row[0]} \${row[1]}');
  }
}
`,
  ruby: `rows = STDIN.read.split("\\n").map(&:split)

rows.sort_by! { |name, score| [-score.to_i, name] }

rows.each { |name, score| puts "#{name} #{score}" }
`,
  php: `<?php
$rows = array_map(
    fn($line) => preg_split('/\\s+/', trim($line)),
    explode("\\n", trim(stream_get_contents(STDIN)))
);

usort($rows, fn($a, $b) => [(int) $b[1], $a[0]] <=> [(int) $a[1], $b[0]]);

foreach ($rows as [$name, $score]) {
    echo "$name $score\\n";
}
`,
  lua: `local rows = {}
for name, score in io.read("a"):gmatch("(%S+)%s+(%d+)") do
  rows[#rows + 1] = { name = name, score = tonumber(score) }
end

table.sort(rows, function(a, b)
  if a.score ~= b.score then
    return a.score > b.score
  end
  return a.name < b.name
end)

for _, row in ipairs(rows) do
  print(row.name .. " " .. row.score)
end
`,
  perl: `use strict;
use warnings;

my @rows = map { [split] } grep { /\\S/ } <STDIN>;

my @sorted = sort { $b->[1] <=> $a->[1] or $a->[0] cmp $b->[0] } @rows;

print "$_->[0] $_->[1]\\n" for @sorted;
`,
  r: `lines <- readLines(file("stdin"), warn = FALSE)
parts <- strsplit(trimws(lines), "\\\\s+")
names <- sapply(parts, function(p) p[1])
scores <- as.integer(sapply(parts, function(p) p[2]))

# The radix method compares text by plain character order.
order_by <- order(-scores, names, method = "radix")

for (i in order_by) {
  cat(names[i], " ", scores[i], "\\n", sep = "")
}
`,
  bash: `# Sort on column 2 as a number, largest first, then on column 1.
sort -k2,2nr -k1,1
`,
  godot: `extends SceneTree

func _init():
${GD_WORDS}
	var rows: Array = []
	for i in range(0, words.size(), 2):
		rows.append({ "name": words[i], "score": int(words[i + 1]) })

	rows.sort_custom(func(a, b):
		if a.score != b.score:
			return a.score > b.score
		return a.name < b.name
	)

	for row in rows:
		print(row.name, " ", row.score)
	quit()
`,
});

export const ALLOW_LIST = withEngines({
  python: `import re
import sys

ALLOWED = re.compile(r"[A-Za-z0-9_]{3,12}")

for name in sys.stdin.read().split("\\n"):
    if name:
        print("OK" if ALLOWED.fullmatch(name) else "REJECTED", name)
`,
  javascript: `const ALLOWED = /^[A-Za-z0-9_]{3,12}$/;

for (const name of require('fs').readFileSync(0, 'utf8').split('\\n')) {
  if (name) console.log(ALLOWED.test(name) ? 'OK' : 'REJECTED', name);
}
`,
  typescript: `import { readFileSync } from 'node:fs';

const ALLOWED: RegExp = /^[A-Za-z0-9_]{3,12}$/;

for (const name of readFileSync(0, 'utf8').split('\\n')) {
  if (name) console.log(ALLOWED.test(name) ? 'OK' : 'REJECTED', name);
}
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (in.hasNextLine()) {
            String name = in.nextLine();
            if (name.isEmpty()) continue;
            String verdict = name.matches("[A-Za-z0-9_]{3,12}") ? "OK" : "REJECTED";
            System.out.println(verdict + " " + name);
        }
    }
}
`,
  csharp: `using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string name;
        while ((name = Console.ReadLine()) != null) {
            if (name == "") continue;
            string verdict = Regex.IsMatch(name, @"\\A[A-Za-z0-9_]{3,12}\\z") ? "OK" : "REJECTED";
            Console.WriteLine($"{verdict} {name}");
        }
    }
}
`,
  cpp: `#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
using namespace std;

bool allowed(const string& name) {
    if (name.size() < 3 || name.size() > 12) return false;
    return all_of(name.begin(), name.end(), [](unsigned char c) {
        return isalnum(c) || c == '_';
    });
}

int main() {
    string name;
    while (getline(cin, name)) {
        if (name.empty()) continue;
        cout << (allowed(name) ? "OK " : "REJECTED ") << name << "\\n";
    }
}
`,
  c: `#include <ctype.h>
#include <stdio.h>
#include <string.h>

int allowed(const char *name) {
    size_t length = strlen(name);
    if (length < 3 || length > 12) return 0;
    for (size_t i = 0; i < length; i++) {
        unsigned char c = name[i];
        if (!isalnum(c) && c != '_') return 0;
    }
    return 1;
}

int main(void) {
    char name[256];
    while (fgets(name, sizeof name, stdin)) {
        name[strcspn(name, "\\r\\n")] = 0;
        if (name[0] == 0) continue;
        printf("%s %s\\n", allowed(name) ? "OK" : "REJECTED", name);
    }
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
	"regexp"
)

var allowed = regexp.MustCompile("^[A-Za-z0-9_]{3,12}$")

func main() {
	lines := bufio.NewScanner(os.Stdin)
	for lines.Scan() {
		name := lines.Text()
		if name == "" {
			continue
		}
		verdict := "REJECTED"
		if allowed.MatchString(name) {
			verdict = "OK"
		}
		fmt.Println(verdict, name)
	}
}
`,
  rust: `use std::io::{self, BufRead};

fn allowed(name: &str) -> bool {
    (3..=12).contains(&name.len())
        && name.chars().all(|c| c.is_ascii_alphanumeric() || c == '_')
}

fn main() {
    for line in io::stdin().lock().lines() {
        let name = line.unwrap();
        if !name.is_empty() {
            println!("{} {}", if allowed(&name) { "OK" } else { "REJECTED" }, name);
        }
    }
}
`,
  kotlin: `val ALLOWED = Regex("[A-Za-z0-9_]{3,12}")

fun main() {
    generateSequence(::readLine).filter { it.isNotEmpty() }.forEach { name ->
        val verdict = if (ALLOWED.matches(name)) "OK" else "REJECTED"
        println("$verdict $name")
    }
}
`,
  swift: `func allowed(_ name: String) -> Bool {
    guard (3...12).contains(name.count) else { return false }
    return name.allSatisfy { $0.isASCII && ($0.isLetter || $0.isNumber || $0 == "_") }
}

while let name = readLine() {
    if !name.isEmpty {
        print(allowed(name) ? "OK" : "REJECTED", name)
    }
}
`,
  dart: `import 'dart:convert';
import 'dart:io';

final allowed = RegExp(r'^[A-Za-z0-9_]{3,12}$');

Future<void> main() async {
  final lines = await stdin.transform(utf8.decoder).transform(const LineSplitter()).toList();
  for (final name in lines.where((l) => l.isNotEmpty)) {
    print('\${allowed.hasMatch(name) ? 'OK' : 'REJECTED'} $name');
  }
}
`,
  ruby: `ALLOWED = /\\A[A-Za-z0-9_]{3,12}\\z/

STDIN.each_line(chomp: true) do |name|
  next if name.empty?

  puts "#{name.match?(ALLOWED) ? 'OK' : 'REJECTED'} #{name}"
end
`,
  php: `<?php
while (($line = fgets(STDIN)) !== false) {
    $name = rtrim($line, "\\r\\n");
    if ($name === '') {
        continue;
    }
    $verdict = preg_match('/\\A[A-Za-z0-9_]{3,12}\\z/', $name) ? 'OK' : 'REJECTED';
    echo "$verdict $name\\n";
}
`,
  lua: `local function allowed(name)
  return #name >= 3 and #name <= 12 and name:match("^[%w_]+$") ~= nil
end

for name in io.lines() do
  if name ~= "" then
    print((allowed(name) and "OK " or "REJECTED ") .. name)
  end
end
`,
  perl: `use strict;
use warnings;

while (my $name = <STDIN>) {
    chomp $name;
    next if $name eq '';
    my $verdict = $name =~ /\\A[A-Za-z0-9_]{3,12}\\z/ ? 'OK' : 'REJECTED';
    print "$verdict $name\\n";
}
`,
  r: `names <- readLines(file("stdin"), warn = FALSE)

for (name in names[names != ""]) {
  ok <- grepl("^[A-Za-z0-9_]{3,12}$", name)
  cat(if (ok) "OK" else "REJECTED", name, "\\n")
}
`,
  bash: `while IFS= read -r name; do
    [ -z "$name" ] && continue

    verdict=OK
    case "$name" in
        *[!A-Za-z0-9_]*) verdict=REJECTED ;;
    esac
    if [ "\${#name}" -lt 3 ] || [ "\${#name}" -gt 12 ]; then
        verdict=REJECTED
    fi

    echo "$verdict $name"
done
`,
  godot: `extends SceneTree

func _init():
	var allowed := RegEx.new()
	allowed.compile("^[A-Za-z0-9_]{3,12}$")

	# Godot may hand over several lines at once, so collect them all first.
	var text := ""
	while true:
		var chunk := OS.read_string_from_stdin()
		if chunk.is_empty():
			break
		text += chunk

	for name in text.replace("\\r", "").split("\\n", false):
		var verdict := "OK" if allowed.search(name) else "REJECTED"
		print(verdict, " ", name)
	quit()
`,
});

export const STATE_MACHINE = withEngines({
  python: `import sys

def next_state(distance):
    if distance <= 2:
        return "attack"
    if distance <= 8:
        return "chase"
    return "idle"

for distance in map(int, sys.stdin.read().split()):
    print(distance, next_state(distance))
`,
  javascript: `function nextState(distance) {
  if (distance <= 2) return 'attack';
  if (distance <= 8) return 'chase';
  return 'idle';
}

for (const word of require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/)) {
  console.log(word, nextState(Number(word)));
}
`,
  typescript: `import { readFileSync } from 'node:fs';

type State = 'idle' | 'chase' | 'attack';

function nextState(distance: number): State {
  if (distance <= 2) return 'attack';
  if (distance <= 8) return 'chase';
  return 'idle';
}

for (const word of readFileSync(0, 'utf8').trim().split(/\\s+/)) {
  console.log(word, nextState(Number(word)));
}
`,
  java: `import java.util.*;

public class Main {
    enum State { IDLE, CHASE, ATTACK }

    static State next(int distance) {
        if (distance <= 2) return State.ATTACK;
        if (distance <= 8) return State.CHASE;
        return State.IDLE;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (in.hasNextInt()) {
            int distance = in.nextInt();
            System.out.println(distance + " " + next(distance).name().toLowerCase(Locale.ROOT));
        }
    }
}
`,
  csharp: `using System;

enum EnemyState { Idle, Chase, Attack }

class Program {
    static EnemyState Next(int distance) {
        if (distance <= 2) return EnemyState.Attack;
        if (distance <= 8) return EnemyState.Chase;
        return EnemyState.Idle;
    }

    static void Main() {
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words) {
            int distance = int.Parse(word);
            Console.WriteLine($"{distance} {Next(distance).ToString().ToLowerInvariant()}");
        }
    }
}
`,
  cpp: `#include <iostream>
using namespace std;

enum class State { Idle, Chase, Attack };

State next_state(int distance) {
    if (distance <= 2) return State::Attack;
    if (distance <= 8) return State::Chase;
    return State::Idle;
}

const char* name_of(State state) {
    switch (state) {
        case State::Attack: return "attack";
        case State::Chase: return "chase";
        default: return "idle";
    }
}

int main() {
    int distance;
    while (cin >> distance) {
        cout << distance << " " << name_of(next_state(distance)) << "\\n";
    }
}
`,
  c: `#include <stdio.h>

enum state { IDLE, CHASE, ATTACK };

enum state next_state(int distance) {
    if (distance <= 2) return ATTACK;
    if (distance <= 8) return CHASE;
    return IDLE;
}

int main(void) {
    const char *names[] = {"idle", "chase", "attack"};
    int distance;
    while (scanf("%d", &distance) == 1) {
        printf("%d %s\\n", distance, names[next_state(distance)]);
    }
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func nextState(distance int) string {
	switch {
	case distance <= 2:
		return "attack"
	case distance <= 8:
		return "chase"
	default:
		return "idle"
	}
}

func main() {
	in := bufio.NewReader(os.Stdin)
	for {
		var distance int
		if _, err := fmt.Fscan(in, &distance); err != nil {
			return
		}
		fmt.Println(distance, nextState(distance))
	}
}
`,
  rust: `use std::io::{self, Read};

#[derive(Debug)]
enum State {
    Idle,
    Chase,
    Attack,
}

fn next_state(distance: i32) -> State {
    match distance {
        d if d <= 2 => State::Attack,
        d if d <= 8 => State::Chase,
        _ => State::Idle,
    }
}

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    for word in input.split_whitespace() {
        let distance: i32 = word.parse().unwrap();
        let name = format!("{:?}", next_state(distance)).to_lowercase();
        println!("{} {}", distance, name);
    }
}
`,
  kotlin: `enum class State { IDLE, CHASE, ATTACK }

fun nextState(distance: Int): State = when {
    distance <= 2 -> State.ATTACK
    distance <= 8 -> State.CHASE
    else -> State.IDLE
}

fun main() {
    val words = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+"))
    for (word in words) {
        println("$word " + nextState(word.toInt()).name.lowercase())
    }
}
`,
  swift: `enum State: String {
    case idle, chase, attack
}

func nextState(_ distance: Int) -> State {
    if distance <= 2 { return .attack }
    if distance <= 8 { return .chase }
    return .idle
}

while let line = readLine() {
    for word in line.split(separator: " ") {
        let distance = Int(word)!
        print(distance, nextState(distance).rawValue)
    }
}
`,
  dart: `import 'dart:convert';
import 'dart:io';

enum State { idle, chase, attack }

State nextState(int distance) {
  if (distance <= 2) return State.attack;
  if (distance <= 8) return State.chase;
  return State.idle;
}

Future<void> main() async {
  final text = await stdin.transform(utf8.decoder).join();
  for (final word in text.trim().split(RegExp(r'\\s+'))) {
    print('$word \${nextState(int.parse(word)).name}');
  }
}
`,
  ruby: `def next_state(distance)
  return :attack if distance <= 2
  return :chase if distance <= 8

  :idle
end

STDIN.read.split.map(&:to_i).each do |distance|
  puts "#{distance} #{next_state(distance)}"
end
`,
  php: `<?php
function next_state(int $distance): string {
    if ($distance <= 2) {
        return 'attack';
    }
    return $distance <= 8 ? 'chase' : 'idle';
}

foreach (preg_split('/\\s+/', trim(stream_get_contents(STDIN))) as $word) {
    echo $word, ' ', next_state((int) $word), "\\n";
}
`,
  lua: `local function nextState(distance)
  if distance <= 2 then return "attack" end
  if distance <= 8 then return "chase" end
  return "idle"
end

for word in io.read("a"):gmatch("%S+") do
  print(word .. " " .. nextState(tonumber(word)))
end
`,
  perl: `use strict;
use warnings;

sub next_state {
    my ($distance) = @_;
    return 'attack' if $distance <= 2;
    return 'chase' if $distance <= 8;
    return 'idle';
}

my @words = split ' ', do { local $/; <STDIN> };
print "$_ ", next_state($_), "\\n" for @words;
`,
  r: `next_state <- function(distance) {
  if (distance <= 2) return("attack")
  if (distance <= 8) return("chase")
  "idle"
}

lines <- readLines(file("stdin"), warn = FALSE)
for (word in unlist(strsplit(trimws(lines), "\\\\s+"))) {
  cat(word, next_state(as.integer(word)), "\\n")
}
`,
  bash: `read -r line

for distance in $line; do
    if [ "$distance" -le 2 ]; then
        state=attack
    elif [ "$distance" -le 8 ]; then
        state=chase
    else
        state=idle
    fi
    echo "$distance $state"
done
`,
  godot: `extends SceneTree

enum State { IDLE, CHASE, ATTACK }

func next_state(distance: int) -> State:
	if distance <= 2:
		return State.ATTACK
	if distance <= 8:
		return State.CHASE
	return State.IDLE

func _init():
${GD_WORDS}
	for word in words:
		var distance := int(word)
		print(distance, " ", State.keys()[next_state(distance)].to_lower())
	quit()
`,
});

export const DELTA_TIME = withEngines({
  python: `import sys

SPEED = 100
x = 0.0
for dt in map(float, sys.stdin.read().split()):
    x += SPEED * dt
    print(f"{x:.1f}")
`,
  javascript: `const SPEED = 100;
let x = 0;

for (const word of require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/)) {
  x += SPEED * Number(word);
  console.log(x.toFixed(1));
}
`,
  typescript: `import { readFileSync } from 'node:fs';

const SPEED: number = 100;
let x: number = 0;

for (const word of readFileSync(0, 'utf8').trim().split(/\\s+/)) {
  x += SPEED * Number(word);
  console.log(x.toFixed(1));
}
`,
  java: `import java.util.*;

public class Main {
    static final double SPEED = 100;

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in).useLocale(Locale.ROOT);
        double x = 0;
        while (in.hasNextDouble()) {
            x += SPEED * in.nextDouble();
            System.out.println(String.format(Locale.ROOT, "%.1f", x));
        }
    }
}
`,
  csharp: `using System;
using System.Globalization;

class Program {
    const float Speed = 100f;

    static void Main() {
        float x = 0f;
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        foreach (var word in words) {
            float deltaTime = float.Parse(word, CultureInfo.InvariantCulture);
            x += Speed * deltaTime;
            Console.WriteLine(x.ToString("F1", CultureInfo.InvariantCulture));
        }
    }
}
`,
  cpp: `#include <iomanip>
#include <iostream>
using namespace std;

int main() {
    const double speed = 100;
    double x = 0, deltaTime;

    cout << fixed << setprecision(1);
    while (cin >> deltaTime) {
        x += speed * deltaTime;
        cout << x << "\\n";
    }
}
`,
  c: `#include <stdio.h>

int main(void) {
    const double speed = 100;
    double x = 0, delta_time;

    while (scanf("%lf", &delta_time) == 1) {
        x += speed * delta_time;
        printf("%.1f\\n", x);
    }
    return 0;
}
`,
  go: `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	const speed = 100.0
	x := 0.0

	in := bufio.NewReader(os.Stdin)
	for {
		var deltaTime float64
		if _, err := fmt.Fscan(in, &deltaTime); err != nil {
			return
		}
		x += speed * deltaTime
		fmt.Printf("%.1f\\n", x)
	}
}
`,
  rust: `use std::io::{self, Read};

const SPEED: f64 = 100.0;

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    let mut x = 0.0;
    for word in input.split_whitespace() {
        let delta_time: f64 = word.parse().unwrap();
        x += SPEED * delta_time;
        println!("{:.1}", x);
    }
}
`,
  kotlin: `import java.util.Locale

const val SPEED = 100.0

fun main() {
    var x = 0.0
    val words = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+"))
    for (word in words) {
        x += SPEED * word.toDouble()
        println(String.format(Locale.ROOT, "%.1f", x))
    }
}
`,
  swift: `import Foundation

let speed = 100.0
var x = 0.0

while let line = readLine() {
    for word in line.split(separator: " ") {
        x += speed * Double(word)!
        print(String(format: "%.1f", x))
    }
}
`,
  dart: `import 'dart:convert';
import 'dart:io';

const speed = 100.0;

Future<void> main() async {
  var x = 0.0;
  final text = await stdin.transform(utf8.decoder).join();
  for (final word in text.trim().split(RegExp(r'\\s+'))) {
    x += speed * double.parse(word);
    print(x.toStringAsFixed(1));
  }
}
`,
  ruby: `SPEED = 100
x = 0.0

STDIN.read.split.map(&:to_f).each do |delta_time|
  x += SPEED * delta_time
  puts format("%.1f", x)
end
`,
  php: `<?php
const SPEED = 100;
$x = 0.0;

foreach (preg_split('/\\s+/', trim(stream_get_contents(STDIN))) as $word) {
    $x += SPEED * (float) $word;
    echo number_format($x, 1, '.', ''), "\\n";
}
`,
  lua: `local SPEED = 100
local x = 0

for word in io.read("a"):gmatch("%S+") do
  x = x + SPEED * tonumber(word)
  print(string.format("%.1f", x))
end
`,
  perl: `use strict;
use warnings;

my $speed = 100;
my $x = 0;

for my $delta_time (split ' ', do { local $/; <STDIN> }) {
    $x += $speed * $delta_time;
    printf "%.1f\\n", $x;
}
`,
  r: `speed <- 100
x <- 0

lines <- readLines(file("stdin"), warn = FALSE)
for (word in unlist(strsplit(trimws(lines), "\\\\s+"))) {
  x <- x + speed * as.numeric(word)
  cat(sprintf("%.1f\\n", x))
}
`,
  bash: `# The shell only does whole-number arithmetic, so awk handles the decimals.
tr ' ' '\\n' | awk -v speed=100 'NF {
    x += speed * $1
    printf "%.1f\\n", x
}'
`,
  godot: `extends SceneTree

const SPEED := 100.0

func _init():
${GD_WORDS}
	var x := 0.0
	for word in words:
		x += SPEED * float(word)
		print("%.1f" % x)
	quit()
`,
});

// What every language's version of each example must print.
export const EXPECTED_OUTPUT = {
  'reading-input': '30\n',
  'trace-table': 'i = 1 total = 1\ni = 2 total = 3\ni = 3 total = 6\n',
  'stacks-queues': 'Stack: 3 2 1\nQueue: 1 2 3\n',
  'sliding-window': '13\n',
  memoization: '165580141\n',
  'custom-sort': 'abe 90\nzed 90\nmia 70\n',
  'allow-list': 'OK alice_01\nREJECTED bob;rm\nREJECTED ab\n',
  'state-machine': '12 idle\n7 chase\n4 chase\n1 attack\n6 chase\n20 idle\n',
  'delta-time': '50.0\n75.0\n100.0\n',
};
