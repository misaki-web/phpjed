#!/bin/bash

# PHPjed is a collection of PHP functions ported to Javascript and ready to be
# used as a client-side library.
# 
# The current Bash script is the PHPjed builder to generate Javascript files.
# 
# For help about the builder, run `./phpjed-builder.sh -h`.
# 
# Fore more details about PHPjed, see the file `README.md`.
# 
# Copyright (c) 2021 Misaki F. (https://github.com/phpjed)
# See the file `LICENSE.md`.

################################################################################
# CONSTANTS
################################################################################

SCRIPT_NAME=$(basename -- "$(realpath "$0")")
declare -r SCRIPT_NAME

declare -A FOLDERS
FOLDERS[root]=$(dirname -- "$(realpath "$0")")
FOLDERS[data]="${FOLDERS[root]}/data"
FOLDERS[custom_builds]="${FOLDERS[data]}/custom-builds"
FOLDERS[src]="${FOLDERS[data]}/src"
FOLDERS[tmp]="${FOLDERS[data]}/tmp"
declare -r FOLDERS

VERSION_FILE="${FOLDERS[root]}/version.txt"
declare -r VERSION_FILE

DEFAULT_NAMESPACE="phpjed"
declare -r DEFAULT_NAMESPACE

# Deprecated functions from PHP 5 to PHP 8. See:
# 
# - https://web.archive.org/web/20201218031320/https://www.php.net/manual/en/migration5.incompatible.php
# - https://web.archive.org/web/20201202012741/https://www.php.net/manual/en/migration51.oop.php
# - https://web.archive.org/web/20201127072959/https://www.php.net/manual/en/migration52.incompatible.php
# - https://web.archive.org/web/20210104060606/https://www.php.net/manual/en/migration53.deprecated.php
# - https://web.archive.org/web/20201127072320/https://www.php.net/manual/en/migration54.deprecated.php
# - https://web.archive.org/web/20201127072008/https://www.php.net/manual/en/migration55.deprecated.php
# - https://www.php.net/manual/en/migration56.deprecated.php
# - https://www.php.net/manual/en/migration70.deprecated.php
# - https://www.php.net/manual/en/migration71.deprecated.php
# - https://www.php.net/manual/en/migration72.deprecated.php
# - https://www.php.net/manual/en/migration73.deprecated.php
# - https://www.php.net/manual/en/migration74.deprecated.php
# - https://www.php.net/manual/en/migration80.deprecated.php

DEPRECATED_FUNCS=(
	'array_key_exists' 'call_user_method' 'call_user_method_array' 'convert_cyr_string'
	'create_function' 'datefmt_set_timezone_id' 'define_syslog_variables' 'dl' 'each'
	'enchant_broker_free' 'enchant_broker_free_dict' 'enchant_broker_get_dict_path'
	'enchant_broker_set_dict_path' 'enchant_dict_add_to_personal' 'enchant_dict_is_in_session'
	'ereg' 'eregi' 'eregi_replace' 'ereg_replace' 'ezmlm_hash' 'fgetss' 'get_magic_quotes_gpc'
	'get_magic_quotes_runtime' 'gmp_random' 'hebrevc' 'image2wbmp' 'is_real' 'jpeg2wbmp'
	'ldap_control_paged_result' 'ldap_control_paged_result_response' 'ldap_sort'
	'libxml_disable_entity_loader' 'magic_quotes_runtime' 'mbereg' 'mberegi' 'mberegi_replace'
	'mbereg_match' 'mbereg_replace' 'mbereg_search' 'mbereg_search_getpos' 'mbereg_search_getregs'
	'mbereg_search_init' 'mbereg_search_pos' 'mbereg_search_regs' 'mbereg_search_setpos'
	'mbregex_encoding' 'mbsplit' 'mcrypt_cbc' 'mcrypt_cfb' 'mcrypt_ecb' 'mcrypt_generic_end'
	'mcrypt_ofb' 'money_format' 'mysql_db_query' 'mysql_escape_string' 'mysql_list_dbs'
	'pg_clientencoding' 'pg_cmdtuples' 'pg_errormessage' 'pg_fieldisnull' 'pg_fieldname'
	'pg_fieldnum' 'pg_fieldprtlen' 'pg_fieldsize' 'pg_fieldtype' 'pg_freeresult' 'pg_getlastoid'
	'pg_loclose' 'pg_locreate' 'pg_loexport' 'pg_loimport' 'pg_loopen' 'pg_loread' 'pg_loreadall'
	'pg_lounlink' 'pg_lowrite' 'pg_numfields' 'pg_numrows' 'pg_result' 'pg_setclientencoding'
	'png2wbmp' 'read_exif_data' 'restore_include_path' 'session_is_registered' 'session_register'
	'session_unregister' 'set_magic_quotes_runtime' 'set_socket_blocking' 'split' 'spliti'
	'sql_regcase'
)
# shellcheck disable=SC2034
declare -r DEPRECATED_FUNCS

