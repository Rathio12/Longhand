// Every language the app can run. A language is just a recipe: which file to
// write, how to compile it (optional) and how to run it. Placeholders:
//   {file} source file, {dir} temp folder, {out} compiled binary, {node} bundled runtime
const EXE = process.platform === 'win32' ? 'program.exe' : 'program';

const PY = `import sys

# Everything the test sends you, split into words.
data = sys.stdin.read().split()

# Write your solution here, then print the answer.
print(data)
`;

const JS = `const fs = require('fs');

// Everything the test sends you, split into words.
const data = fs.readFileSync(0, 'utf8').trim().split(/\\s+/);

// Write your solution here, then print the answer.
console.log(data);
`;

const TS = `import { readFileSync } from 'node:fs';

// Everything the test sends you, split into words.
const data: string[] = readFileSync(0, 'utf8').trim().split(/\\s+/);

// Write your solution here, then print the answer.
console.log(data);
`;

const C = `#include <stdio.h>

int main(void) {
    int n;
    // Read a number from the input.
    if (scanf("%d", &n) != 1) return 0;

    // Write your solution here, then print the answer.
    printf("%d\\n", n);
    return 0;
}
`;

const CPP = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    // Read a number from the input.
    cin >> n;

    // Write your solution here, then print the answer.
    cout << n << "\\n";
    return 0;
}
`;

const JAVA = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);

        // Read a number from the input.
        int n = in.nextInt();

        // Write your solution here, then print the answer.
        System.out.println(n);
    }
}
`;

const CS = `using System;

class Program {
    static void Main() {
        // Everything the test sends you, split into words.
        string[] data = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);

        // Write your solution here, then print the answer.
        Console.WriteLine(string.Join(" ", data));
    }
}
`;

const GO = `package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	in := bufio.NewReader(os.Stdin)

	// Read a number from the input.
	var n int
	fmt.Fscan(in, &n)

	// Write your solution here, then print the answer.
	fmt.Println(n)
}
`;

const RUST = `use std::io::{self, Read};

fn main() {
    let mut input = String::new();
    io::stdin().read_to_string(&mut input).unwrap();

    // Everything the test sends you, split into words.
    let data: Vec<&str> = input.split_whitespace().collect();

    // Write your solution here, then print the answer.
    println!("{}", data.join(" "));
}
`;

const RUBY = `# Everything the test sends you, split into words.
data = STDIN.read.split

# Write your solution here, then print the answer.
puts data.join(" ")
`;

const PHP = `<?php
// Everything the test sends you, split into words.
$data = preg_split('/\\s+/', trim(stream_get_contents(STDIN)));

// Write your solution here, then print the answer.
echo implode(" ", $data), "\\n";
`;

const LUA = `-- Everything the test sends you, split into words.
local data = {}
for word in io.read("a"):gmatch("%S+") do
  data[#data + 1] = word
end

-- Write your solution here, then print the answer.
print(table.concat(data, " "))
`;

const PERL = `use strict;
use warnings;

# Everything the test sends you, split into words.
my @data = split ' ', do { local $/; <STDIN> };

# Write your solution here, then print the answer.
print join(" ", @data), "\\n";
`;

const BASH = `# Everything the test sends you. Leaving $data unquoted splits it into words.
data=$(cat)

# Write your solution here, then print the answer.
echo $data
`;

const KOTLIN = `fun main() {
    // Everything the test sends you, split into words.
    val data = generateSequence(::readLine).joinToString(" ").trim().split(Regex("\\\\s+"))

    // Write your solution here, then print the answer.
    println(data.joinToString(" "))
}
`;

const SWIFT = `import Foundation

// Everything the test sends you, split into words.
var data: [String] = []
while let line = readLine() {
    data += line.split(separator: " ").map(String.init)
}

// Write your solution here, then print the answer.
print(data.joined(separator: " "))
`;

const DART = `import 'dart:io';
import 'dart:convert';

Future<void> main() async {
  final text = await stdin.transform(utf8.decoder).join();

  // Everything the test sends you, split into words.
  final data = text.trim().split(RegExp(r'\\s+'));

  // Write your solution here, then print the answer.
  print(data.join(' '));
}
`;

const R = `# Everything the test sends you, split into words.
lines <- readLines(file("stdin"), warn = FALSE)
data <- unlist(strsplit(trimws(lines), "\\\\s+"))

# Write your solution here, then print the answer.
cat(data, "\\n")
`;

// Game engine flavours. The engines themselves are heavy, so Unity and Unreal
// use small look-alike types and run as ordinary console programs. Godot is the
// exception: it can run a script without opening a window.
const GODOT = `extends SceneTree

func _init():
	# Read every line the test sends you.
	var words: Array = []
	while true:
		var line := OS.read_string_from_stdin().strip_edges()
		if line.is_empty():
			break
		words.append_array(line.replace("\\n", " ").replace("\\r", " ").split(" ", false))

	# Write your solution here, then print the answer.
	print(" ".join(PackedStringArray(words)))
	quit()
`;

