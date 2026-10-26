# stylescript :: possible approaches

a concept paper on what stylescript could be: the problems it solves, the parts it needs, and the ways the
syntax could go. the starting point is the scratch in CONCEPT.md:

```css
@type Custom = <Number> | <Percentage>

@var <Color> $bg = black
@var <Color> $fg = white

@fn darker ( $n : <Custom> = 0.5 ) {

}
```

the result is css, and only where a feature needs it a little js.

---

## 1. what css can not do today

| wanted | css today |
|---|---|
| a type of its own (`<number> \| <percentage>`), reused | `@property` takes a syntax string, per property. no aliases, no reuse, no records |
| a typed variable | custom properties are untyped unless each one is registered with `@property` |
| a value that only exists while writing | none: every `--x` lives at runtime, inherits, shows up in devtools, costs a lookup |
| objects, maps, lists | none: `--space-s`, `--space-m`, `--space-l` by hand |
| functions | `@function`: new, chromium only, runtime only |
| mixins | a proposal (`@mixin` / `@apply`), nowhere yet |
| consistent names | `background-color` but `color`, `inset-inline-start`, `--` everywhere, deep `var(--a, var(--b, …))` |

sass and less solved some of this fifteen years ago, untyped and before css had custom properties, `@property`,
`@function` and nesting. stylescript is the same idea for today's css: **typed, and aware of what is compile
time and what is runtime.**

---

## 2. the core split: compile time and runtime

every construct says which world it lives in. that is the one rule the language is built on:

| construct | lives | becomes |
|---|---|---|
| `@type` | compile time | nothing, or an `@property` syntax string where a runtime property uses it |
| `@var $x` | compile time | its value, inlined where used. `$x` is gone from the output |
| `@prop --x` | runtime | a custom property, registered with `@property` (syntax from its type, `inherits`, `initial-value`) |
| `@fn` | compile time when it can, runtime when it must | its result inlined, or a css `@function` |
| `@mixin` | compile time | its declarations where it is included |
| a plain rule | runtime | the rule |

```css
@type Amount = <number> | <percentage>

@var  <color>  $ink  = #111
@prop <Amount> --mix = 50%

.card { color: $ink; opacity: --mix; }
```

```css
@property --mix { syntax: '<number> | <percentage>'; inherits: true; initial-value: 50%; }

.card { color: #111; opacity: var(--mix); }
```

`--mix` without `var()` in the source: stylescript knows it is a property and writes the `var()`.

---

## 3. types

built from css's own value types, so they mean what css means:

```css
@type Amount  = <number> | <percentage>
@type Size    = 'small' | 'medium' | 'large'          /* keywords */
@type Space   = <length-percentage>
@type Spaces  = <Space>+                               /* one or more, as in css's value definitions */
@type Point   = { x: <length>, y: <length> }           /* a record */
@type Palette = { ink: <color>, paper: <color>, accent?: <color> }
```

- **where they are checked:** for `@var` and `@fn` arguments while compiling, with the file and line. for `@prop`
  in the browser too, because `@property` makes css drop a value of the wrong type.
- **records at runtime:** `@property` knows no records. a `@prop` of a record type becomes one property per
  key (`--point-x`, `--point-y`), `--point.x` in the source reads one of them.