# Locutus functions with a valid entry on the online PHP manual (ex.: <https://www.php.net/manual/function.isset.php>)
VALID_FUNCS=(
	'abs' 'acos' 'acosh' 'addcslashes' 'addslashes' 'array_change_key_case' 'array_chunk' 'array_column'
	'array_combine' 'array_count_values' 'array_diff' 'array_diff_assoc' 'array_diff_key' 'array_diff_uassoc'
	'array_diff_ukey' 'array_fill' 'array_fill_keys' 'array_filter' 'array_flip' 'array_intersect'
	'array_intersect_assoc' 'array_intersect_key' 'array_intersect_uassoc' 'array_intersect_ukey' 'array_keys'
	'array_map' 'array_merge' 'array_merge_recursive' 'array_multisort' 'array_pad' 'array_pop' 'array_product'
	'array_push' 'array_rand' 'array_reduce' 'array_replace' 'array_replace_recursive' 'array_reverse'
	'array_search' 'array_shift' 'array_slice' 'array_splice' 'array_sum' 'array_udiff' 'array_udiff_assoc'
	'array_udiff_uassoc' 'array_uintersect' 'array_uintersect_uassoc' 'array_unique' 'array_unshift'
	'array_values' 'array_walk' 'array_walk_recursive' 'arsort' 'asin' 'asinh' 'asort' 'assert_options'
	'atan' 'atan2' 'atanh' 'base64_decode' 'base64_encode' 'base_convert' 'basename' 'bin2hex' 'bindec'
	'boolval' 'ceil' 'checkdate' 'chop' 'chr' 'chunk_split' 'convert_uuencode' 'cos' 'cosh' 'count' 'count_chars'
	'crc32' 'ctype_alnum' 'ctype_alpha' 'ctype_cntrl' 'ctype_digit' 'ctype_graph' 'ctype_lower' 'ctype_print'
	'ctype_punct' 'ctype_space' 'ctype_upper' 'ctype_xdigit' 'current' 'date' 'decbin' 'dechex' 'decoct'
	'deg2rad' 'dirname' 'doubleval' 'echo' 'empty' 'end' 'escapeshellarg' 'exp' 'explode' 'expm1' 'floatval' 'floor'
	'fmod' 'function_exists' 'getdate' 'get_defined_functions' 'getenv' 'get_html_translation_table' 'getrandmax'
	'gettimeofday' 'gettype' 'gmdate' 'gmmktime' 'gmstrftime' 'hex2bin' 'hexdec' 'htmlentities' 'html_entity_decode'
	'htmlspecialchars' 'htmlspecialchars_decode' 'http_build_query' 'hypot' 'idate' 'implode' 'in_array' 'inet_ntop'
	'inet_pton' 'ini_get' 'ini_set' 'intval' 'ip2long' 'is_array' 'is_bool' 'is_double' 'is_finite' 'is_float'
	'is_infinite' 'is_int' 'is_integer' 'is_long' 'is_nan' 'is_null' 'is_numeric' 'is_object' 'is_scalar' 'isset'
	'is_string' 'join' 'json_encode' 'json_last_error' 'key' 'krsort' 'ksort' 'lcfirst' 'lcg_value' 'levenshtein'
	'localeconv' 'log' 'log10' 'log1p' 'long2ip' 'ltrim' 'max' 'metaphone' 'microtime' 'min' 'mktime' 'mt_getrandmax'
	'mt_rand' 'natcasesort' 'natsort' 'next' 'nl2br' 'nl_langinfo' 'number_format' 'octdec' 'ord' 'pack' 'date_parse'
	'parse_str' 'parse_url' 'pathinfo' 'pi' 'pos' 'pow' 'preg_match' 'preg_quote' 'preg_replace' 'prev' 'printf'
	'print_r' 'quoted_printable_decode' 'quoted_printable_encode' 'quotemeta' 'rad2deg' 'rand' 'range' 'rawurldecode'
	'rawurlencode' 'reset' 'round' 'rsort' 'rtrim' 'serialize' 'setcookie' 'setlocale' 'setrawcookie' 'set_time_limit'
	'shuffle' 'similar_text' 'sin' 'sinh' 'sizeof' 'sort' 'soundex' 'sprintf' 'sqrt' 'sscanf' 'strcasecmp' 'strchr'
	'strcmp' 'strcoll' 'strcspn' 'strftime' 'str_getcsv' 'stripos' 'stripslashes' 'strip_tags' 'str_ireplace'
	'stristr' 'strlen' 'strnatcasecmp' 'strnatcmp' 'strncasecmp' 'strncmp' 'str_pad' 'strpbrk' 'strpos' 'strptime'
	'strrchr' 'str_repeat' 'str_replace' 'strrev' 'strripos' 'str_rot13' 'strrpos' 'str_shuffle' 'str_split' 'strspn'
	'strstr' 'strtok' 'strtolower' 'strtotime' 'strtoupper' 'strtr' 'strval' 'str_word_count' 'substr' 'substr_compare'
	'substr_count' 'substr_replace' 'tan' 'tanh' 'time' 'trim' 'uasort' 'ucfirst' 'ucwords' 'uksort' 'uniqid' 'unserialize'
	'urldecode' 'urlencode' 'usort' 'utf8_decode' 'utf8_encode' 'var_dump' 'var_export' 'version_compare' 'vprintf'
	'vsprintf' 'wordwrap' 'xdiff_string_diff' 'xdiff_string_patch' '_php_cast_float' '_php_cast_int' '_phpCastString'
)
# shellcheck disable=SC2034
declare -r VALID_FUNCS

# Functions considered as too large to be included in the light distribution of PHPjed
LARGE_FUNCS=(
	'addcslashes' 'crc32' 'date_parse' 'get_html_translation_table' 'metaphone'
	'pack' 'sscanf' 'strptime' 'strtotime' 'unserialize' 'var_dump' 'var_export'
	'xdiff_string_diff' 'xdiff_string_patch'
)
# shellcheck disable=SC2034
declare -r LARGE_FUNCS

# Standard or error output format
declare -A FORMAT
FORMAT[bold]=$(tput bold 2> /dev/null)
FORMAT[ok]=$'\033[1;32m'
FORMAT[warning]=$'\033[1;33m'
FORMAT[err]=$'\033[1;41m'
FORMAT[def]=$(tput sgr0 2> /dev/null)
FORMAT[fold_width]=130
declare -r FORMAT

################################################################################
# FUNCTIONS
################################################################################

# Add a message in the warnings array
add_warning() {
	local text=$1
	
	# ------------------
	
	WARNINGS+=("${FUNCNAME[1]}(): $text")
}

# Calculate with awk
awk_calc() {
	local calc=$1
	local scale=$2
	
	# ------------------
	
	LC_NUMERIC=C awk "BEGIN { printf \"%.${scale}f\", $calc }"
}

