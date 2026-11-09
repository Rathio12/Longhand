// One small program per language, all producing the same output. It shows the
// syntax a student needs in an exam and deliberately solves no listed problem.
const PYTHON = `import sys

# Reading input: everything the test sends, split into words.
words = sys.stdin.read().split()
count = int(words[0])
numbers = [int(w) for w in words[1:count + 1]]


# A function
def is_even(value):
    return value % 2 == 0


# Variables, a loop and an if
total = 0
largest = numbers[0]
for value in numbers:
    total += value
    if value > largest:
        largest = value

print("Total:", total)
print("Largest:", largest)

# Lists
evens = [v for v in numbers if is_even(v)]
print("Even numbers:", *evens)

# Maps (dictionaries)
counts = {}
for fruit in ["apple", "pear", "apple"]:
    counts[fruit] = counts.get(fruit, 0) + 1
for fruit in sorted(counts):
    print(fruit, counts[fruit])

# Strings
print("hello".upper())
`;

const JAVASCRIPT = `// Reading input: everything the test sends, split into words.
const words = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/);
const count = Number(words[0]);
const numbers = words.slice(1, count + 1).map(Number);

// A function
function isEven(value) {
  return value % 2 === 0;
}

// Variables, a loop and an if
let total = 0;
let largest = numbers[0];
for (const value of numbers) {
  total += value;
  if (value > largest) largest = value;
}

console.log('Total:', total);
console.log('Largest:', largest);

// Arrays
const evens = numbers.filter(isEven);
console.log('Even numbers:', evens.join(' '));

// Maps
const counts = new Map();
for (const fruit of ['apple', 'pear', 'apple']) {
  counts.set(fruit, (counts.get(fruit) ?? 0) + 1);
}
for (const fruit of [...counts.keys()].sort()) {
  console.log(fruit, counts.get(fruit));
}

// Strings
console.log('hello'.toUpperCase());
`;

const TYPESCRIPT = `import { readFileSync } from 'node:fs';

// Reading input: everything the test sends, split into words.
const words: string[] = readFileSync(0, 'utf8').trim().split(/\\s+/);
const count: number = Number(words[0]);
const numbers: number[] = words.slice(1, count + 1).map(Number);

// A function
function isEven(value: number): boolean {
  return value % 2 === 0;
}

// Variables, a loop and an if
let total = 0;
let largest = numbers[0];
for (const value of numbers) {
  total += value;
  if (value > largest) largest = value;
}

console.log('Total:', total);
console.log('Largest:', largest);

// Arrays
const evens: number[] = numbers.filter(isEven);
console.log('Even numbers:', evens.join(' '));

// Maps
const counts = new Map<string, number>();
for (const fruit of ['apple', 'pear', 'apple']) {
  counts.set(fruit, (counts.get(fruit) ?? 0) + 1);
}
for (const fruit of [...counts.keys()].sort()) {
  console.log(fruit, counts.get(fruit));
}

// Strings
console.log('hello'.toUpperCase());
`;

const JAVA = `import java.util.*;

public class Main {
    // A function
    static boolean isEven(int value) {
        return value % 2 == 0;
    }

    public static void main(String[] args) {
        // Reading input
        Scanner in = new Scanner(System.in);
        int count = in.nextInt();
        int[] numbers = new int[count];
        for (int i = 0; i < count; i++) {
            numbers[i] = in.nextInt();
        }

        // Variables, a loop and an if
        int total = 0;
        int largest = numbers[0];
        for (int value : numbers) {
            total += value;
            if (value > largest) largest = value;
        }

        System.out.println("Total: " + total);
        System.out.println("Largest: " + largest);

        // Lists
        List<String> evens = new ArrayList<>();
        for (int value : numbers) {
            if (isEven(value)) evens.add(String.valueOf(value));
        }
        System.out.println("Even numbers: " + String.join(" ", evens));

        // Maps (TreeMap keeps its keys sorted)
        Map<String, Integer> counts = new TreeMap<>();
        for (String fruit : new String[] {"apple", "pear", "apple"}) {
            counts.merge(fruit, 1, Integer::sum);
        }
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            System.out.println(entry.getKey() + " " + entry.getValue());
        }

        // Strings
        System.out.println("hello".toUpperCase());
    }
}
`;