const UNITY = `using System;

// Small stand-ins for Unity types, so this runs without the engine.
struct Vector2 {
    public float x, y;
    public Vector2(float x, float y) { this.x = x; this.y = y; }
    public static Vector2 operator +(Vector2 a, Vector2 b) => new Vector2(a.x + b.x, a.y + b.y);
    public static Vector2 operator -(Vector2 a, Vector2 b) => new Vector2(a.x - b.x, a.y - b.y);
    public static Vector2 operator *(Vector2 a, float s) => new Vector2(a.x * s, a.y * s);
    public float magnitude => MathF.Sqrt(x * x + y * y);
}

static class Mathf {
    public static float Clamp(float v, float min, float max) => MathF.Min(max, MathF.Max(min, v));
    public static float Lerp(float a, float b, float t) => a + (b - a) * Clamp(t, 0f, 1f);
    public static float Abs(float v) => MathF.Abs(v);
}

class Game {
    static void Main() {
        // Everything the test sends you, split into words.
        string[] data = Console.In.ReadToEnd().Split((char[])null, StringSplitOptions.RemoveEmptyEntries);

        // Write your solution here, then print the answer.
        Console.WriteLine(string.Join(" ", data));
    }
}
`;

const UNREAL = `#include <bits/stdc++.h>
using namespace std;

// Small stand-ins for Unreal types, so this runs without the engine.
using int32 = int;
struct FVector2D {
    double X = 0, Y = 0;
    FVector2D operator+(const FVector2D& o) const { return {X + o.X, Y + o.Y}; }
    FVector2D operator-(const FVector2D& o) const { return {X - o.X, Y - o.Y}; }
    FVector2D operator*(double s) const { return {X * s, Y * s}; }
    double Size() const { return sqrt(X * X + Y * Y); }
};
namespace FMath {
    template <class T> T Clamp(T v, T lo, T hi) { return min(hi, max(lo, v)); }
    template <class T> T Lerp(T a, T b, double t) { return a + (b - a) * t; }
}

int main() {
    int32 n;
    // Read a number from the input.
    cin >> n;

    // Write your solution here, then print the answer.
    cout << n << "\\n";
    return 0;
}
`;

const LOVE = `-- Plain Lua in the style of a LÖVE game. No window opens here.
local data = {}
for word in io.read("a"):gmatch("%S+") do
  data[#data + 1] = word
end

-- Write your solution here, then print the answer.
print(table.concat(data, " "))
`;

const CSPROJ = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>{tfm}</TargetFramework>
    <Nullable>disable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UseAppHost>false</UseAppHost>
    <TreatWarningsAsErrors>false</TreatWarningsAsErrors>
    <WarningLevel>0</WarningLevel>
    <SatelliteResourceLanguages>en</SatelliteResourceLanguages>
  </PropertyGroup>
