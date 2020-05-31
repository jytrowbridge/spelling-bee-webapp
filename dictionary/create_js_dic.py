"""
This file creates a javascript Object from a given text file.

The Object is saved it in a separate .js file.
The Object has contains all lines of text from the file as keys,
and sets the value to 1.
"""

dic_file = 'Collins Scrabble Words (2019).txt'
with open(dic_file, 'r') as dic:
    words = dic.readlines()

while True:
    # skip header lines in text file
    line = words.pop(0)
    if line[0] == '#':  # The '#' symbol marks the last line of header
        break

words = [word.replace('\n', '') for word in words]  # remove blank line


def str_file_fmt(str, num_tabs=0, tab_spaces=2):
    """Add a line break and the specified number of tabs to a string."""
    return ' '*tab_spaces*num_tabs + str + '\n'


js_file = 'dictionary.js'
js_object_name = 'scrabDic'
with open(js_file, 'w') as js:
    js.write(str_file_fmt(f'let {js_object_name} = {{'))
    for word in words:
        js.write(str_file_fmt(f'{word}: 1,', 1))
    js.write(str_file_fmt('}'))