const CSHARP = `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    // A function
    static bool IsEven(int value) => value % 2 == 0;

    static void Main() {
        // Reading input: everything the test sends, split into words.
        var words = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
        int count = int.Parse(words[0]);
        var numbers = words.Skip(1).Take(count).Select(int.Parse).ToList();

        // Variables, a loop and an if
        int total = 0;
        int largest = numbers[0];
        foreach (int value in numbers) {
            total += value;
            if (value > largest) largest = value;
        }

        Console.WriteLine($"Total: {total}");
        Console.WriteLine($"Largest: {largest}");

        // Lists
        var evens = numbers.Where(IsEven);
        Console.WriteLine("Even numbers: " + string.Join(" ", evens));

        // Maps (SortedDictionary keeps its keys sorted)
        var counts = new SortedDictionary<string, int>(StringComparer.Ordinal);
        foreach (string fruit in new[] { "apple", "pear", "apple" }) {
            counts.TryGetValue(fruit, out int seen);
            counts[fruit] = seen + 1;
        }
        foreach (var entry in counts) {
            Console.WriteLine($"{entry.Key} {entry.Value}");
        }

        // Strings
        Console.WriteLine("hello".ToUpperInvariant());
    }
}
`;

const CPP = `#include <algorithm>
#include <cctype>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// A function
bool isEven(int value) {
    return value % 2 == 0;
}

int main() {
    // Reading input
    int count;
    cin >> count;
    vector<int> numbers(count);
    for (int& value : numbers) cin >> value;

    // Variables, a loop and an if
    int total = 0;
    int largest = numbers[0];
    for (int value : numbers) {
        total += value;
        if (value > largest) largest = value;
    }

    cout << "Total: " << total << "\\n";
    cout << "Largest: " << largest << "\\n";

    // Vectors
    cout << "Even numbers:";
    for (int value : numbers) {
        if (isEven(value)) cout << " " << value;
    }
    cout << "\\n";

    // Maps (std::map keeps its keys sorted)
    map<string, int> counts;
    for (string fruit : {"apple", "pear", "apple"}) counts[fruit]++;
    for (const auto& entry : counts) {
        cout << entry.first << " " << entry.second << "\\n";
    }

    // Strings
    string word = "hello";
    transform(word.begin(), word.end(), word.begin(), ::toupper);
    cout << word << "\\n";
    return 0;
}
`;

const C = `#include <ctype.h>
#include <stdio.h>
#include <string.h>

// A function
int is_even(int value) {
    return value % 2 == 0;
}

int main(void) {
    // Reading input
    int count;
    int numbers[100];
    scanf("%d", &count);
    for (int i = 0; i < count; i++) {
        scanf("%d", &numbers[i]);
    }

    // Variables, a loop and an if
    int total = 0;
    int largest = numbers[0];
    for (int i = 0; i < count; i++) {
        total += numbers[i];
        if (numbers[i] > largest) largest = numbers[i];
    }

    printf("Total: %d\\n", total);
    printf("Largest: %d\\n", largest);

    // Arrays
    printf("Even numbers:");
    for (int i = 0; i < count; i++) {
        if (is_even(numbers[i])) printf(" %d", numbers[i]);
    }
    printf("\\n");

    // C has no built-in map, so match names against a small table.
    const char *fruits[] = {"apple", "pear", "apple"};
    const char *names[3];
    int counts[3] = {0};
    int used = 0;
    for (int i = 0; i < 3; i++) {
        int found = -1;
        for (int j = 0; j < used; j++) {
            if (strcmp(names[j], fruits[i]) == 0) found = j;
        }
        if (found == -1) {
            found = used++;
            names[found] = fruits[i];
        }
        counts[found]++;
    }
    for (int i = 0; i < used; i++) {
        printf("%s %d\\n", names[i], counts[i]);
    }

    // Strings are arrays of characters.
    char word[] = "hello";
    for (int i = 0; word[i]; i++) word[i] = toupper(word[i]);
    printf("%s\\n", word);
    return 0;
}
`;