# Beautify the specified file
beautify_file() {
	local file=$1
	
	local beautifier_name ret_beautifier tmp_file
	declare -a beautifier_command
	
	# ------------------
	
	tmp_file=$(create_tmp "$file" false)
	beautifier_name=${BEAUTIFIER_FOLDER##*/}
	beautifier_command=("$beautifier_name" -b collapse -d -e $'\n' --indent-empty-lines -n -O before-newline)
	beautifier_command+=(-t -w 100 -o "$tmp_file" "$file")
	
	msg "Beautifying with the following command:"$'\n'"${beautifier_command[*]}"
	
	ret_beautifier=$(run_python_virt "$BEAUTIFIER_FOLDER" "${beautifier_command[@]}" 2>&1)
	
	if [[ ! -f $tmp_file ]]; then
		add_warning "Failed to beautify the file \"$file\":"$'\n'"$ret_beautifier"
	else
		mv "$tmp_file" "$file"
	fi
}

# Exit after trying unsuccessfully to enter an emplacement
cd_exit() {
	local emplacement=$1
	
	# ------------------
	
	msg "Can't enter the emplacement \"$emplacement\"." "err"
	
	custom_exit 1
}

# Check for potential issues with the final Javascript file after the builder process finished
check_file() {
	local input=$1
	local namespace=$2
	
	# ------------------
	
	if grep -q "module.exports" "$input" 2> /dev/null; then
		add_warning "It seems that some \"module.exports\" instructions are still in the file \"$input\"."$'\n'"To check: grep -n \"module.exports\" \"$input\""
	fi
	
	if grep -qP "\brequire\s*\(" "$input" 2> /dev/null; then
		add_warning "It seems that some \"require\" instructions are still in the file \"$input\"."$'\n'"To check: grep -nP \"\brequire\s*\(\" \"$input\""
	fi
	
	if [[ -n $namespace ]]; then
		if grep -qP "^\s*function\s+[a-zA-Z0-9_]+(?=\s*\()" "$input" 2> /dev/null; then
			add_warning "It seems that some secondary functions (used by the main PHP functions ported) have no namespace in the file \"$input\"."$'\n'"To check: grep -nP \"^\s*function\s+[a-zA-Z0-9_]+(?=\s*\()\" \"$input\""
		fi
	fi
	
	if grep -v "^\s*//" "$input" 2> /dev/null | grep -qP "\beval\s*\("; then
		add_warning "It seems that some functions use \"eval()\" in the file \"$input\"."$'\n'"To check: grep -v \"^\s*//\" \"$input\" | grep -qP \"\beval\s*\(\""
	fi
}

# Compress a file with the deflate algorithm
compress() {
	local input=$1
	local output=$2
	
	# ------------------
	
	if [[ ! -f $input ]]; then
		msg "The file \"$input\" doesn't exist." "err"
	else
		msg "Compressing \"$input\" and saving to \"$output\"."
		
		gzip --best -c "$input" > "$output"
		
		if [[ ! -f $output ]]; then
			msg "The file \"$input\" can't be compressed." "err"
		fi
	fi
}

# Convert merged Locutus files from server-side (Node.js) to client-side
convert_for_browser_usage() {
	local input=$1
	local output=$2
	local namespace=$3
	
	local namespace_replacement namespace_statements sed_comms
	
	# ------------------
	
	if [[ ! -f $input ]]; then
		add_warning "The file \"$input\" doesn't exist."
	else
		msg "Conversion of \"$input\" for browser usage (client-side library) and saving to \"$output\"."
		
		if [[ -n $namespace ]]; then
			msg "Step 1: Removing \"module exports\" instructions and setting the namespace \"$namespace\"."
			
			namespace_statements=$(get_namespace_statements "$namespace")
			
			if [[ -n $namespace_statements ]]; then
				echo "$namespace_statements" >> "$output"
			fi
			
			# Ex.: module.exports = function abc (...)
			sed -E "s#\bmodule\.exports\s*=\s*function\s+([a-zA-Z0-9_]+)\s*\(#$namespace.\1 = function(#" \
			       "$input" >> "$output"
			
			# Secondary functions (used by the main PHP functions ported) to be namespaceed
			# Ex.: function abc (...)
			sed_comms="sed -Ei \"s#^\s*function\s+{}\s*\(#$namespace.{} = function(#\" \"$output\";"
			sed_comms+=" sed -Ei \"s#(^|[^a-zA-Z0-9_.]){}\s*\(#\1$namespace.{}(#\" \"$output\";"
			grep -oP "^\s*function\s+\K[a-zA-Z0-9_]+(?=\s*\()" "$output" | xargs -I {} echo "$sed_comms" | sh
		else
			msg "Step 1: Removing \"module exports\" instructions."
			
			# Ex.: module.exports = function abc (...)
			sed -E "s#\bmodule\.exports\s*=\s*function\s+#function #" "$input" >> "$output"
		fi
		
		msg "Step 2: Replacing \"require\" instructions."
		
		if [[ -n $namespace ]]; then
			namespace_replacement="$namespace."
		fi
		
		# Ex.: abc = require('abc')
		sed -Ei "s#\b([a-zA-Z0-9_]+)\s*=\s*require\s*\(\s*([\"']).+/([^\"'/]+)\2\s*\).*#\1 = $namespace_replacement\3#" "$output"
		
		# Ex.: return require('abc')
		sed -Ei "s#\breturn\s+require\s*\(\s*([\"']).+/([^\"'/]+)\1\s*\)#return $namespace_replacement\2#" "$output"
		
		# Ex.: (typeof require !== 'undefined' ? require('abc')(...) : undefined)
		sed_comms="s"
		sed_comms+="#\(\s*typeof\s+require\s*!==\s*'undefined'\s*\?\s*require\s*\(\s*([\"']).+/([^\"'/]+)\1\s*\)\s*(\([^\)]+\))\s*:\s*undefined\s*\)"
		sed_comms+="#$namespace_replacement\2\3"
		sed_comms+="#"
		sed -Ei "$sed_comms" "$output"
	fi
}

# Create a temporary file in the emplacement specified.
# 
# If the first argument is a folder, the temporary file will be created in this folder.
# 
# If it's a file, the temporary file will be created in the same folder and the name of
# the file will be used in the temporary file name.
# 
# If it's empty, the default temporary folder will be used.
# 
# If the second argument equals "false", the temporary file won't be created, but the path
# generated will be returned.
create_tmp() {
	local path=$1
	local create=$2
	
	local emplacement mktemp_u_arg pattern tmp_file
	
	# ------------------
	
	if [[ $create != false && $create != true ]]; then
		create=true
	fi
	
	pattern="XXXX"
	
	if [[ -f $path || -d $path ]]; then
		emplacement=$(realpath "$path")
		
		if [[ -f $path ]]; then
			emplacement=${emplacement%/*}
			pattern+="-${path##*/}"
		fi
	else
		emplacement=$(get_tmp_folder)
	fi
	
	if [[ ! -d $emplacement ]]; then
		msg "The folder \"$emplacement\" doesn't exist." "err"
	else
		if [[ $create == false ]]; then
			mktemp_u_arg="-u"
		fi
		
		tmp_file=$(mktemp $mktemp_u_arg -p "$emplacement" -t "$pattern")
		
		if [[ ! -f $tmp_file && $create == true ]]; then
			msg "Can't create a temporary file in \"$emplacement\"." "err"
		fi
	fi
	
	echo -n "$tmp_file"
}

# Check for warnings before exiting
custom_exit() {
	local code=$1
	
	# ------------------
	
	display_warnings
	tag_files "warnings"
	
	exit "$code"
}

# List all PHPjed functions with a link to the PHP manual
display_functions() {
	local functions=("$@")
	
	local f letter name previous_letter text url url_name
	declare -a functions_sorted
	
	# ------------------
	
	echo "${FORMAT[ok]}All ${#functions[@]} functions included${FORMAT[def]}"
	echo "${FORMAT[ok]}==========================${FORMAT[def]}"
	
	readarray -t functions_sorted < <(printf '%s\0' "${functions[@]}" | sort -Vz | xargs -0n1)
	
	for f in "${functions_sorted[@]}"; do
		name=$f
		url_name=${name//_/-}
		url_name=${url_name,,}
		url="https://www.php.net/manual/function.$url_name.php"
		letter=${name:0:1}
		letter=${letter^^}
		
		# Title
		if [[ $letter != "$previous_letter" ]]; then
			echo
			
			if [[ $letter == "_" ]]; then
				echo "${FORMAT[ok]}\`$letter\`${FORMAT[def]}"
			else
				echo "${FORMAT[ok]}$letter${FORMAT[def]}"
			fi
			
			echo "${FORMAT[ok]}----------${FORMAT[def]}"
			echo
			previous_letter=$letter
		fi
		
		# Function
		if [[ $letter == "_" ]]; then
			echo "- (LIGHT) ${FORMAT[ok]}\`$name\`:${FORMAT[def]} helper function"
		else
			if in_array "VALID_FUNCS" "$name"; then
				if in_array "LARGE_FUNCS" "$name"; then
					text="- (ALL)   "
				else
					text="- (LIGHT) "
				fi
				
				text+="[${FORMAT[ok]}$name${FORMAT[def]}]($url)"
			else
				if wget -q --method=HEAD "$url"; then
					text="${FORMAT[warning]}- [$name (new)]($url)"${FORMAT[def]}
				else
					text="${FORMAT[warning]}- \`$name\` (new): no entry in the PHP manual${FORMAT[def]}"
				fi
				
				add_warning "It seems that the function \"$name\" is a new function added in Locutus."
			fi
			
			echo "$text"
		fi
	done
	
	echo
}

# Help for the PHPjed builder
display_help() {
    cat << HEREDOC
Builder for PHPjed v$PHPJED_VERSION
${FORMAT[ok]}Usage:${FORMAT[def]}  ${FORMAT[bold]}$SCRIPT_NAME  [FUNC_NAMESPACE]  [INC_LARGE_FUNC]  [JS_INDEX]${FORMAT[def]}

${FORMAT[ok]}ARGUMENT [FUNC_NAMESPACE]:${FORMAT[def]}
    Optional argument. Namespace that will be added to prevent naming collisions. For example,
    if the namespace specified is "pj", functions will be invoked like this:
    
        pj.is_array(...)
    
    Multiple levels can be specified. For example, with the namespace "pj.fn", functions
    will be invoked like this:
    
        pj.fn.is_array(...)
    
    Without namespace, functions are invoked directly (but there are risks of naming collisions
    if other scripts have a function with the same name):
    
        is_array(...)
    
    To disable namespace, the value must be "none". Example:

        $SCRIPT_NAME none

    Value by default is "$DEFAULT_NAMESPACE".

${FORMAT[ok]}ARGUMENT [INC_LARGE_FUNCS]:${FORMAT[def]}
    Optional argument. If it equals "true", large functions excluded by default will be merged.
    Example:
    
        $SCRIPT_NAME $DEFAULT_NAMESPACE true

    Value by default is "false".

${FORMAT[ok]}ARGUMENT [JS_INDEX]:${FORMAT[def]}
    Optional argument. Path to the local Locutus index file "index.js" listing all required files
    to be merged. If not specified, files will be downloaded (if they are not found locally).
    Example:
    
        $SCRIPT_NAME $DEFAULT_NAMESPACE false "/path/to/index.js"

${FORMAT[ok]}FOLDERS:${FORMAT[def]}
    The folder "dist" contains official distribution files of PHPjed.
    
    The folder "data" contains 3 subfolders:
    
    - "data/custom-builds": After running the builder, a subfolder is created in "data/custom-builds"
      with the current date as name, for example "data/custom-builds/20210831-020109-64", and contains
      PHPjed files ready to be used.
    
    - "data/src": All packages and third-party programs needed for the build process are saved in this
      subfolder.
    
    - "data/tmp": When downloads are performed, files are first saved in the temporary folder before
      being moved in the "src" folder.

See the file "README.md" for more details about PHPjed itself.

HEREDOC
}

# List all files generated by the builder
display_info_files() {
	declare -a args=("$@")
	declare -a files=("${@:1:$#-2}")
	local namespace=${args[-2]}
	local distribution=${args[-1]}
	
	local array_title details file file_name file_size file_size_kib folder max_file_size
	local max_name_length name_length namespace_text output sep size_reduction title
	
	# ------------------
	
	max_name_length=0
	max_file_size=0
	
	for file in "${files[@]}"; do
		file_name=${file##*/}
		name_length=${#file_name}
		
		if ((name_length > max_name_length)); then
			max_name_length=$name_length
		fi
		
		if [[ -f $file ]]; then
			file_size=$(stat -c %s "$file")
			
			if ((file_size > max_file_size)); then
				max_file_size=$file_size
			fi
		fi
	done
	
	array_title=$(display_info_files_line "$max_name_length" "FILE NAME" "SIZE (in KiB)" "SIZE REDUCTION")
	sep=$(display_info_files_line "$max_name_length" "$(printf -- "-%.0s" $(seq "$max_name_length"))" \
	                                                 "$(printf -- "-%.0s" $(seq 13))" \
	                                                 "$(printf -- "-%.0s" $(seq 14))")
	
	for file in "${files[@]}"; do
		file_name=${file##*/}
		file_size_kib=""
		size_reduction=""
		
		if [[ ! -f $file ]]; then
			file_size_kib="not found"
		else
			folder=${file%/*}
			file_size=$(stat -c %s "$file")
			file_size_kib=$(awk_calc "$file_size / 1024" 2)
			
			if [[ -z $file_size ]]; then
				file_size_kib="not found"
			elif [[ -n $max_file_size && $file_size != "$max_file_size" ]]; then
				size_reduction=$(awk_calc "($max_file_size - $file_size) / $max_file_size * 100" 2)
				
				if [[ -n $size_reduction ]]; then
					size_reduction+="%"
				fi
			fi
			
			if [[ -z $size_reduction ]]; then
				size_reduction="-"
			fi
		fi
		
		output+=$(display_info_files_line "$max_name_length" "$file_name" "$file_size_kib" "$size_reduction")
		output+=$'\n'
	done
	
	if [[ -n $output ]]; then
		title="All PHPjed files generated during the build process"$'\n'
		title+="==================================================="
		
		details="- ${FORMAT[ok]}Folder:${FORMAT[def]} $folder"$'\n'
		namespace_text=$namespace
		
		if [[ -n $namespace ]]; then
			namespace_text+="."
		else
			namespace="none"
		fi
		
		details+="- ${FORMAT[ok]}Namespace:${FORMAT[def]} $namespace; example: ${namespace_text}is_int(5)"$'\n'
		details+="- ${FORMAT[ok]}Distribution:${FORMAT[def]} $distribution"
		
		if [[ $distribution == "light" ]]; then
			details+=" (default)"
		fi
		
		msg "$title" "ok" false
		
		msg "$details" "" false
		
		echo "$array_title"
		echo "$sep"
		echo -n "$output" | sort -t '|' -k 2,2nr -k 1,1V
		echo
	fi
}

# Display a formatted line for the function "display_info_files"
display_info_files_line() {
	local max_name_length=$1
	local file_name=$2
	local file_size=$3
	local size_reduction=$4
	
	# ------------------
	
	printf "%-${max_name_length}s | %-13s | %s\n" "$file_name" "$file_size" "$size_reduction"
}

# Display warnings saved during the build process
display_warnings() {
	local warning
	
	if [[ -n ${WARNINGS[*]} ]]; then
		msg "Warnings during the build process:" "warning" false
		
		for warning in "${WARNINGS[@]}"; do
			msg "$warning" "warning" false
		done
	else
		msg "No warnings during the build process." "ok" false
	fi
}

# Download a repository or a specific asset from GitHub. Examples with the
# repository <https://github.com/emacs-mirror/emacs>:
# 
# 1) To download the latest release (both are equivalent):
# 
#        download_from_github "emacs-mirror" "emacs"
#        download_from_github "emacs-mirror" "emacs" "latest"
# 
# 2) To download the branch "emacs-27":
# 
#        download_from_github "emacs-mirror" "emacs" "branch:emacs-27"
# 
# 3) To download the asset "emacs-XXXX.zip" from the latest release, for example "emacs-27.2.zip":
# 
#        download_from_github "emacs-mirror" "emacs" "latest" "%VERSION%.zip"
# 
# 4) To download the asset "emacs-XXXX.zip" from the latest release, for example "emacs-27.2.zip",
#    and rename it "emacs.zip":
# 
#        download_from_github "emacs-mirror" "emacs" "latest" "%VERSION%.zip" "emacs.zip"
# 
# 5) Archives ".tar.gz" or ".tgz" are extracted automatically after downloading them:
# 
#        download_from_github "emacs-mirror" "emacs" "latest" "%VERSION%.tar.gz"
# 
# 6) Downloads are saved by default in the same folder as the Bash script. To specify a custom
#    target folder:
# 
#        download_from_github "emacs-mirror" "emacs" "latest" "%VERSION%.tar.gz" "" "/path/to/custom/folder"
# 
# 7) To specify a custom temporary folder:
# 
#        download_from_github "emacs-mirror" "emacs" "latest" "%VERSION%.tar.gz" "" "/path/to/custom/folder" "/path/to/tmp/folder"
download_from_github() {
	local author=$1
	local repo_name=$2
	local release=$3
	local asset=$4
	local asset_new_name=$5
	local target_folder=$6
	local tmp_folder=$7
	
	local download_url download_version target_path tmp_path version_url
	
	# ------------------
	
	if [[ -z $release ]]; then
		release="latest"
	fi
	
	tmp_folder=$(get_tmp_folder "$tmp_folder")
	
	if [[ $release =~ ^"branch:" ]]; then
		download_version=${release#*:}
		asset="$release.tar.gz"
	else
		version_url="https://api.github.com/repos/$author/$repo_name/releases/$release"
		download_version=$(wget -q -O- "$version_url" | sed -En 's/.*"tag_name":\s*"([^"]+).*$/\1/p')
	fi
	
	if [[ -z $download_version ]]; then
		msg "Can't find the version to download. Content parsed: $version_url" "err"
	else
		if [[ -z $asset ]]; then
			asset="$download_version.tar.gz"
			download_url="https://github.com/$author/$repo_name/archive/refs/tags/$asset"
		else
			asset=$(echo -n "$asset" | sed -E "s/%VERSION%/$download_version/g")
			
			if [[ $release =~ ^"branch:" ]]; then
				download_url="https://github.com/$author/$repo_name/archive/refs/heads/$download_version.tar.gz"
			else
				download_url="https://github.com/$author/$repo_name/releases/download/$download_version/$asset"
			fi
		fi
		
		if [[ -d $target_folder ]]; then
			target_path="$target_folder/$repo_name"
		else
			target_path="$(dirname -- "$(realpath "$0")")/$repo_name"
		fi
		
		tmp_path="$tmp_folder/$asset"
		
		if [[ ! -e $target_path ]]; then
			msg "Creating the folder \"$target_path\"."
			
			mkdir -p "$target_path"
		fi
		
		if [[ ! -d $target_path ]]; then
			msg "Can't find the target folder \"$target_path\"." "err"
		elif ! is_empty "$target_path"; then
			msg "The folder \"$target_path\" already contains files. The download won't be performed." "warning"
		else
			msg "Downloading \"$download_url\" and saving to \"$tmp_path\"."
			
			wget -q --show-progress -c -O "$tmp_path" "$download_url"
			echo
			
			if [[ ! -f $tmp_path ]]; then
				msg "Can't download \"$download_url\"." "err"
			else
				if [[ $tmp_path =~ (".tar.gz"|".tgz")$ ]]; then
					msg "Extracting \"$tmp_path\" to \"$target_path\"."
					
					tar zxf "$tmp_path" -C "$target_path" --strip-components 1
					
					if is_empty "$target_path"; then
						msg "Can't extract \"$tmp_path\" to \"$target_path\"." "err"
					else
						msg "Deleting the archive \"$tmp_path\"."
						
						rm "$tmp_path"
					fi
				else
					msg "Moving \"$tmp_path\" to \"$target_path\"."
					
					if [[ -n $asset_new_name && ! $asset_new_name =~ "/" ]]; then
						mv "$tmp_path" "$target_path/$asset_new_name"
					else
						mv "$tmp_path" "$target_path"
					fi
				fi
			fi
		fi
	fi
}

# Download a package from npm and extract the package binary
download_from_npm() {
	local package_name=$1
	local name=$2
	local target_folder=$3
	local tmp_folder=$4
	
	local archive_name archive_path archive_url latest target version_url
	
	# ------------------
	
	if [[ -z $name ]]; then
		name=$package_name
	fi
	
	if [[ ! -e $target_folder && -n $target_folder ]]; then
		msg "Creating the folder \"$target_folder\"."
		
		mkdir -p "$target_folder"
	fi
	
	tmp_folder=$(get_tmp_folder "$tmp_folder")
	target="$target_folder/$name"
	
	if [[ -z $package_name ]]; then
		msg "The package name can't be empty." "err"
	elif [[ ! -d $target_folder ]]; then
		msg "The target folder \"$target_folder\" doesn't exist." "err"
	elif [[ ! -d $tmp_folder ]]; then
		msg "The temporary folder \"$tmp_folder\" doesn't exist." "err"
	elif [[ -f $target ]]; then
		msg "The file \"$target\" already exists. The download won't be performed." "warning"
	else
		version_url="https://registry.npmjs.org/$package_name"
		latest=$(wget -q -O- "$version_url" | "$JQ_PATH" -r '.["dist-tags"].latest')
		
		if [[ -z $latest ]]; then
			msg "The latest version for the package \"$name\" can't be retrieved. Content parsed: $version_url" "err"
		else
			archive_url="https://registry.npmjs.org/$package_name/-/$package_name-$latest.tgz"
			archive_name=${archive_url##*/}
			archive_path="$tmp_folder/$archive_name"
			
			msg "Downloading \"$archive_url\" and saving to \"$archive_path\"."
			
			wget -q --show-progress -c -O "$archive_path" "$archive_url"
			echo
			
			if [[ ! -f $archive_path ]]; then
				msg "The archive \"$archive_url\" can't be downloaded." "err"
			else
				msg "Extracting \"$archive_path\" to \"$target\"."
				
				tar zxf "$archive_path" -C "$target_folder" --strip-components 2 "package/bin/$name"
				
				if [[ $name != "$package_name" ]]; then
					msg "Moving \"$target_folder/$package_name\" to \"$target\"."
					
					mv "$target_folder/$package_name" "$target"
				fi
				
				if [[ ! -x $target ]]; then
					msg "The target \"$target\" is not executable." "err"
				else
					msg "Deleting the archive \"$archive_path\"."
					
					rm "$archive_path"
				fi
			fi
		fi
	fi
}

# Return the namespace statements included at the beginning of the PHPjed files
get_namespace_statements() {
	local namespace=$1
	
	local all_names name statements v
	declare -a var
	
	# ------------------
	
	all_names=""
	
	while IFS='.' read -ra var; do
		for v in "${var[@]}"; do
			name=""
			
			if [[ -z $all_names ]]; then
				name="var "
			else
				all_names+="."
			fi
			
			all_names+=$v
			
			statements+="$name$all_names = $all_names || {};"
			statements+=$'\n'
		done
	done <<< "$namespace"
	
	echo -n "$statements"
}

# Get the temporary folder emplacement
get_tmp_folder() {
	local tmp_folder=$1
	
	# ------------------
	
	if [[ -n $tmp_folder && ! -e $tmp_folder ]]; then
		mkdir -p "$tmp_folder"
	fi
	
	if [[ ! -d $tmp_folder && -d ${FOLDERS[tmp]} ]]; then
		tmp_folder=${FOLDERS[tmp]}
	fi
	
	if [[ ! -d $tmp_folder ]]; then
		tmp_folder=$(dirname -- "$(mktemp -u)")
	fi
	
	echo -n "$tmp_folder"
}

# Test if "item" is in the array whose name is "arr"
in_array() {
	declare -n arr=$1
	local item=$2
	
	local status value
	
	# ------------------
	
	status=1
	
	for value in "${arr[@]}"; do
		if [[ $value == "$item" ]]; then
			status=0
			
			break
		fi
	done
	
	return "$status"
}

# Install a Python package on a virtual environment
install_python_virt() {
	local package_name=$1
	local name=$2
	local folder=$3
	
	local dependencies_installed package_path working_dir
	declare -a install_command
	
	# ------------------
	
	package_path="$folder/bin/$name"
	dependencies_installed=true
	
	if ! type -p virtualenv > /dev/null; then
		dependencies_installed=false
		msg "The package \"python3-virtualenv\" must be installed." "err"
	fi
	
	if ! type -p pip3 > /dev/null; then
		dependencies_installed=false
		msg "The package \"python3-pip\" must be installed." "err"
	fi
	
	if [[ ! -e $folder ]]; then
		mkdir -p "$folder"
	fi
	
	if [[ ! -d $folder ]]; then
		msg "The folder \"$folder\" can't be created." "err"
	elif [[ $dependencies_installed == true ]]; then
		if [[ ! -e "$folder/bin/activate" ]]; then
			virtualenv "$folder"
		fi
		
		if [[ ! -f "$folder/bin/activate" ]]; then
			msg "Can't create a virtual environment in \"$folder\"." "err"
		elif [[ ! -f $package_path ]]; then
			install_command=(pip3 install "$package_name")
			run_python_virt "$folder" "${install_command[@]}"
		fi
		
		if [[ ! -f $package_path ]]; then
			msg "Can't install the package at the emplacement \"$package_path\"." "err"
		fi
	fi
}

# Test if the folder is empty
is_empty() {
	local folder=$1
	
	# ------------------
	
	[[ -n "$(find "$folder" -maxdepth 0 -type d -empty 2> /dev/null)" ]]
}

# Test if the file is the main Locutus index
is_locutus_main_index() {
	local index=$1
	
	# ------------------
	
	grep -qP "require\s*\(\s*([\"'])\./array\1\s*\)" "$index" 2> /dev/null
}

# Merge Locutus files and filter functions
merge_files() {
	local input=$1
	local output=$2
	
	local dir func name new_name required working_dir
	declare -A funcs_to_rename
	
	# ------------------
	
	if [[ ! -f $input ]]; then
		add_warning "The file \"$input\" doesn't exist."
	else
		dir=${input%/*}
		working_dir=$(pwd)
		
		cd -- "$dir" || cd_exit "$dir"
		
		while IFS= read -r line || [[ -n $line ]]; do
			required=$(sed -E "s/.+\brequire\s*\(\s*([\"'])([^\"']+)\1\s*\).*/\2/" <<< "$line")
			required=$(realpath "$required")
			
			if [[ ! -e $required ]]; then
				required+=".js"
			fi
			
			name=${required##*/}
			name=${name%.*}
			
			# Some functions are not included in PHPjed:
			# 
			# 1) "/_helpers/bc.js" and "/bc/*": licensed under the LGPL
			
			if [[ $required =~ ("/_bc.js"|"/bc")$ ]]; then
				msg "Ignoring \"$required\" (because of licensing)." "warning"
				
				continue
			
			# 2) "/filesystem/file_get_contents.js", "/filesystem/realpath.js", "/strings/md5.js",
			#    "/strings/md5_file.js", "/strings/sha1.js", "/strings/sha1_file.js": use Node.js modules
			
			elif [[ $required =~ ("/file_get_contents.js"|"/realpath.js"|"/md5.js"|"/md5_file.js"|"/sha1.js"|"/sha1_file.js")$ ]]; then
				msg "Ignoring \"$required\" (uses Node.js modules, so server-side only)." "warning"
				
				continue
			
			# 3) "/funchand/call_user_func.js", "/funchand/call_user_func_array.js", "/json/json_decode.js",
			#    "/var/is_callable.js": use "eval()"
			
			elif [[ $required =~ ("/call_user_func.js"|"/call_user_func_array.js"|"/json_decode.js"|"/is_callable.js")$ ]]; then
				msg "Ignoring \"$required\" (uses \"eval()\")." "warning"
				
				continue
			
			# 4) "/var/is_binary.js" (https://web.archive.org/web/20091025010813/http://www.php.net/manual/en/function.is-binary.php),
			#    "/var/is_buffer.js" (https://web.archive.org/web/20091025010855/http://www.php.net/manual/en/function.is-buffer.php):
			#    entry only in the PHP 6 manual
			
			elif [[ $required =~ ("/is_binary.js"|"/is_buffer.js")$ ]]; then
				msg "Ignoring \"$required\" (this function is only listed in the PHP 6 manual)." "warning"
				
				continue
			
			# 5) "/net-gopher/gopher_parsedir.js" (https://web.archive.org/web/20200807104229/https://www.php.net/manual/en/function.gopher-parsedir.php): no longer in the PHP manual
			
			elif [[ $required =~ "/gopher_parsedir.js"$ ]]; then
				msg "Ignoring \"$required\" (this function is no longer in the PHP manual)." "warning"
				
				continue
			
			# 6) "/i18n/i18n_loc_get_default.js" (https://web.archive.org/web/20070211144607/http://www.php.net/manual/en/function.i18n-loc-get-default.php),
			#    "/i18n/i18n_loc_set_default.js" (https://web.archive.org/web/20070222020155/http://www.php.net/manual/en/function.i18n-loc-set-default.php),
			#    "/var/is_unicode.js" (https://web.archive.org/web/20090206161640/php.net/manual/en/function.is-unicode.php):
			#    "No version information available, might be only in CVS"
			
			elif [[ $required =~ ("/i18n_loc_get_default.js"|"/i18n_loc_set_default.js"|"/is_unicode.js")$ ]]; then
				msg "Ignoring \"$required\" (this function is no longer in the PHP manual, and was probably never included in an official PHP release)." "warning"
				
				continue
			
			# 7) "/array/arsort.js", "/array/asort.js", "/array/ksort.js", "/array/rsort.js", "/array/sort.js": require "/i18n/i18n_loc_get_default"
			
			elif [[ $required =~ ("/arsort.js"|"/asort.js"|"/ksort.js"|"/rsort.js"|"/sort.js")$ ]]; then
				msg "Ignoring \"$required\" (this function requires another function excluded)." "warning"
				
				continue
			
			# Large functions are included only if it's specified explicitely in the command line.
			
			elif [[ $INC_LARGE_FUNCS == false ]] && in_array "LARGE_FUNCS" "$name"; then
				msg "Ignoring \"$required\" (this function is considered a large function, and can be included if explicitely specified in the command line)." "warning"
				
				continue
			
			# Removing deprecated PHP functions.
			
			elif in_array "DEPRECATED_FUNCS" "$name"; then
				msg "Ignoring \"$required\" (this function is deprecated by PHP)." "warning"
				
				continue
			
			# Function valid.
			
			elif [[ -f $required ]]; then
				msg "Merging \"$required\" into \"$output\"."
				
				awk 'FNR == 1 && NR > 1 {print ""}1' "$required" >> "$output"
				
				if [[ $name != "${name,,}" ]]; then
					if ! in_array "VALID_FUNCS" "$name"; then
						add_warning "The new function \"$name\" doesn't contain only lower-case letters."
					else
						funcs_to_rename[$name]=$(echo -n "$name" | sed -E "s/([A-Z])/_\L\1/g")
						name=${funcs_to_rename[$name]}
					fi
				fi
				
				ALL_FUNCTIONS+=("$name")
			
			# New index file to follow.
			
			elif [[ -d $required ]]; then
				msg "Entering a new index file \"$required/index.js\"."
				
				merge_files "$required/index.js" "$output"
			
			# Unexpected error.
			
			else
				add_warning "Unexpected error with \"$required\" during the merging process."
				msg "Unexpected error with \"$required\"." "err"
			
			fi
		done < "$input"
		
		cd -- "$working_dir" || cd_exit "$working_dir"
		
		if [[ -n ${funcs_to_rename[*]} ]]; then
			for func in "${!funcs_to_rename[@]}"; do
				new_name=${funcs_to_rename[$func]}
				
				msg "Renaming \"$func\" to \"$new_name\"."
				
				sed -Ei "s#\b$func\b#$new_name#g" "$output"
			done
		fi
	fi
}

# Minify a Javascript file. If a copyright notice is set in "$COPYRIGHT", it'll be included as the first line.
minify() {
	local input=$1
	local output=$2
	
	local ret_minifier use_all_args
	declare -a args
	declare -a more_args
	
	# ------------------
	
	use_all_args=false
	
	if [[ ! -x $MINIFIER_PATH ]]; then
		add_warning "The minifier \"$MINIFIER_PATH\" is not executable."
	elif [[ ! -f $input ]]; then
		add_warning "The file \"$input\" doesn't exist."
	elif [[ -f $output ]]; then
		add_warning "The file \"$output\" already exists."
	else
		args=(--minify --outfile="$output")
		more_args=(--minify-whitespace --minify-identifiers --minify-syntax --legal-comments=none --keep-names --platform=browser)
		
		if [[ $use_all_args == true ]]; then
			args+=("${more_args[@]}")
		fi
		
		args+=("$input")
		
		msg "Minifying with the following command: $MINIFIER_PATH ${args[*]}"
		
		ret_minifier=$("$MINIFIER_PATH" "${args[@]}" 2>&1)
		
		if [[ ! -f $output ]]; then
			add_warning "Failed to minify the file \"$input\":"$'\n'"$ret_minifier"
		else
			prepend_to_file "$COPYRIGHT" "$output"
		fi
	fi
}

# Format and display a custom message
msg() {
	local text=$1
	local format=$2
	local display_func_name=$3
	
	# ------------------
	
	if [[ $display_func_name != false ]]; then
		echo -n "${FORMAT[ok]}${FUNCNAME[1]}():${FORMAT[def]} "
	fi
	
	if [[ $format == "bold" ]]; then
		echo -n "${FORMAT[bold]}"
	elif [[ $format == "err" ]]; then
		echo -n "${FORMAT[err]}"
	elif [[ $format == "ok" ]]; then
		echo -n "${FORMAT[ok]}"
	elif [[ $format == "warning" ]]; then
		echo -n "${FORMAT[warning]}"
	fi
	
	if [[ $format == "err" ]]; then
		echo -n "$text" | fold -s -w "${FORMAT[fold_width]}" 1>&2
	else
		echo -n "$text" | fold -s -w "${FORMAT[fold_width]}"
	fi
	
	if [[ $format == "bold" || $format == "err" || $format == "ok" || $format == "warning" ]]; then
		echo -n "${FORMAT[def]}"
	fi
	
	echo $'\n'
	
	if [[ $format == "err" ]]; then
		echo "See the file \"README.md\" or run the command \"$SCRIPT_NAME -h\" for more details about PHPjed."
		echo
	fi
}

# Add text at the beginning of a file
prepend_to_file() {
	local text=$1
	local file=$2
	
	local tmp_file
	
	# ------------------
	
	if [[ -n $text ]]; then
		tmp_file=$(create_tmp "$file")
		
		if [[ ! -f $tmp_file ]]; then
			add_warning "The temporary file \"$tmp_file\" can't be created. The text won't be prepended."
		else
			echo "$text" > "$tmp_file"
			cat "$file" >> "$tmp_file"
			mv "$tmp_file" "$file"
		fi
	fi
}

# Preview a file
preview() {
	local file=$1
	
	local content
	
	# ------------------
	
	content=$(head -c 200 "$file" | fold -s -w "${FORMAT[fold_width]}")
	content+="..."
	
	echo -n "$content"
}

# Activate the virtual environment specified in the first argument and run the commands specified
# in the subsequent arguments.
run_python_virt() {
	local virt_folder=$1
	declare -a commands=("${@:2}")
	
	local exit_status working_folder
	
	# ------------------
	
	working_dir=$(pwd)
	cd -- "$virt_folder" || cd_exit "$virt_folder"
	source "bin/activate"
	"${commands[@]}"
	exit_status=$?
	deactivate
	cd -- "$working_dir" || cd_exit "$working_dir"
	
	return "$exit_status"
}

# Tag files according to the specified tag
tag_files() {
	local tag=$1
	
	local ext file file_without_ext
	
	# ------------------
	
	if [[ $tag == "warnings" ]]; then
		if [[ -n ${WARNINGS[*]} && -d $WORKSPACE ]]; then
			for file in "$WORKSPACE/"*; do
				if [[ $file =~ ".min.js.gz"$ ]]; then
					rm "$file"
				else
					file_without_ext=$(echo -n "$file" | perl -pe "s/^(.+?)(\.min)?\.js$/\1/")
					ext=${file#"$file_without_ext"}
					
					if [[ -n $ext ]]; then
						if [[ $ext =~ ".js"$ ]]; then
							prepend_to_file "/* WARNINGS DURING THE BUILD PROCESS */" "$file"
						fi
						
						mv "$file" "$file_without_ext-WARNINGS$ext"
					fi
				fi
			done
		fi
	fi
}

################################################################################
# ARGUMENTS
################################################################################

declare -a WARNINGS

# Get arguments

namespace=$1
large_funcs=$2
index=$3

# Help

if [[ $namespace == "-h" || $namespace == "--h" || "$namespace" == "-help" || $namespace == "--help" ]]; then
	display_help
	
	exit 0
fi

# Debug

if [[ $namespace == "DEBUG" ]] && type -p shellcheck > /dev/null; then
	clear
	shellcheck --norc "${FOLDERS[root]}/$SCRIPT_NAME"
	
	exit $?
fi

# Namespace

if [[ $namespace == "none" ]]; then
	namespace=""
elif [[ -z $namespace ]]; then
	namespace=$DEFAULT_NAMESPACE
fi

if [[ -n $namespace && ! $namespace =~ ^[a-zA-Z]([a-zA-Z0-9_.]*[a-zA-Z0-9])?$ ]]; then
	msg "The namespace \"$namespace\" is invalid." "err"
	
	custom_exit 1
fi

# Include large functions

if [[ $large_funcs != true ]]; then
	large_funcs=false
fi

declare -r INC_LARGE_FUNCS=$large_funcs

# Index file

if [[ -n $index ]]; then
	index=$(realpath "$index")
	
	if [[ ! -f $index ]]; then
		msg "Can't find the Javascript index file \"$index\"." "err"
		
		custom_exit 1
	fi
fi

################################################################################
# FOLDER AND FILE CHECKS
################################################################################

# PHPjed version and copyright

if [[ $INC_LARGE_FUNCS == true ]]; then
	infix="-all"
	distribution="all"
	msg_distribution="Building the complete distribution of PHPjed including all functions"
else
	infix=""
	distribution="light"
	msg_distribution="Building the light distribution of PHPjed"
fi

if [[ ! -f $VERSION_FILE ]]; then
	msg "The version file \"$VERSION_FILE\" can't be found." "err"
	
	custom_exit 1
fi

PHPJED_VERSION=$(cat "$VERSION_FILE")

if [[ $distribution == "all" ]]; then
	PHPJED_VERSION+="-$distribution"
fi

declare -r PHPJED_VERSION

if [[ ! $PHPJED_VERSION =~ ^[0-9]([0-9.]*[0-9])?("-all")?$ ]]; then
	msg "The version \"$PHPJED_VERSION\" is invalid." "err"
	
	custom_exit 1
fi

PHPJED_WEBSITE="https://github.com/phpjed"
declare -r PHPJED_WEBSITE

copyright_year="2021"
current_year=$(date "+%Y")

if [[ $current_year != "$copyright_year" ]]; then
	copyright_year+="-$current_year"
fi

if [[ $namespace == "$DEFAULT_NAMESPACE" ]]; then
	COPYRIGHT="/* PHPjed v$PHPJED_VERSION"
else
	COPYRIGHT="/* PHPjed custom build"
	
	if [[ $distribution == "all" ]]; then
		COPYRIGHT+=" ($distribution)"
	fi
fi

COPYRIGHT+=" | (c) $copyright_year Misaki F."
COPYRIGHT+=" (c) 2007-2016 Kevin van Zonneveld and Contributors"
COPYRIGHT+=" | $PHPJED_WEBSITE */"
declare -r COPYRIGHT

# Default PHPjed folders

for folder_key in "${!FOLDERS[@]}"; do
	if [[ ! -d ${FOLDERS[$folder_key]} ]]; then
		msg "The folder \"${FOLDERS[$folder_key]}\" doesn't exist." "err"
		
		custom_exit 1
	fi
done

# Workspace where to save Javascript files

now=$(date "+%Y%m%d-%H%M%S-%2N")
WORKSPACE="${FOLDERS[custom_builds]}/$now"
declare -r WORKSPACE

if [[ -e $WORKSPACE ]]; then
	msg "The WORKSPACE \"$WORKSPACE\" already exists." "err"
	
	custom_exit 1
fi

mkdir -p "$WORKSPACE"

if [[ ! -d $WORKSPACE ]]; then
	msg "The WORKSPACE \"$WORKSPACE\" can't be created." "err"
	
	custom_exit 1
fi

################################################################################
# DEPENDENCIES
################################################################################

# jq

JQ_PATH=jq

if ! type -p "$JQ_PATH" > /dev/null; then
	download_from_github "stedolan" "jq" "latest" "jq-linux64" "" "${FOLDERS[src]}"
	JQ_PATH="${FOLDERS[src]}/jq/jq-linux64"
	
	if [[ -f $JQ_PATH ]]; then
		chmod u+x "$JQ_PATH"
	fi
	
	if [[ ! -f $JQ_PATH || ! -x $JQ_PATH ]]; then
		msg "\"jq\" can't be downloaded." "err"
		
		custom_exit 1
	fi
fi

declare -r JQ_PATH

# Locutus

declare -r LOCUTUS_MAIN_INDEX="${FOLDERS[src]}/locutus/src/php/index.js"
declare -r LOCUTUS_HELPERS_INDEX="${LOCUTUS_MAIN_INDEX%/*}/_helpers/index.js"

if [[ ! -f $index ]]; then
	index=$LOCUTUS_MAIN_INDEX
fi

if [[ ! -f $index ]]; then
	download_from_github "locutusjs" "locutus" "branch:master" "" "" "${FOLDERS[src]}"
	
	if [[ ! -f $index ]]; then
		msg "\"Locutus\" can't be downloaded." "err"
		
		custom_exit 1
	fi
fi

if is_locutus_main_index "$index" && [[ ! -f $LOCUTUS_HELPERS_INDEX ]]; then
	msg "Can't find the Javascript index file \"$LOCUTUS_HELPERS_INDEX\"." "err"
	
	custom_exit 1
fi

# Minifier

minifier_name="esbuild"
minifier_package_name="esbuild-linux-64"
declare -r MINIFIER_PATH="${FOLDERS[src]}/$minifier_name/$minifier_name"

if [[ ! -e $MINIFIER_PATH ]]; then
	download_from_npm "$minifier_package_name" "$minifier_name" "${FOLDERS[src]}/$minifier_name"
fi

if [[ -f $MINIFIER_PATH && ! -x $MINIFIER_PATH ]]; then
	chmod u+x "$MINIFIER_PATH"
fi

if [[ ! -f $MINIFIER_PATH || ! -x $MINIFIER_PATH ]]; then
	msg "The minifier \"$minifier_name\" can't be downloaded." "err"
	
	custom_exit 1
fi

# Beautifier

beautifier_name="js-beautify"
beautifier_package_name="jsbeautifier"
BEAUTIFIER_FOLDER="${FOLDERS[src]}/$beautifier_name"
declare -r BEAUTIFIER_FOLDER

if ! type -p "$beautifier_name" > /dev/null; then
	install_python_virt "$beautifier_package_name" "$beautifier_name" "$BEAUTIFIER_FOLDER"
fi

if [[ ! -f "$BEAUTIFIER_FOLDER/bin/$beautifier_name" ]]; then
	msg "Can't install the beautifier in \"$BEAUTIFIER_FOLDER\"." "err"
	
	custom_exit 1
fi

################################################################################
# SCRIPT
################################################################################

if [[ -n $namespace ]]; then
	base_name=$namespace$infix
else
	base_name="$DEFAULT_NAMESPACE-nons$infix"
fi

if [[ ! $base_name =~ ^"phpjed"("-"|$) ]]; then
	base_name="phpjed-$base_name"
fi

merged="$WORKSPACE/$base_name-merged-NOT-USABLE-IN-BROWSERS.js"
browser_ready="$WORKSPACE/$base_name.js"
minified="$WORKSPACE/$base_name.min.js"
compressed="$minified.gz"

declare -a ALL_FUNCTIONS

msg "$msg_distribution"

# Merge files and filter functions
##################################

msg "Merging Locutus files and filtering functions"

if is_locutus_main_index "$index"; then
	merge_files "$LOCUTUS_HELPERS_INDEX" "$merged"
fi

merge_files "$index" "$merged"

if [[ ! -f $merged ]]; then
	msg "Files can't be merged. The file \"$merged\" doesn't exist." "err"
	
	custom_exit 1
fi

# Convert for browser usage and obtain a PHPjed ready-to-use file
#################################################################

convert_for_browser_usage "$merged" "$browser_ready" "$namespace"

if [[ ! -f $browser_ready ]]; then
	msg "Conversion for browser usage failed. The file \"$browser_ready\" doesn't exist." "err"
	
	custom_exit 1
fi

rm "$merged"

if [[ -f $merged ]]; then
	add_warning "The temporary file \"$merged\" can't be deleted."
fi

beautify_file "$browser_ready"
prepend_to_file "$COPYRIGHT" "$browser_ready"

# Check if the merging, filtering and conversion processes missed a few cases
#############################################################################

check_file "$browser_ready" "$namespace"

# Minify PHPjed
###############

minify "$browser_ready" "$minified"

if [[ ! -f $minified ]]; then
	msg "PHPjed can't be minified. The file \"$minified\" doesn't exist." "err"
	
	custom_exit 1
fi

# Compress the minified file
############################

compress "$minified" "$compressed"

if [[ ! -f $compressed ]]; then
	msg "PHPjed can't be compressed. The file \"$compressed\" doesn't exist." "err"
	
	custom_exit 1
fi

# List functions included
#########################

display_functions "${ALL_FUNCTIONS[@]}"

# List all files generated
##########################

display_info_files "$browser_ready" "$minified" "$compressed" "$namespace" "$distribution"

# Warnings
##########

display_warnings
tag_files "warnings"

# Preview
#########

if [[ -f $browser_ready ]]; then
	msg "Here's a preview of the PHPjed unminified file:" "bold" false
	
	preview "$browser_ready"
	echo $'\n'
fi

if [[ -f $minified ]]; then
	msg "Here's a preview of the PHPjed minified file:" "bold" false
	
	preview "$minified"
	echo $'\n'
fi

if [[ -z ${WARNINGS[*]} && $PHPJED_DIST == true ]]; then
	cp "$browser_ready" "${FOLDERS[root]}/dist/unminified"
	
	file_name=${browser_ready##*/}
	file_name_without_ext=${file_name%".js"}
	file_ext=${file_name#"$file_name_without_ext"}
	file_with_version="${FOLDERS[root]}/dist/unminified/${file_name_without_ext%"-all"}-$PHPJED_VERSION$file_ext"
	
	cp "$browser_ready" "$file_with_version"
	
	if [[ ! -f $file_with_version ]]; then
		msg "Can't copy the file \"$browser_ready\" to \"$file_with_version\"." "err"
		
		exit 1
	fi
	
	cp "$minified" "${FOLDERS[root]}/dist"
	
	file_name=${minified##*/}
	file_name_without_ext=${file_name%".min.js"}
	file_ext=${file_name#"$file_name_without_ext"}
	file_with_version="${FOLDERS[root]}/dist/${file_name_without_ext%"-all"}-$PHPJED_VERSION$file_ext"
	
	cp "$minified" "$file_with_version"
	
	if [[ ! -f $file_with_version ]]; then
		msg "Can't copy the file \"$minified\" to \"$file_with_version\"." "err"
		
		exit 1
	fi
fi