- **the checker need not be written from scratch:** [css-tree](https://github.com/csstree/csstree) carries css's
  value definition syntax for every property and type and can match a value against `<color>` or `<length>`
  (its lexer). stylescript's types are compositions of those.

---

## 4. variables and objects

```css
@var $space = { s: 4px, m: 8px, l: 16px }
@var $sizes = [12px, 14px, 16px, 20px]

.card { padding: $space.m $space.l; }

@each $key, $value in $space {
  .gap-$key { gap: $value; }
}

@props --space = $space        /* the object as runtime properties: --space-s, --space-m, --space-l */
```

the same value can be compile time (`$space.m` becomes `8px`) and runtime (`--space-m`) where a theme or js has
to change it. one line decides, not a rewrite.

---

## 5. functions

```css
@fn darker ($color: <color>, $amount: <Amount> = 10%) -> <color> {
  return color-mix(in oklab, $color, black $amount);
}

.a { color: darker(#336699); }              /* static: computed while compiling */
.b { color: darker(--ink, --mix); }         /* runtime arguments: a css @function, or the expression inlined */
```

```css
.a { color: color-mix(in oklab, #336699, black 10%); }   /* or the resolved #2e5c8a */

@function --darker(--color <color>, --amount <number> | <percentage>: 10%) returns <color> {
  result: color-mix(in oklab, var(--color), black var(--amount));
}
.b { color: color-mix(in oklab, var(--ink), black var(--mix)); color: --darker(var(--ink), var(--mix)); }
```

one definition, three outputs: a value, an inlined expression (works everywhere), a css `@function` (where the
target has it, with the inlined form in front as fallback). this is the lowering gestalt needs for its own
`@function`s today.

---

## 6. mixins

```css
@mixin card ($pad: <Space> = $space.m) {
  padding: $pad;
  border-radius: 8px;
  &:hover { translate: 0 -1px; }
}

.note { @include card($space.l); }
```

compile time, as in sass. when css's own `@mixin` / `@apply` lands, stylescript can emit those instead, the
source stays.

---

## 7. names

CONCEPT.md is right about inconsistent property names and `--` everywhere. two layers, both optional:

- **aliases:** `@alias bg = background-color` per project or from a preset. `bg: $ink` in the source, the
  real name in the output. no runtime cost.
- **shorthands of groups:** what `@gestalt/shorthands` does (`typo: serif bold 3rem/1.1`), as compile time
  macros: the group's grammar in stylescript, the declarations in the output. gestalt's groups could be
  written as stylescript mixins with a parser.

and `--x` instead of `var(--x)` (section 2), `--point.x` for a record's key.

---

## 8. the syntax: four ways it could go

### a. a css superset (the scratch)

every addition is an at-rule (`@type`, `@var`, `@fn`, `@mixin`) or a `$` name. **any css file is a valid
stylescript file.** highlighting, formatters and the reader's habits mostly keep working, a file can move to
stylescript one rule at a time.

### b. an indented, quiet syntax

```
$ink: #111

.card
  color $ink
  h1
    font-size 2rem
```

no braces, no semicolons, colons optional (stylus, sass's indented syntax). answers the "`{}` everywhere" of
CONCEPT.md. pays with: not css any more, every tool needs a grammar, copying css in and out stops working.

### c. styles in js (vanilla-extract, panda)

```js
export const card = style({ color: vars.ink, padding: space.m });
```

types from typescript, objects and functions for free. but it is js that describes css, and CONCEPT.md's
starting point is css's own form.

### d. a css superset with script blocks

a), plus a block of js that runs while compiling, for what a small language should not grow into:

```css
@script {
  export const steps = Array.from({ length: 9 }, (_, index) => (index + 1) * 100);
}

@each $step in $steps {
  .weight-$step { font-weight: $step; }
}
```

the language stays small (types, vars, fns, mixins), anything computed goes to js. the same split as rat's
`<script comptime>`.

**the recommendation: a) as the base, d) for computing.** it is what the scratch already does, every css file
stays valid, and the escape hatch to js keeps the language from turning into a programming language of its own.
b) can come later as a second front end over the same tree: the syntax is a parser, the meaning is the rest.

---

## 9. the compiler

```
source ──tokenize──▶ tokens ──parse──▶ tree ──resolve──▶ ──evaluate──▶ ──lower──▶ ──print──▶ css
                    (css syntax 3)              types,      @var, @fn      @fn → @function
                                                names       with static    or inline, records
                                                            arguments      → properties
```

- **tokenizing** as css syntax level 3 does, so css comes through unchanged.
- **resolve:** `@type`, `@var`, `@prop`, aliases, imports (`@use './tokens.ss'`).
- **evaluate:** compile time values, `@each`, `@fn` calls with static arguments, `@script` blocks.
- **lower:** per target (`chrome 140`, `baseline 2025` …): `@function` or inlined, nesting or flattened.
- **print**, with a source map back to the `.ss` file.

the packages that are there stay: `@stylescript/compiler`, `@stylescript/web` (the element, a service worker,
the middleware), `@stylescript/cli`. a postcss plugin (`@stylescript/postcss`) would put it into every build
tool, and rat's `<style lang="ss">` into rat.

---

## 10. and js

"a little js" only where css itself can not do it, and only when it is used:

- a `@prop` whose value comes from outside (a theme picked by the user): a typed setter, `theme.ink = '#222'`,
  checked against the same type.
- nothing else by default. a stylesheet of stylescript is a css file.

---

## 11. open questions

- `$` or no sigil for compile time names. `$` is clear and was in the demos.
- the type names: css's own (`<color>`) and capitalized aliases (`<Amount>`), or one form.
- how far `@fn` evaluates: color math needs color spaces (css color 4 / 5) in the compiler.
- `@use` and modules: one namespace per file, or global like css.
- the place of gestalt: written in stylescript one day, or gestalt stays css and stylescript a way to write
  things like it.