const GO = `package main

import (
	"bufio"
	"fmt"
	"os"
	"sort"
	"strings"
)

// A function
func isEven(value int) bool {
	return value%2 == 0
}

func main() {
	// Reading input
	in := bufio.NewReader(os.Stdin)
	var count int
	fmt.Fscan(in, &count)
	numbers := make([]int, count)
	for i := range numbers {
		fmt.Fscan(in, &numbers[i])
	}

	// Variables, a loop and an if
	total := 0
	largest := numbers[0]
	for _, value := range numbers {
		total += value
		if value > largest {
			largest = value
		}
	}

	fmt.Println("Total:", total)
	fmt.Println("Largest:", largest)

	// Slices
	evens := []string{}
	for _, value := range numbers {
		if isEven(value) {
			evens = append(evens, fmt.Sprint(value))
		}
	}
	fmt.Println("Even numbers:", strings.Join(evens, " "))

	// Maps
	counts := map[string]int{}
	for _, fruit := range []string{"apple", "pear", "apple"} {
		counts[fruit]++
	}
	names := make([]string, 0, len(counts))
	for name := range counts {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		fmt.Println(name, counts[name])
	}

	// Strings
	fmt.Println(strings.ToUpper("hello"))
}
`;

const RUST = `use std::collections::BTreeMap;
use std::io::{self, Read};

// A function
fn is_even(value: i32) -> bool {
    value % 2 == 0
}

fn main() {
    // Reading input: everything the test sends, split into words.
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();
    let mut words = input.split_whitespace();
    let count: usize = words.next().unwrap().parse().unwrap();
    let numbers: Vec<i32> = words.take(count).map(|w| w.parse().unwrap()).collect();

    // Variables, a loop and an if
    let mut total = 0;
    let mut largest = numbers[0];
    for &value in &numbers {
        total += value;
        if value > largest {
            largest = value;
        }
    }

    println!("Total: {}", total);
    println!("Largest: {}", largest);

    // Vectors
    let evens: Vec<String> = numbers.iter().filter(|v| is_even(**v)).map(|v| v.to_string()).collect();
    println!("Even numbers: {}", evens.join(" "));

    // Maps (BTreeMap keeps its keys sorted)
    let mut counts: BTreeMap<&str, i32> = BTreeMap::new();
    for fruit in ["apple", "pear", "apple"] {
        *counts.entry(fruit).or_insert(0) += 1;
    }
    for (fruit, seen) in &counts {
        println!("{} {}", fruit, seen);
    }

    // Strings
    println!("{}", "hello".to_uppercase());
}
`;

const KOTLIN = `// A function
fun isEven(value: Int): Boolean = value % 2 == 0

fun main() {
    // Reading input: everything the test sends, split into words.
    val words = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+"))
    val count = words[0].toInt()
    val numbers = words.subList(1, count + 1).map { it.toInt() }

    // Variables, a loop and an if
    var total = 0
    var largest = numbers[0]
    for (value in numbers) {
        total += value
        if (value > largest) largest = value
    }

    println("Total: $total")
    println("Largest: $largest")

    // Lists
    val evens = numbers.filter { isEven(it) }
    println("Even numbers: " + evens.joinToString(" "))

    // Maps
    val counts = mutableMapOf<String, Int>()
    for (fruit in listOf("apple", "pear", "apple")) {
        counts[fruit] = (counts[fruit] ?: 0) + 1
    }
    for (fruit in counts.keys.sorted()) {
        println("$fruit \${counts[fruit]}")
    }

    // Strings
    println("hello".uppercase())
}
`;

const SWIFT = `// A function
func isEven(_ value: Int) -> Bool {
    return value % 2 == 0
}

// Reading input: every word the test sends.
var words: [String] = []
while let line = readLine() {
    words += line.split(separator: " ").map(String.init)
}
let count = Int(words[0])!
let numbers = words[1...count].map { Int($0)! }

// Variables, a loop and an if
var total = 0
var largest = numbers[0]
for value in numbers {
    total += value
    if value > largest {
        largest = value
    }
}

print("Total: \\(total)")
print("Largest: \\(largest)")

// Arrays
let evens = numbers.filter(isEven).map(String.init)
print("Even numbers: " + evens.joined(separator: " "))

// Dictionaries
var counts: [String: Int] = [:]
for fruit in ["apple", "pear", "apple"] {
    counts[fruit, default: 0] += 1
}
for fruit in counts.keys.sorted() {
    print(fruit, counts[fruit]!)
}

// Strings
print("hello".uppercased())
`;

