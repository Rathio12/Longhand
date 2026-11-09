# Third-party software in the Longhand installer

The installer includes these language tools, each under its own license. Some are trimmed to reduce size, such as removing documentation and unused components, and their code is otherwise unchanged. Their files are in the matching folder under `resources/runtimes`.

| Tool | Version | License | Source code |
|---|---|---|---|
| Python | 3.14.0 | PSF License | https://www.python.org/downloads/source/ |
| Lua (LuaBinaries) | 5.4.2 | MIT | https://www.lua.org/ftp/ |
| w64devkit, with GCC, binutils, mingw-w64 and BusyBox | 2.11.0 | GPL and others, see the kit | https://github.com/skeeto/w64devkit/releases/tag/v2.11.0 (`source.tar`) |
| Eclipse Temurin OpenJDK, reduced with jlink | 21.0.13+9 | GPLv2 with Classpath Exception | https://github.com/adoptium/jdk21u |
| .NET SDK | 10.0.403 | MIT | https://github.com/dotnet/dotnet |
| Go | 1.27.3 | BSD 3-Clause | https://go.dev/dl/ |
| Rust, GNU toolchain | 1.99.1 | MIT and Apache 2.0, with a bundled GPL linker | https://static.rust-lang.org/dist/rustc-1.99.1-src.tar.xz |
| Kotlin compiler | 2.4.21 | Apache 2.0 | https://github.com/JetBrains/kotlin |
| Dart SDK | 3.13.7 | BSD 3-Clause | https://github.com/dart-lang/sdk |
| Ruby (RubyInstaller) | 4.0.9-1 | Ruby License and BSD 2-Clause | https://github.com/oneclick/rubyinstaller2 |
| PHP | 8.4.27 | PHP License | https://www.php.net/downloads |
| Perl (Strawberry Perl) | 5.42.3.1 | Artistic License or GPL | https://github.com/StrawberryPerl/Perl-Dist-Strawberry |
| R | 4.6.2 | GPL-2 or later | https://cran.r-project.org/src/base/R-4/ |
| Godot Engine | 4.7.2 | MIT | https://github.com/godotengine/godot |

The Electron runtime and the JavaScript libraries compiled into the app keep their own licenses, which can be read in their packages after running `npm install`.
