# Markdown basics

Zotermite-flavoured markdown (ZFM) is based upon github-flavoured markdown.

If you are not familiar with markdown, please check first [this documentation]( https://help.github.com/articles/basic-writing-and-formatting-syntax/) about the markdown language and its faculties.

# Zotermite-flavoured markdown

Zotermite works with a system of tags.
Tags allow you to populate your template with zotero-based values.

In ZFM, there are four types of tags :
* $set$ : value substitution
* $if$ and $endif$ : positive conditional
* $ifnot$ and $endifnot$ : negative conditionnal
* $loop$ and $endloop$ : recursivity

# $set$ and implicit set

This first tag allows you to replace some parts of your template with values coming from zotero about the selected items.

Let's say we want to get the title of our bibliographical record entitled "Alice in wonderland" :

If we write in our template description :

```
title : $set:title$
```

We will get in our output content :
```
title : Alice in Wonderland
```

Similarly, if you don't preceed your value key (here : "title") by the set statement, the tag will be considered as an implicit set statement. Thus:

```
Writing :

$set:title$

is the same as writing :

$title$

```

Todo : explain arrays access and properties access.

## Modificators

Template values can be modified through simple operations.

### uppercase and lowercase

Transforms your value casing to uppercase or lowercase:

```
$title:uppercase$
```

### initials

Fetch the initial of a value (made for first names of course, but do whatever you want with that):

```
$creators[0].firstName:initials$
```

### year

Extracts the year for a value (made for item dates of course, but do whatever you want with that):

```
$date:year$
```


# $if$ and $endif$

## Availability $if$

Conditionals that display some parts of your template only if a specific value is available.

Example :

```
$if:title$
Title : $title$
$endif:title$
```

You will note that the endif statement also features ":title" in order to be recognized.

## Comparator $if$

Conditionals that test your value against another.

```
$if:type:equals_to_book$
Book title : $title$
$endif:type:equals_to_book$
```


Here is a list of comparators available :
* equals_to_
* superior_to_
* inferior_to_
* superiorequals_to_
* inferiorequals_to_
* lengthequals_to_
* lengthsuperior_to_
* lengthinferior_to_
* lengthsuperiorequals_to_
* lengthinferiorequals_to_

Comparators begining with "length" will test the length of value (works for text and arrays such as list of creators).

# $ifnot$ and $endifnot$

Negative conditionals : display only if the condition is not fullfilled.

```
$ifnot:title$
No title
$endifnot:title$
```

# $loop$ and $endloop$

```
$loop:author in creators$
$author.lastName$
$endloop:author in creators$
```

Todo : explain separator and terminator