const DART = `import 'dart:convert';
import 'dart:io';

// A function
bool isEven(int value) => value % 2 == 0;

Future<void> main() async {
  // Reading input: everything the test sends, split into words.
  final text = await stdin.transform(utf8.decoder).join();
  final words = text.trim().split(RegExp(r'\\s+'));
  final count = int.parse(words[0]);
  final numbers = words.sublist(1, count + 1).map(int.parse).toList();

  // Variables, a loop and an if
  var total = 0;
  var largest = numbers[0];
  for (final value in numbers) {
    total += value;
    if (value > largest) largest = value;
  }

  print('Total: $total');
  print('Largest: $largest');

  // Lists
  final evens = numbers.where(isEven).join(' ');
  print('Even numbers: $evens');

  // Maps
  final counts = <String, int>{};
  for (final fruit in ['apple', 'pear', 'apple']) {
    counts[fruit] = (counts[fruit] ?? 0) + 1;
  }
  final names = counts.keys.toList()..sort();
  for (final name in names) {
    print('$name \${counts[name]}');
  }

  // Strings
  print('hello'.toUpperCase());
}
`;

const RUBY = `# Reading input: everything the test sends, split into words.
words = STDIN.read.split
count = words[0].to_i
numbers = words[1, count].map(&:to_i)

# A function
def even_number?(value)
  value % 2 == 0
end

# Variables, a loop and an if
total = 0
largest = numbers[0]
numbers.each do |value|
  total += value
  largest = value if value > largest
end

puts "Total: #{total}"
puts "Largest: #{largest}"

# Arrays
evens = numbers.select { |v| even_number?(v) }
puts "Even numbers: #{evens.join(' ')}"

# Hashes
counts = Hash.new(0)
%w[apple pear apple].each { |fruit| counts[fruit] += 1 }
counts.keys.sort.each { |fruit| puts "#{fruit} #{counts[fruit]}" }

# Strings
puts "hello".upcase
`;

const PHP = `<?php
// Reading input: everything the test sends, split into words.
$words = preg_split('/\\s+/', trim(stream_get_contents(STDIN)));
$count = (int) $words[0];
$numbers = array_map('intval', array_slice($words, 1, $count));

// A function
function is_even(int $value): bool {
    return $value % 2 === 0;
}

// Variables, a loop and an if
$total = 0;
$largest = $numbers[0];
foreach ($numbers as $value) {
    $total += $value;
    if ($value > $largest) {
        $largest = $value;
    }
}

echo "Total: $total\\n";
echo "Largest: $largest\\n";

// Arrays
$evens = array_filter($numbers, 'is_even');
echo "Even numbers: " . implode(" ", $evens) . "\\n";

// Associative arrays work as maps.
$counts = [];
foreach (["apple", "pear", "apple"] as $fruit) {
    $counts[$fruit] = ($counts[$fruit] ?? 0) + 1;
}
ksort($counts);
foreach ($counts as $fruit => $seen) {
    echo "$fruit $seen\\n";
}

// Strings
echo strtoupper("hello"), "\\n";
`;

const LUA = `-- Reading input: everything the test sends, split into words.
local words = {}
for word in io.read("a"):gmatch("%S+") do
  words[#words + 1] = word
end

local count = tonumber(words[1])
local numbers = {}
for i = 1, count do
  numbers[i] = tonumber(words[i + 1])
end

-- A function
local function isEven(value)
  return value % 2 == 0
end

-- Variables, a loop and an if
local total = 0
local largest = numbers[1]
for _, value in ipairs(numbers) do
  total = total + value
  if value > largest then
    largest = value
  end
end

print("Total: " .. total)
print("Largest: " .. largest)

-- Tables work as lists
local evens = {}
for _, value in ipairs(numbers) do
  if isEven(value) then
    evens[#evens + 1] = value
  end
end
print("Even numbers: " .. table.concat(evens, " "))

-- Tables also work as maps
local counts = {}
for _, fruit in ipairs({ "apple", "pear", "apple" }) do
  counts[fruit] = (counts[fruit] or 0) + 1
end

local names = {}
for name in pairs(counts) do
  names[#names + 1] = name
end
table.sort(names)
for _, name in ipairs(names) do
  print(name .. " " .. counts[name])
end

-- Strings
print(string.upper("hello"))
`;

