# About PHPjed

![PHPjed](https://repository-images.githubusercontent.com/402211811/0d69f853-7827-4269-88ac-657ff48e42a8)

PHPjed (*PHP javascripted*) brings PHP on your browser. It's a collection of about 275 PHP functions ported to Javascript and ready to be used on a website as a small client-side library (27kB minified and gzipped). A few examples of PHP functions ported are `array_multisort`, `date`, `htmlentities`, `isset`, `preg_replace`, `setcookie`, `str_replace`, `trim`, etc.

# Installation

Include the minified file on your website. There are two PHPjed distributions:

1. The light distribution has 273 functions (92kB minified, 27kB gzipped\*). The following HTML tag includes the latest version:

		<script src="https://cdn.jsdelivr.net/gh/phpjed/phpjed/dist/phpjed.min.js"></script>

	It's possible to include a specific version, for example 1.0:

		<script src="https://cdn.jsdelivr.net/gh/phpjed/phpjed@1.0/dist/phpjed.min.js"></script>

2. The complete distribution has 287 functions (142kB minified, 43kB gzipped\*). The following HTML tag includes the latest version:

		<script src="https://cdn.jsdelivr.net/gh/phpjed/phpjed/dist/phpjed-all.min.js"></script>

	It's possible to include a specific version, for example 1.0:

		<script src="https://cdn.jsdelivr.net/gh/phpjed/phpjed@1.0/dist/phpjed-all.min.js"></script>

	This distribution contains the functions from the light distribution and also includes the following functions:
	
	- `addcslashes`
	- `crc32`
	- `date_parse`
	- `get_html_translation_table`
	- `metaphone`
	- `pack`
	- `sscanf`
	- `strptime`
	- `strtotime`
	- `unserialize`
	- `var_dump`
	- `var_export`
	- `xdiff_string_diff`
	- `xdiff_string_patch`

All versions available are in the folder `dist`. The latest version number can be retrieved programmatically from the URL <https://raw.githubusercontent.com/phpjed/phpjed/main/version.txt>. Note that unminified and beautified versions of PHPjed are present in the folder `dist/unminified`.

(\*): *When servers are configured to send data compressed with the deflate algorithm, this is the actual size of the file downloaded by users.*

# Usage

After including PHPjed on your website, functions are invoked using the *namespace* `phpjed`. Examples:

```javascript
var subject = "Hello world.";
var search = ["Hello", "world"];
var replace = ["Hi", "everybody"];
var hi_everybody = phpjed.str_replace(search, replace, subject);
```

# PHP functions ported to Javascript

Each function listed below is identified as follows:

- (LIGHT): included in the light (default) distribution of PHPjed
- (ALL): included in the complete distribution that contains all functions

A link to the corresponding function on the PHP manual is added.

A
----------

- (LIGHT) [abs](https://www.php.net/manual/function.abs.php)
- (LIGHT) [acos](https://www.php.net/manual/function.acos.php)
- (LIGHT) [acosh](https://www.php.net/manual/function.acosh.php)
- (ALL)   [addcslashes](https://www.php.net/manual/function.addcslashes.php)
- (LIGHT) [addslashes](https://www.php.net/manual/function.addslashes.php)
- (LIGHT) [array_change_key_case](https://www.php.net/manual/function.array-change-key-case.php)
- (LIGHT) [array_chunk](https://www.php.net/manual/function.array-chunk.php)
- (LIGHT) [array_column](https://www.php.net/manual/function.array-column.php)
- (LIGHT) [array_combine](https://www.php.net/manual/function.array-combine.php)
- (LIGHT) [array_count_values](https://www.php.net/manual/function.array-count-values.php)
- (LIGHT) [array_diff](https://www.php.net/manual/function.array-diff.php)
- (LIGHT) [array_diff_assoc](https://www.php.net/manual/function.array-diff-assoc.php)
- (LIGHT) [array_diff_key](https://www.php.net/manual/function.array-diff-key.php)
- (LIGHT) [array_diff_uassoc](https://www.php.net/manual/function.array-diff-uassoc.php)
- (LIGHT) [array_diff_ukey](https://www.php.net/manual/function.array-diff-ukey.php)
- (LIGHT) [array_fill](https://www.php.net/manual/function.array-fill.php)
- (LIGHT) [array_fill_keys](https://www.php.net/manual/function.array-fill-keys.php)
- (LIGHT) [array_filter](https://www.php.net/manual/function.array-filter.php)
- (LIGHT) [array_flip](https://www.php.net/manual/function.array-flip.php)
- (LIGHT) [array_intersect](https://www.php.net/manual/function.array-intersect.php)
- (LIGHT) [array_intersect_assoc](https://www.php.net/manual/function.array-intersect-assoc.php)
- (LIGHT) [array_intersect_key](https://www.php.net/manual/function.array-intersect-key.php)
- (LIGHT) [array_intersect_uassoc](https://www.php.net/manual/function.array-intersect-uassoc.php)
- (LIGHT) [array_intersect_ukey](https://www.php.net/manual/function.array-intersect-ukey.php)
- (LIGHT) [array_keys](https://www.php.net/manual/function.array-keys.php)
- (LIGHT) [array_map](https://www.php.net/manual/function.array-map.php)
- (LIGHT) [array_merge](https://www.php.net/manual/function.array-merge.php)
- (LIGHT) [array_merge_recursive](https://www.php.net/manual/function.array-merge-recursive.php)
- (LIGHT) [array_multisort](https://www.php.net/manual/function.array-multisort.php)
- (LIGHT) [array_pad](https://www.php.net/manual/function.array-pad.php)
- (LIGHT) [array_pop](https://www.php.net/manual/function.array-pop.php)
- (LIGHT) [array_product](https://www.php.net/manual/function.array-product.php)
- (LIGHT) [array_push](https://www.php.net/manual/function.array-push.php)
- (LIGHT) [array_rand](https://www.php.net/manual/function.array-rand.php)
- (LIGHT) [array_reduce](https://www.php.net/manual/function.array-reduce.php)
- (LIGHT) [array_replace](https://www.php.net/manual/function.array-replace.php)
- (LIGHT) [array_replace_recursive](https://www.php.net/manual/function.array-replace-recursive.php)
- (LIGHT) [array_reverse](https://www.php.net/manual/function.array-reverse.php)
- (LIGHT) [array_search](https://www.php.net/manual/function.array-search.php)
- (LIGHT) [array_shift](https://www.php.net/manual/function.array-shift.php)
- (LIGHT) [array_slice](https://www.php.net/manual/function.array-slice.php)
- (LIGHT) [array_splice](https://www.php.net/manual/function.array-splice.php)
- (LIGHT) [array_sum](https://www.php.net/manual/function.array-sum.php)
- (LIGHT) [array_udiff](https://www.php.net/manual/function.array-udiff.php)
- (LIGHT) [array_udiff_assoc](https://www.php.net/manual/function.array-udiff-assoc.php)
- (LIGHT) [array_udiff_uassoc](https://www.php.net/manual/function.array-udiff-uassoc.php)
- (LIGHT) [array_uintersect](https://www.php.net/manual/function.array-uintersect.php)
- (LIGHT) [array_uintersect_uassoc](https://www.php.net/manual/function.array-uintersect-uassoc.php)
- (LIGHT) [array_unique](https://www.php.net/manual/function.array-unique.php)
- (LIGHT) [array_unshift](https://www.php.net/manual/function.array-unshift.php)
- (LIGHT) [array_values](https://www.php.net/manual/function.array-values.php)
- (LIGHT) [array_walk](https://www.php.net/manual/function.array-walk.php)
- (LIGHT) [array_walk_recursive](https://www.php.net/manual/function.array-walk-recursive.php)
- (LIGHT) [asin](https://www.php.net/manual/function.asin.php)
- (LIGHT) [asinh](https://www.php.net/manual/function.asinh.php)
- (LIGHT) [assert_options](https://www.php.net/manual/function.assert-options.php)
- (LIGHT) [atan](https://www.php.net/manual/function.atan.php)
- (LIGHT) [atan2](https://www.php.net/manual/function.atan2.php)
- (LIGHT) [atanh](https://www.php.net/manual/function.atanh.php)

B
----------

- (LIGHT) [base64_decode](https://www.php.net/manual/function.base64-decode.php)
- (LIGHT) [base64_encode](https://www.php.net/manual/function.base64-encode.php)
- (LIGHT) [basename](https://www.php.net/manual/function.basename.php)
- (LIGHT) [base_convert](https://www.php.net/manual/function.base-convert.php)
- (LIGHT) [bin2hex](https://www.php.net/manual/function.bin2hex.php)
- (LIGHT) [bindec](https://www.php.net/manual/function.bindec.php)
- (LIGHT) [boolval](https://www.php.net/manual/function.boolval.php)

C
----------

- (LIGHT) [ceil](https://www.php.net/manual/function.ceil.php)
- (LIGHT) [checkdate](https://www.php.net/manual/function.checkdate.php)
- (LIGHT) [chop](https://www.php.net/manual/function.chop.php)
- (LIGHT) [chr](https://www.php.net/manual/function.chr.php)
- (LIGHT) [chunk_split](https://www.php.net/manual/function.chunk-split.php)
- (LIGHT) [convert_uuencode](https://www.php.net/manual/function.convert-uuencode.php)
- (LIGHT) [cos](https://www.php.net/manual/function.cos.php)
- (LIGHT) [cosh](https://www.php.net/manual/function.cosh.php)
- (LIGHT) [count](https://www.php.net/manual/function.count.php)
- (LIGHT) [count_chars](https://www.php.net/manual/function.count-chars.php)
- (ALL)   [crc32](https://www.php.net/manual/function.crc32.php)
- (LIGHT) [ctype_alnum](https://www.php.net/manual/function.ctype-alnum.php)
- (LIGHT) [ctype_alpha](https://www.php.net/manual/function.ctype-alpha.php)
- (LIGHT) [ctype_cntrl](https://www.php.net/manual/function.ctype-cntrl.php)
- (LIGHT) [ctype_digit](https://www.php.net/manual/function.ctype-digit.php)
- (LIGHT) [ctype_graph](https://www.php.net/manual/function.ctype-graph.php)
- (LIGHT) [ctype_lower](https://www.php.net/manual/function.ctype-lower.php)
- (LIGHT) [ctype_print](https://www.php.net/manual/function.ctype-print.php)
- (LIGHT) [ctype_punct](https://www.php.net/manual/function.ctype-punct.php)
- (LIGHT) [ctype_space](https://www.php.net/manual/function.ctype-space.php)
- (LIGHT) [ctype_upper](https://www.php.net/manual/function.ctype-upper.php)
- (LIGHT) [ctype_xdigit](https://www.php.net/manual/function.ctype-xdigit.php)
- (LIGHT) [current](https://www.php.net/manual/function.current.php)

D
----------

- (LIGHT) [date](https://www.php.net/manual/function.date.php)
- (ALL)   [date_parse](https://www.php.net/manual/function.date-parse.php)
- (LIGHT) [decbin](https://www.php.net/manual/function.decbin.php)
- (LIGHT) [dechex](https://www.php.net/manual/function.dechex.php)
- (LIGHT) [decoct](https://www.php.net/manual/function.decoct.php)
- (LIGHT) [deg2rad](https://www.php.net/manual/function.deg2rad.php)
- (LIGHT) [dirname](https://www.php.net/manual/function.dirname.php)
- (LIGHT) [doubleval](https://www.php.net/manual/function.doubleval.php)

E
----------

- (LIGHT) [echo](https://www.php.net/manual/function.echo.php)
- (LIGHT) [empty](https://www.php.net/manual/function.empty.php)
- (LIGHT) [end](https://www.php.net/manual/function.end.php)
- (LIGHT) [escapeshellarg](https://www.php.net/manual/function.escapeshellarg.php)
- (LIGHT) [exp](https://www.php.net/manual/function.exp.php)
- (LIGHT) [explode](https://www.php.net/manual/function.explode.php)
- (LIGHT) [expm1](https://www.php.net/manual/function.expm1.php)

F
----------

- (LIGHT) [floatval](https://www.php.net/manual/function.floatval.php)
- (LIGHT) [floor](https://www.php.net/manual/function.floor.php)
- (LIGHT) [fmod](https://www.php.net/manual/function.fmod.php)
- (LIGHT) [function_exists](https://www.php.net/manual/function.function-exists.php)

G
----------

- (LIGHT) [getdate](https://www.php.net/manual/function.getdate.php)
- (LIGHT) [getenv](https://www.php.net/manual/function.getenv.php)
- (LIGHT) [getrandmax](https://www.php.net/manual/function.getrandmax.php)
- (LIGHT) [gettimeofday](https://www.php.net/manual/function.gettimeofday.php)
- (LIGHT) [gettype](https://www.php.net/manual/function.gettype.php)
- (LIGHT) [get_defined_functions](https://www.php.net/manual/function.get-defined-functions.php)
- (ALL)   [get_html_translation_table](https://www.php.net/manual/function.get-html-translation-table.php)
- (LIGHT) [gmdate](https://www.php.net/manual/function.gmdate.php)
- (LIGHT) [gmmktime](https://www.php.net/manual/function.gmmktime.php)
- (LIGHT) [gmstrftime](https://www.php.net/manual/function.gmstrftime.php)

H
----------

- (LIGHT) [hex2bin](https://www.php.net/manual/function.hex2bin.php)
- (LIGHT) [hexdec](https://www.php.net/manual/function.hexdec.php)
- (LIGHT) [htmlentities](https://www.php.net/manual/function.htmlentities.php)
- (LIGHT) [htmlspecialchars](https://www.php.net/manual/function.htmlspecialchars.php)
- (LIGHT) [htmlspecialchars_decode](https://www.php.net/manual/function.htmlspecialchars-decode.php)
- (LIGHT) [html_entity_decode](https://www.php.net/manual/function.html-entity-decode.php)
- (LIGHT) [http_build_query](https://www.php.net/manual/function.http-build-query.php)
- (LIGHT) [hypot](https://www.php.net/manual/function.hypot.php)

I
----------

- (LIGHT) [idate](https://www.php.net/manual/function.idate.php)
- (LIGHT) [implode](https://www.php.net/manual/function.implode.php)
- (LIGHT) [inet_ntop](https://www.php.net/manual/function.inet-ntop.php)
- (LIGHT) [inet_pton](https://www.php.net/manual/function.inet-pton.php)
- (LIGHT) [ini_get](https://www.php.net/manual/function.ini-get.php)
- (LIGHT) [ini_set](https://www.php.net/manual/function.ini-set.php)
- (LIGHT) [intval](https://www.php.net/manual/function.intval.php)
- (LIGHT) [in_array](https://www.php.net/manual/function.in-array.php)
- (LIGHT) [ip2long](https://www.php.net/manual/function.ip2long.php)
- (LIGHT) [isset](https://www.php.net/manual/function.isset.php)
- (LIGHT) [is_array](https://www.php.net/manual/function.is-array.php)
- (LIGHT) [is_bool](https://www.php.net/manual/function.is-bool.php)
- (LIGHT) [is_double](https://www.php.net/manual/function.is-double.php)
- (LIGHT) [is_finite](https://www.php.net/manual/function.is-finite.php)
- (LIGHT) [is_float](https://www.php.net/manual/function.is-float.php)
- (LIGHT) [is_infinite](https://www.php.net/manual/function.is-infinite.php)
- (LIGHT) [is_int](https://www.php.net/manual/function.is-int.php)
- (LIGHT) [is_integer](https://www.php.net/manual/function.is-integer.php)
- (LIGHT) [is_long](https://www.php.net/manual/function.is-long.php)
- (LIGHT) [is_nan](https://www.php.net/manual/function.is-nan.php)
- (LIGHT) [is_null](https://www.php.net/manual/function.is-null.php)
- (LIGHT) [is_numeric](https://www.php.net/manual/function.is-numeric.php)
- (LIGHT) [is_object](https://www.php.net/manual/function.is-object.php)
- (LIGHT) [is_scalar](https://www.php.net/manual/function.is-scalar.php)
- (LIGHT) [is_string](https://www.php.net/manual/function.is-string.php)

J
----------

- (LIGHT) [join](https://www.php.net/manual/function.join.php)
- (LIGHT) [json_encode](https://www.php.net/manual/function.json-encode.php)
- (LIGHT) [json_last_error](https://www.php.net/manual/function.json-last-error.php)

K
----------

- (LIGHT) [key](https://www.php.net/manual/function.key.php)
- (LIGHT) [krsort](https://www.php.net/manual/function.krsort.php)

L
----------

- (LIGHT) [lcfirst](https://www.php.net/manual/function.lcfirst.php)
- (LIGHT) [lcg_value](https://www.php.net/manual/function.lcg-value.php)
- (LIGHT) [levenshtein](https://www.php.net/manual/function.levenshtein.php)
- (LIGHT) [localeconv](https://www.php.net/manual/function.localeconv.php)
- (LIGHT) [log](https://www.php.net/manual/function.log.php)
- (LIGHT) [log1p](https://www.php.net/manual/function.log1p.php)
- (LIGHT) [log10](https://www.php.net/manual/function.log10.php)
- (LIGHT) [long2ip](https://www.php.net/manual/function.long2ip.php)
- (LIGHT) [ltrim](https://www.php.net/manual/function.ltrim.php)

M
----------

- (LIGHT) [max](https://www.php.net/manual/function.max.php)
- (ALL)   [metaphone](https://www.php.net/manual/function.metaphone.php)
- (LIGHT) [microtime](https://www.php.net/manual/function.microtime.php)
- (LIGHT) [min](https://www.php.net/manual/function.min.php)
- (LIGHT) [mktime](https://www.php.net/manual/function.mktime.php)
- (LIGHT) [mt_getrandmax](https://www.php.net/manual/function.mt-getrandmax.php)
- (LIGHT) [mt_rand](https://www.php.net/manual/function.mt-rand.php)

N
----------

- (LIGHT) [natcasesort](https://www.php.net/manual/function.natcasesort.php)
- (LIGHT) [natsort](https://www.php.net/manual/function.natsort.php)
- (LIGHT) [next](https://www.php.net/manual/function.next.php)
- (LIGHT) [nl2br](https://www.php.net/manual/function.nl2br.php)
- (LIGHT) [nl_langinfo](https://www.php.net/manual/function.nl-langinfo.php)
- (LIGHT) [number_format](https://www.php.net/manual/function.number-format.php)

O
----------

- (LIGHT) [octdec](https://www.php.net/manual/function.octdec.php)
- (LIGHT) [ord](https://www.php.net/manual/function.ord.php)

P
----------

- (ALL)   [pack](https://www.php.net/manual/function.pack.php)
- (LIGHT) [parse_str](https://www.php.net/manual/function.parse-str.php)
- (LIGHT) [parse_url](https://www.php.net/manual/function.parse-url.php)
- (LIGHT) [pathinfo](https://www.php.net/manual/function.pathinfo.php)
- (LIGHT) [pi](https://www.php.net/manual/function.pi.php)
- (LIGHT) [pos](https://www.php.net/manual/function.pos.php)
- (LIGHT) [pow](https://www.php.net/manual/function.pow.php)
- (LIGHT) [preg_match](https://www.php.net/manual/function.preg-match.php)
- (LIGHT) [preg_quote](https://www.php.net/manual/function.preg-quote.php)
- (LIGHT) [preg_replace](https://www.php.net/manual/function.preg-replace.php)
- (LIGHT) [prev](https://www.php.net/manual/function.prev.php)
- (LIGHT) [printf](https://www.php.net/manual/function.printf.php)
- (LIGHT) [print_r](https://www.php.net/manual/function.print-r.php)

Q
----------

- (LIGHT) [quoted_printable_decode](https://www.php.net/manual/function.quoted-printable-decode.php)
- (LIGHT) [quoted_printable_encode](https://www.php.net/manual/function.quoted-printable-encode.php)
- (LIGHT) [quotemeta](https://www.php.net/manual/function.quotemeta.php)

R
----------

- (LIGHT) [rad2deg](https://www.php.net/manual/function.rad2deg.php)
- (LIGHT) [rand](https://www.php.net/manual/function.rand.php)
- (LIGHT) [range](https://www.php.net/manual/function.range.php)
- (LIGHT) [rawurldecode](https://www.php.net/manual/function.rawurldecode.php)
- (LIGHT) [rawurlencode](https://www.php.net/manual/function.rawurlencode.php)
- (LIGHT) [reset](https://www.php.net/manual/function.reset.php)
- (LIGHT) [round](https://www.php.net/manual/function.round.php)
- (LIGHT) [rtrim](https://www.php.net/manual/function.rtrim.php)

S
----------

- (LIGHT) [serialize](https://www.php.net/manual/function.serialize.php)
- (LIGHT) [setcookie](https://www.php.net/manual/function.setcookie.php)
- (LIGHT) [setlocale](https://www.php.net/manual/function.setlocale.php)
- (LIGHT) [setrawcookie](https://www.php.net/manual/function.setrawcookie.php)
- (LIGHT) [set_time_limit](https://www.php.net/manual/function.set-time-limit.php)
- (LIGHT) [shuffle](https://www.php.net/manual/function.shuffle.php)
- (LIGHT) [similar_text](https://www.php.net/manual/function.similar-text.php)
- (LIGHT) [sin](https://www.php.net/manual/function.sin.php)
- (LIGHT) [sinh](https://www.php.net/manual/function.sinh.php)
- (LIGHT) [sizeof](https://www.php.net/manual/function.sizeof.php)
- (LIGHT) [soundex](https://www.php.net/manual/function.soundex.php)
- (LIGHT) [sprintf](https://www.php.net/manual/function.sprintf.php)
- (LIGHT) [sqrt](https://www.php.net/manual/function.sqrt.php)
- (ALL)   [sscanf](https://www.php.net/manual/function.sscanf.php)
- (LIGHT) [strcasecmp](https://www.php.net/manual/function.strcasecmp.php)
- (LIGHT) [strchr](https://www.php.net/manual/function.strchr.php)
- (LIGHT) [strcmp](https://www.php.net/manual/function.strcmp.php)
- (LIGHT) [strcoll](https://www.php.net/manual/function.strcoll.php)
- (LIGHT) [strcspn](https://www.php.net/manual/function.strcspn.php)
- (LIGHT) [strftime](https://www.php.net/manual/function.strftime.php)
- (LIGHT) [stripos](https://www.php.net/manual/function.stripos.php)
- (LIGHT) [stripslashes](https://www.php.net/manual/function.stripslashes.php)
- (LIGHT) [strip_tags](https://www.php.net/manual/function.strip-tags.php)
- (LIGHT) [stristr](https://www.php.net/manual/function.stristr.php)
- (LIGHT) [strlen](https://www.php.net/manual/function.strlen.php)
- (LIGHT) [strnatcasecmp](https://www.php.net/manual/function.strnatcasecmp.php)
- (LIGHT) [strnatcmp](https://www.php.net/manual/function.strnatcmp.php)
- (LIGHT) [strncasecmp](https://www.php.net/manual/function.strncasecmp.php)
- (LIGHT) [strncmp](https://www.php.net/manual/function.strncmp.php)
- (LIGHT) [strpbrk](https://www.php.net/manual/function.strpbrk.php)
- (LIGHT) [strpos](https://www.php.net/manual/function.strpos.php)
- (ALL)   [strptime](https://www.php.net/manual/function.strptime.php)
- (LIGHT) [strrchr](https://www.php.net/manual/function.strrchr.php)
- (LIGHT) [strrev](https://www.php.net/manual/function.strrev.php)
- (LIGHT) [strripos](https://www.php.net/manual/function.strripos.php)
- (LIGHT) [strrpos](https://www.php.net/manual/function.strrpos.php)
- (LIGHT) [strspn](https://www.php.net/manual/function.strspn.php)
- (LIGHT) [strstr](https://www.php.net/manual/function.strstr.php)
- (LIGHT) [strtok](https://www.php.net/manual/function.strtok.php)
- (LIGHT) [strtolower](https://www.php.net/manual/function.strtolower.php)
- (ALL)   [strtotime](https://www.php.net/manual/function.strtotime.php)
- (LIGHT) [strtoupper](https://www.php.net/manual/function.strtoupper.php)
- (LIGHT) [strtr](https://www.php.net/manual/function.strtr.php)
- (LIGHT) [strval](https://www.php.net/manual/function.strval.php)
- (LIGHT) [str_getcsv](https://www.php.net/manual/function.str-getcsv.php)
- (LIGHT) [str_ireplace](https://www.php.net/manual/function.str-ireplace.php)
- (LIGHT) [str_pad](https://www.php.net/manual/function.str-pad.php)
- (LIGHT) [str_repeat](https://www.php.net/manual/function.str-repeat.php)
- (LIGHT) [str_replace](https://www.php.net/manual/function.str-replace.php)
- (LIGHT) [str_rot13](https://www.php.net/manual/function.str-rot13.php)
- (LIGHT) [str_shuffle](https://www.php.net/manual/function.str-shuffle.php)
- (LIGHT) [str_split](https://www.php.net/manual/function.str-split.php)
- (LIGHT) [str_word_count](https://www.php.net/manual/function.str-word-count.php)
- (LIGHT) [substr](https://www.php.net/manual/function.substr.php)
- (LIGHT) [substr_compare](https://www.php.net/manual/function.substr-compare.php)
- (LIGHT) [substr_count](https://www.php.net/manual/function.substr-count.php)
- (LIGHT) [substr_replace](https://www.php.net/manual/function.substr-replace.php)

T
----------

- (LIGHT) [tan](https://www.php.net/manual/function.tan.php)
- (LIGHT) [tanh](https://www.php.net/manual/function.tanh.php)
- (LIGHT) [time](https://www.php.net/manual/function.time.php)
- (LIGHT) [trim](https://www.php.net/manual/function.trim.php)

U
----------

- (LIGHT) [uasort](https://www.php.net/manual/function.uasort.php)
- (LIGHT) [ucfirst](https://www.php.net/manual/function.ucfirst.php)
- (LIGHT) [ucwords](https://www.php.net/manual/function.ucwords.php)
- (LIGHT) [uksort](https://www.php.net/manual/function.uksort.php)
- (LIGHT) [uniqid](https://www.php.net/manual/function.uniqid.php)
- (ALL)   [unserialize](https://www.php.net/manual/function.unserialize.php)
- (LIGHT) [urldecode](https://www.php.net/manual/function.urldecode.php)
- (LIGHT) [urlencode](https://www.php.net/manual/function.urlencode.php)
- (LIGHT) [usort](https://www.php.net/manual/function.usort.php)
- (LIGHT) [utf8_decode](https://www.php.net/manual/function.utf8-decode.php)
- (LIGHT) [utf8_encode](https://www.php.net/manual/function.utf8-encode.php)

V
----------

- (ALL)   [var_dump](https://www.php.net/manual/function.var-dump.php)
- (ALL)   [var_export](https://www.php.net/manual/function.var-export.php)
- (LIGHT) [version_compare](https://www.php.net/manual/function.version-compare.php)
- (LIGHT) [vprintf](https://www.php.net/manual/function.vprintf.php)
- (LIGHT) [vsprintf](https://www.php.net/manual/function.vsprintf.php)

W
----------

- (LIGHT) [wordwrap](https://www.php.net/manual/function.wordwrap.php)

X
----------

- (ALL)   [xdiff_string_diff](https://www.php.net/manual/function.xdiff-string-diff.php)
- (ALL)   [xdiff_string_patch](https://www.php.net/manual/function.xdiff-string-patch.php)

`_`
----------

- (LIGHT) `_php_cast_float`: helper function
- (LIGHT) `_php_cast_int`: helper function
- (LIGHT) `_php_cast_string`: helper function

# Technicals

PHPjed is based on [Locutus](https://github.com/locutusjs/locutus) (formerly *php.js*). Locutus is packaged for Node.js and distributed through npm. It requires a few Node.js modules and is not suitable to use as a client-side library.

PHPjed has a custom builder (`phpjed-builder.sh`, developed and tested on GNU/Linux and Bash 5) to achieve the following points:

- merge all required files from the Locutus npm package and get all code in a single file
- convert the "module exports" and "require" instructions to have a file usable in browsers
- remove functions dependant on Node.js modules (these functions are server-side only)
- remove deprecated and undocumented PHP functions as of PHP 8
- for improved security, remove functions that make use of `eval()`
- rename camel case functions
- put larger functions in a separate distribution
- add a namespace (`phpjed` by default) to prevent naming collisions
- minify the generated Javascript files

Help about the PHPjed builder can be invoked with `./phpjed-builder.sh -h`. PHPjed is distributed with prebuilt Javascript files in the folder `dist`, but one can build PHPjed themselves, for example to have a custom namespace.

After running the builder, generated files are saved in a newly created subfolder in `data/custom-builds`. Here's an example for the light (default) distribution:

- **Folder:** `/tmp/phpjed/data/custom-builds/20210901-143916-53`
- **Namespace:** `phpjed`; example: `phpjed.is_int(5)`
- **Distribution:** light (default)

FILE NAME        | SIZE (in KiB) | SIZE REDUCTION
---------------- | ------------- | --------------
phpjed.js        | 361.31        | -
phpjed.min.js    | 92.35         | 74.44%
phpjed.min.js.gz | 26.90         | 92.56%

Here's an example for the complete distribution including all functions:

- **Folder:** `/tmp/phpjed/data/custom-builds/20210901-144109-39`
- **Namespace:** `phpjed`; example: `phpjed.is_int(5)`
- **Distribution:** all

FILE NAME            | SIZE (in KiB) | SIZE REDUCTION
-------------------- | ------------- | --------------
phpjed-all.js        | 487.94        | -
phpjed-all.min.js    | 142.27        | 70.84%
phpjed-all.min.js.gz | 43.26         | 91.14%

# License

PHPjed (the builder and Javascript files generated) is released under the MIT License. See the file `LICENSE.md`.