</Project>
`;

const dotnet = {
  file: 'Program.cs',
  tool: 'dotnet',
  extra: { 'app.csproj': CSPROJ },
  compile: ['dotnet', 'build', '-c', 'Release', '-o', '{dir}/out', '--nologo', '-v', 'q', '-clp:NoSummary;ErrorsOnly', '--nodeReuse:false', '-p:UseSharedCompilation=false'],
  run: ['dotnet', '{dir}/out/app.dll'],
  install: 'winget install Microsoft.DotNet.SDK.10',
};

const gcc = { file: 'main.c', tool: 'gcc', compile: ['gcc', '{file}', '-o', '{out}', '-lm', '-O1'], run: ['{out}'], install: 'winget install MSYS2.MSYS2, then run: pacman -S mingw-w64-ucrt-x86_64-gcc' };
const gpp = { file: 'main.cpp', tool: 'g++', compile: ['g++', '-std=c++20', '-O1', '{file}', '-o', '{out}'], run: ['{out}'], install: gcc.install };

const BUILT_IN = [
  { id: 'python', name: 'Python', group: 'Popular', monaco: 'python', file: 'main.py', tool: 'python', run: ['python', '{file}'], install: 'winget install Python.Python.3.13', template: PY },
  { id: 'javascript', name: 'JavaScript', group: 'Popular', monaco: 'javascript', file: 'main.cjs', tool: '{node}', run: ['{node}', '{file}'], builtInRuntime: true, template: JS },
  { id: 'typescript', name: 'TypeScript', group: 'Popular', monaco: 'typescript', file: 'main.mts', tool: '{node}', run: ['{node}', '--no-warnings', '{file}'], builtInRuntime: true, template: TS },
  { id: 'java', name: 'Java', group: 'Popular', monaco: 'java', file: 'Main.java', tool: 'javac', probe: ['-version'], compile: ['javac', '{file}'], run: ['java', '-cp', '{dir}', 'Main'], install: 'winget install EclipseAdoptium.Temurin.21.JDK', template: JAVA },
  { id: 'csharp', name: 'C#', group: 'Popular', monaco: 'csharp', ...dotnet, template: CS },
  { id: 'cpp', name: 'C++', group: 'Popular', monaco: 'cpp', ...gpp, template: CPP },
  { id: 'c', name: 'C', group: 'Popular', monaco: 'c', ...gcc, template: C },

  { id: 'go', name: 'Go', group: 'More languages', monaco: 'go', file: 'main.go', tool: 'go', probe: ['version'], compile: ['go', 'build', '-o', '{out}', '{file}'], run: ['{out}'], install: 'winget install GoLang.Go', template: GO },
  { id: 'rust', name: 'Rust', group: 'More languages', monaco: 'rust', file: 'main.rs', tool: 'rustc', compile: ['rustc', '-O', '-o', '{out}', '{file}'], run: ['{out}'], install: 'winget install Rustlang.Rustup', template: RUST },
  { id: 'kotlin', name: 'Kotlin', group: 'More languages', monaco: 'kotlin', file: 'main.kt', tool: 'kotlinc', compile: ['kotlinc', '{file}', '-include-runtime', '-d', '{dir}/main.jar'], run: ['java', '-jar', '{dir}/main.jar'], install: 'winget install JetBrains.Kotlin.Compiler', template: KOTLIN },
  { id: 'swift', name: 'Swift', group: 'More languages', monaco: 'swift', file: 'main.swift', tool: 'swift', run: ['swift', '{file}'], install: 'winget install Swift.Toolchain', template: SWIFT },
  { id: 'dart', name: 'Dart', group: 'More languages', monaco: 'dart', file: 'main.dart', tool: 'dart', run: ['dart', '{file}'], install: 'winget install Dart.Dart', template: DART },
  { id: 'ruby', name: 'Ruby', group: 'More languages', monaco: 'ruby', file: 'main.rb', tool: 'ruby', run: ['ruby', '{file}'], install: 'winget install RubyInstallerTeam.Ruby.3.4', template: RUBY },
  { id: 'php', name: 'PHP', group: 'More languages', monaco: 'php', file: 'main.php', tool: 'php', run: ['php', '{file}'], install: 'winget install PHP.PHP.8.4', template: PHP },
  { id: 'lua', name: 'Lua', group: 'More languages', monaco: 'lua', file: 'main.lua', tool: 'lua', probe: ['-v'], run: ['lua', '{file}'], install: 'winget install DEVCOM.Lua', template: LUA },
  { id: 'perl', name: 'Perl', group: 'More languages', monaco: 'perl', file: 'main.pl', tool: 'perl', run: ['perl', '{file}'], install: 'winget install StrawberryPerl.StrawberryPerl', template: PERL },
  { id: 'r', name: 'R', group: 'More languages', monaco: 'r', file: 'main.R', tool: 'Rscript', run: ['Rscript', '{file}'], install: 'winget install RProject.R', template: R },
  { id: 'bash', name: 'Bash', group: 'More languages', monaco: 'shell', file: 'main.sh', tool: 'bash', run: ['bash', 'main.sh'], install: 'Install Git for Windows, or run: wsl --install', template: BASH,
    // Stays on line 1 so error messages keep the student's line numbers. `grep` finding
    // nothing exits with 1, which is a normal result and not a crash.
    prelude: 'export LC_ALL=C; cd work 2>/dev/null; ',
    ignoreExitCode: true },

  { id: 'godot', name: 'Godot (GDScript)', group: 'Game engines', monaco: 'gdscript', file: 'main.gd', tool: 'godot', run: ['godot', '--headless', '--no-header', '--script', '{file}'], install: 'winget install GodotEngine.GodotEngine, or set the path to godot.exe below', template: GODOT },
  { id: 'unity', name: 'Unity-style C#', group: 'Game engines', monaco: 'csharp', ...dotnet, template: UNITY },
  { id: 'unreal', name: 'Unreal-style C++', group: 'Game engines', monaco: 'cpp', ...gpp, file: 'main.cpp', template: UNREAL },
  { id: 'love', name: 'LÖVE-style Lua', group: 'Game engines', monaco: 'lua', file: 'main.lua', tool: 'lua', probe: ['-v'], run: ['lua', '{file}'], install: 'winget install DEVCOM.Lua', template: LOVE },
];

// Splits "gcc {file} -o \"my out\"" into argv, honouring quotes.
function splitCommand(text) {
  const parts = [];
  const pattern = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = pattern.exec(text))) parts.push(match[1] ?? match[2] ?? match[3]);
  return parts;
}

function fromCustom(custom) {
  const run = splitCommand(custom.run || '');
  const compile = custom.compile ? splitCommand(custom.compile) : undefined;
  return {
    id: custom.id,
    name: custom.name,
    group: 'Your languages',
    monaco: custom.monaco || 'plaintext',
    file: custom.file,
    tool: (compile || run)[0],
    compile,
    run,
    custom: true,
    install: 'Check the commands you entered for this language in Settings.',
    template: custom.template || '',
  };
}

function allLanguages(customLanguages = []) {
  return [...BUILT_IN, ...customLanguages.map(fromCustom)];
}

module.exports = { allLanguages, EXE };