const PERL = `use strict;
use warnings;

# Reading input: everything the test sends, split into words.
my @words = split ' ', do { local $/; <STDIN> };
my $count = $words[0];
my @numbers = @words[1 .. $count];

# A function
sub is_even {
    my ($value) = @_;
    return $value % 2 == 0;
}

# Variables, a loop and an if
my $total = 0;
my $largest = $numbers[0];
for my $value (@numbers) {
    $total += $value;
    $largest = $value if $value > $largest;
}

print "Total: $total\\n";
print "Largest: $largest\\n";

# Arrays
my @evens = grep { is_even($_) } @numbers;
print "Even numbers: @evens\\n";

# Hashes
my %counts;
$counts{$_}++ for qw(apple pear apple);
print "$_ $counts{$_}\\n" for sort keys %counts;

# Strings
print uc("hello"), "\\n";
`;

const R = `# Reading input: everything the test sends, split into words.
lines <- readLines(file("stdin"), warn = FALSE)
words <- unlist(strsplit(trimws(lines), "\\\\s+"))
count <- as.integer(words[1])
numbers <- as.integer(words[2:(count + 1)])

# A function
is_even <- function(value) {
  value %% 2 == 0
}

# Variables, a loop and an if
total <- 0
largest <- numbers[1]
for (value in numbers) {
  total <- total + value
  if (value > largest) {
    largest <- value
  }
}

cat("Total:", total, "\\n", sep = " ")
cat("Largest:", largest, "\\n", sep = " ")

# Vectors
evens <- numbers[is_even(numbers)]
cat("Even numbers:", evens, "\\n")

# A table counts how often each value appears.
counts <- table(c("apple", "pear", "apple"))
for (name in sort(names(counts))) {
  cat(name, counts[[name]], "\\n")
}

# Strings
cat(toupper("hello"), "\\n")
`;

const BASH = `# Reading input: one line at a time.
read -r count
read -r line

# A function
is_even() {
    [ $(( $1 % 2 )) -eq 0 ]
}

# Variables, a loop and an if
total=0
largest=0
for value in $line; do
    total=$(( total + value ))
    if [ "$value" -gt "$largest" ]; then
        largest=$value
    fi
done

echo "Total: $total"
echo "Largest: $largest"

# Building a list as text
evens=""
for value in $line; do
    if is_even "$value"; then
        evens="$evens $value"
    fi
done
echo "Even numbers:$evens"

# Counting with a pipeline instead of a map
printf '%s\\n' apple pear apple | sort | uniq -c | while read -r seen fruit; do
    echo "$fruit $seen"
done

# Strings
echo hello | tr 'a-z' 'A-Z'
`;

const GDSCRIPT = `extends SceneTree

# A function
func is_even(value: int) -> bool:
	return value % 2 == 0

func _init():
	# Reading input: every line the test sends.
	var words: Array = []
	while true:
		var line := OS.read_string_from_stdin().strip_edges()
		if line.is_empty():
			break
		words.append_array(line.replace("\\n", " ").replace("\\r", " ").split(" ", false))

	var count := int(words[0])
	var numbers: Array = []
	for i in range(1, count + 1):
		numbers.append(int(words[i]))

	# Variables, a loop and an if
	var total := 0
	var largest: int = numbers[0]
	for value in numbers:
		total += value
		if value > largest:
			largest = value

	print("Total: ", total)
	print("Largest: ", largest)

	# Arrays
	var evens: Array = []
	for value in numbers:
		if is_even(value):
			evens.append(str(value))
	print("Even numbers: ", " ".join(PackedStringArray(evens)))

	# Dictionaries
	var counts := {}
	for fruit in ["apple", "pear", "apple"]:
		counts[fruit] = counts.get(fruit, 0) + 1
	var names: Array = counts.keys()
	names.sort()
	for fruit in names:
		print(fruit, " ", counts[fruit])

	# Strings
	print("hello".to_upper())
	quit()
`;

export const LANGUAGE_BASICS = {
  python: PYTHON,
  javascript: JAVASCRIPT,
  typescript: TYPESCRIPT,
  java: JAVA,
  csharp: CSHARP,
  cpp: CPP,
  c: C,
  go: GO,
  rust: RUST,
  kotlin: KOTLIN,
  swift: SWIFT,
  dart: DART,
  ruby: RUBY,
  php: PHP,
  lua: LUA,
  perl: PERL,
  r: R,
  bash: BASH,
  godot: GDSCRIPT,
  unity: CSHARP,
  unreal: CPP,
  love: LUA,
};

export const BASICS_INPUT = '3\n10 25 40\n';
export const BASICS_OUTPUT = 'Total: 75\nLargest: 40\nEven numbers: 10 40\napple 2\npear 1\nHELLO\n';
