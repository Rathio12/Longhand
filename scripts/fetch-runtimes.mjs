// Downloads the language runtimes shipped in the installer into runtimes/.
// They are too large for git, so this rebuilds them. Every file is pinned to a
// SHA-256 and rejected if it differs. Re-running skips what is already in place.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sevenZip from '7zip-bin';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'runtimes');
const cache = path.join(root, 'node_modules', '.cache', 'longhand-runtimes');

const remove = (target) => fs.rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });

function extract(archive, destination) {
  remove(destination);
  fs.mkdirSync(destination, { recursive: true });
  const result = spawnSync(sevenZip.path7za, ['x', archive, `-o${destination}`, '-y', '-bso0', '-bsp0'], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Could not extract ${archive}`);
}

// Antivirus scanners briefly lock freshly unpacked files, so a move can fail at first.
function move(from, to) {
  for (let attempt = 1; attempt <= 15; attempt++) {
    try {
      fs.renameSync(from, to);
      return;
    } catch (error) {
      if (error.code !== 'EPERM' && error.code !== 'EBUSY' && error.code !== 'EACCES') throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 2000);
    }
  }
  fs.cpSync(from, to, { recursive: true });
  remove(from);
}

// Unpacks an archive whose contents sit in a single folder, and keeps that folder.
function extractFolder(archive, target, folder) {
  const temp = `${target}.tmp`;
  extract(archive, temp);
  remove(target);
  move(path.join(temp, folder ?? fs.readdirSync(temp)[0]), target);
  remove(temp);
}

const prune = (target, ...entries) => {
  for (const entry of entries) remove(path.join(target, entry));
};

const RUNTIMES = [
  {
    name: 'go',
    file: 'go.zip',
    url: 'https://go.dev/dl/go1.27.3.windows-amd64.zip',
    sha256: 'f26081f438319757f8a1b46d7d0b2c5ec7583d4038e485e0aa725cfde7885fff',
    install: (archive, target) => {
      extractFolder(archive, target, 'go');
      prune(target, 'test', 'api', 'doc', 'misc', 'src/cmd');
    },
  },
  {
    name: 'dotnet',
    file: 'dotnet.zip',
    url: 'https://builds.dotnet.microsoft.com/dotnet/Sdk/10.0.403/dotnet-sdk-10.0.403-win-x64.zip',
    sha256: 'f398979a9cac2dba760771c4e01f16e431dcd6bcfb2213e3e8f5b3d354095cc0',
    install: (archive, target) => {
      extract(archive, target);
      prune(target, 'shared/Microsoft.WindowsDesktop.App', 'packs/Microsoft.WindowsDesktop.App.Ref', 'templates', 'sdk/10.0.403/FSharp');
    },
  },
  {
    // The GNU build of Rust brings its own linker. The usual one needs Visual Studio.
    name: 'rust',
    file: 'rust.tar.xz',
    url: 'https://static.rust-lang.org/dist/rust-1.99.1-x86_64-pc-windows-gnu.tar.xz',
    sha256: '0210624b2eb2bdf4ec32c2a6caf5c3bd2ab84e5df66c7530023e37f02add1084',
    install: (archive, target) => {
      const temp = `${target}.tmp`;
      extract(archive, temp);
      const tar = path.join(temp, fs.readdirSync(temp).find((name) => name.endsWith('.tar')));
      const unpacked = `${target}.unpacked`;
      extract(tar, unpacked);
      const top = path.join(unpacked, fs.readdirSync(unpacked)[0]);
      remove(target);
      for (const component of ['rustc', 'rust-std-x86_64-pc-windows-gnu', 'rust-mingw']) {
        fs.cpSync(path.join(top, component), target, { recursive: true, force: true });
      }
      remove(temp);
      remove(unpacked);
      prune(target, 'share/doc', 'share/man');
    },
  },
  {
    name: 'kotlin',
    file: 'kotlin.zip',
    url: 'https://github.com/JetBrains/kotlin/releases/download/v2.4.21/kotlin-compiler-2.4.21.zip',
    sha256: '7cc140e76daf416a0424a5557f99afd7ca89ebd463ea1101261e3e01c33e75cd',
    install: (archive, target) => extractFolder(archive, target, 'kotlinc'),
  },
  {
    name: 'dart',
    file: 'dart.zip',
    url: 'https://storage.googleapis.com/dart-archive/channels/stable/release/3.13.7/sdk/dartsdk-windows-x64-release.zip',
    sha256: '3b31d9f90b27861f29842d378f39f98ce9e60910042334f950ef5702f174fb81',
    install: (archive, target) => {
      extractFolder(archive, target, 'dart-sdk');
      prune(target, 'bin/resources/devtools');
    },
  },
  {
    name: 'ruby',
    file: 'ruby.7z',
    url: 'https://github.com/oneclick/rubyinstaller2/releases/download/RubyInstaller-4.0.9-1/rubyinstaller-4.0.9-1-x64.7z',
    sha256: '1dc0715916251a13c4f6a550a3da1f2c726bff869371fd573a65234c008f47b4',
    install: (archive, target) => {
      extractFolder(archive, target);
      prune(target, 'share/ri', 'share/doc', 'include');
    },
  },
  {
    name: 'php',
    file: 'php.zip',
    // windows.php.net moves a release to archives/ once a newer one exists.
    urls: [
      'https://windows.php.net/downloads/releases/php-8.4.27-1-nts-Win32-vs17-x64.zip',
      'https://windows.php.net/downloads/releases/archives/php-8.4.27-1-nts-Win32-vs17-x64.zip',
    ],
    sha256: 'dbae154a0a89791f36c3d48e68bae797878333e7d6cb5721e74617de59b63ab7',
    install: (archive, target) => extract(archive, target),
  },
  {
    name: 'perl',
    file: 'perl.zip',
    url: 'https://github.com/StrawberryPerl/Perl-Dist-Strawberry/releases/download/SP_54231_64bit/strawberry-perl-5.42.3.1-64bit-portable.zip',
    sha256: '6a081a811781c30aca51dbc036afd93092af91e3297901f02c17043795a10690',
    install: (archive, target) => {
      extractFolder(archive, target, 'perl');
      prune(target, 'vendor', 'html');
    },
  },
  {
    // R only ships as an installer, so it is installed to a temporary folder,
    // copied out and uninstalled again.
    name: 'r',
    file: 'r.exe',
    urls: [
      'https://cloud.r-project.org/bin/windows/base/R-4.6.2-win.exe',
      'https://cloud.r-project.org/bin/windows/base/old/4.6.2/R-4.6.2-win.exe',
    ],
    sha256: 'b0b0053baa1963b6d8a28c9642d50107ef9ce2f41c8b9a90e952846c8918b38a',
    install: (archive, target) => {
      const temp = path.join(os.tmpdir(), 'longhand-r-install');
      remove(temp);
      const setup = spawnSync(archive, ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART', '/CURRENTUSER', '/NOICONS', '/TASKS=', `/DIR=${temp}`], { stdio: 'inherit' });
      if (setup.status !== 0) throw new Error('The R installer failed');
      remove(target);
      fs.cpSync(temp, target, { recursive: true });
      prune(target, 'doc', 'Tcl', 'tests', 'unins000.exe', 'unins000.dat');
      spawnSync(path.join(temp, 'unins000.exe'), ['/VERYSILENT', '/SUPPRESSMSGBOXES', '/NORESTART'], { stdio: 'inherit' });
    },
  },
  {
    name: 'godot',
    file: 'godot.zip',
    url: 'https://github.com/godotengine/godot/releases/download/4.7.2-stable/Godot_v4.7.2-stable_win64.exe.zip',
    sha256: '731980f9608d61333e5baf54a2ef17210acc7a538446c0cb9969f002aca1e953',
    // The console launcher finds the engine by name, so the two are renamed as a pair.
    install: (archive, target) => {
      extract(archive, target);
      for (const name of fs.readdirSync(target)) {
        const renamed = name.endsWith('_console.exe') ? 'godot_console.exe' : 'godot.exe';
        move(path.join(target, name), path.join(target, renamed));
      }
    },
  },
  {
    name: 'python',
    file: 'python.zip',
    url: 'https://www.python.org/ftp/python/3.14.0/python-3.14.0-embed-amd64.zip',
    sha256: '8d4d3590c10449d78aa4375f534e6d5f3027d67fdc362dd1a882279db6f90fdf',
    install: (archive, target) => extract(archive, target),
  },
  {
    name: 'lua',
    file: 'lua.zip',
    url: 'https://downloads.sourceforge.net/project/luabinaries/5.4.2/Tools%20Executables/lua-5.4.2_Win64_bin.zip',
    sha256: '5f1e1385ed95a3643f7ed67c4f3767942b2f0f388b66f63e5667e9c3d96293f5',
    install: (archive, target) => {
      extract(archive, target);
      move(path.join(target, 'lua54.exe'), path.join(target, 'lua.exe'));
    },
  },
  {
    // GCC for C and C++, plus BusyBox for the Linux shell problems.
    name: 'mingw',
    file: 'w64devkit.7z.exe',
    url: 'https://github.com/skeeto/w64devkit/releases/download/v2.11.0/w64devkit-x64-2.11.0.7z.exe',
    sha256: '54c2bb9962e8a30c8270e34c5efc3d5fee579f53087fa7d435b95fbba2af7b2b',
    install: (archive, target) => {
      const temp = `${target}.tmp`;
      extract(archive, temp);
      remove(target);
      move(path.join(temp, 'w64devkit'), target);
      remove(temp);
      // Debuggers, editors, build tools, Fortran and 32-bit libraries, none of which are used here.
      const gcc = 'lib/gcc/x86_64-w64-mingw32/16.2.0';
      for (const extra of [
        'bin/gdb.exe', 'bin/gdbserver.exe', 'bin/vim.exe', 'bin/view.exe', 'bin/vimdiff.exe', 'bin/xxd.exe', 'bin/cppcheck.exe', 'bin/ctags.exe', 'bin/nasm.exe', 'bin/ndisasm.exe',
        'bin/cmake.exe', 'bin/ctest.exe', 'bin/cpack.exe', 'bin/ccmake.exe', 'bin/gfortran.exe', 'bin/x86_64-w64-mingw32-gfortran.exe',
        'share/vim', 'share/gdb', 'share/cppcheck', 'share/man', 'share/info', 'share/doc',
        'lib32', `${gcc}/32`, `${gcc}/libgfortran.a`, `${gcc}/libgfortran.spec`, 'libexec/gcc/x86_64-w64-mingw32/16.2.0/f951.exe', 'include/ddk',
      ]) {
        remove(path.join(target, extra));
      }
      for (const name of fs.readdirSync(path.join(target, 'share'))) {
        if (name.startsWith('cmake')) remove(path.join(target, 'share', name));
      }
    },
  },
  {
    name: 'java',
    file: 'jdk.zip',
    url: 'https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.13%2B9/OpenJDK21U-jdk_x64_windows_hotspot_21.0.13_9.zip',
    sha256: 'a4dbaa05fca4bd89d84584e58c459bd732efebb1722af80ab13c6516832004f9',
    // A full JDK is 300 MB. jlink cuts it to the compiler and core library.
    install: (archive, target) => {
      const temp = `${target}.tmp`;
      extract(archive, temp);
      const jdk = path.join(temp, fs.readdirSync(temp)[0]);
      remove(target);
      const result = spawnSync(path.join(jdk, 'bin', 'jlink.exe'), [
        // java.se and jdk.unsupported are what the Kotlin compiler runs on.
        '--add-modules', 'java.se,jdk.compiler,jdk.unsupported,jdk.zipfs',
        '--output', target, '--strip-debug', '--no-header-files', '--no-man-pages', '--compress', 'zip-6',
      ], { stdio: 'inherit' });
      if (result.status !== 0) throw new Error('jlink failed');
      remove(temp);
    },
  },
];

const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function download(urls, destination) {
  for (let attempt = 1; ; attempt++) {
    const url = urls[(attempt - 1) % urls.length];
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'longhand-build' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
      return;
    } catch (error) {
      if (attempt === 6) throw new Error(`Could not download ${url}: ${error.message}`);
      console.log(`  retrying (${error.message})`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));
    }
  }
}

if (process.platform !== 'win32') {
  console.log('Bundled runtimes are only set up for Windows. Skipping.');
  process.exit(0);
}

fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(cache, { recursive: true });

for (const runtime of RUNTIMES) {
  const target = path.join(output, runtime.name);
  const stamp = `${target}.installed`;
  if (fs.existsSync(target) && fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8') === runtime.sha256) {
    console.log(`${runtime.name}: already in place`);
    continue;
  }
  const archive = path.join(cache, runtime.file);
  if (!fs.existsSync(archive) || sha256(archive) !== runtime.sha256) {
    console.log(`${runtime.name}: downloading`);
    await download(runtime.urls ?? [runtime.url], archive);
  }
  if (sha256(archive) !== runtime.sha256) {
    remove(archive);
    throw new Error(`${runtime.name}: the download does not match its pinned checksum.`);
  }
  console.log(`${runtime.name}: installing`);
  runtime.install(archive, target);
  fs.writeFileSync(stamp, runtime.sha256);
}
console.log('Runtimes ready.');
